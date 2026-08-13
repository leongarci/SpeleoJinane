"use client";

import { useEffect, useRef, useState } from "react";
import { DPad } from "./DPad";
import { PixelButton } from "./PixelButton";
import {
  drawBag,
  drawCrab,
  drawJinane,
  drawLamp,
  drawPlane,
  drawTicket,
} from "@/lib/sprites";
import { blip } from "@/lib/audio";
import { useHeldControls } from "@/lib/useHeldControls";

const W = 320;
const H = 180;
const LIVES = 3;

type Item = { id: "ticket" | "bag" | "lamp"; x: number; y: number; got: boolean };
type Crab = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

function makeItems(): Item[] {
  return [
    { id: "ticket", x: 268, y: 48, got: false },
    { id: "bag", x: 175, y: 118, got: false },
    { id: "lamp", x: 78, y: 38, got: false },
  ];
}

function makeCrabs(): Crab[] {
  return [
    { x: 90, y: 58, vx: 42, vy: 0, minX: 24, maxX: 160, minY: 58, maxY: 58 },
    { x: 210, y: 78, vx: -38, vy: 0, minX: 150, maxX: 300, minY: 78, maxY: 78 },
    { x: 140, y: 40, vx: 0, vy: 34, minX: 140, maxX: 140, minY: 28, maxY: 110 },
    { x: 48, y: 128, vx: 55, vy: 0, minX: 20, maxX: 200, minY: 128, maxY: 128 },
    { x: 260, y: 120, vx: -40, vy: 22, minX: 190, maxX: 300, minY: 50, maxY: 140 },
    { x: 300, y: 55, vx: -48, vy: 0, minX: 220, maxX: 308, minY: 55, maxY: 55 },
    { x: 110, y: 100, vx: 28, vy: -26, minX: 40, maxX: 180, minY: 36, maxY: 140 },
    { x: 24, y: 44, vx: 36, vy: 18, minX: 16, maxX: 90, minY: 30, maxY: 90 },
    { x: 175, y: 52, vx: -44, vy: 0, minX: 100, maxX: 240, minY: 52, maxY: 52 },
    { x: 250, y: 36, vx: 0, vy: 40, minX: 250, maxX: 250, minY: 28, maxY: 100 },
    { x: 70, y: 88, vx: 50, vy: 0, minX: 30, maxX: 130, minY: 88, maxY: 88 },
    { x: 310, y: 100, vx: -52, vy: -16, minX: 230, maxX: 312, minY: 40, maxY: 138 },
    { x: 160, y: 136, vx: -30, vy: 0, minX: 90, maxX: 250, minY: 136, maxY: 136 },
    { x: 200, y: 96, vx: 22, vy: 32, minX: 150, maxX: 270, minY: 40, maxY: 138 },
  ];
}

type Props = {
  onWin: () => void;
};

export function BeachGame({ onWin }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { controls, setDpad } = useHeldControls();
  const [hud, setHud] = useState(0);
  const [hits, setHits] = useState(0);
  const [won, setWon] = useState(false);
  const wonRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const player = { x: 40, y: 90, facing: 1 as 1 | -1, flash: 0 };
    let items = makeItems();
    let crabs = makeCrabs();
    let lives = LIVES;
    let planeX = -30;
    let t = 0;
    let last = performance.now();
    let raf = 0;

    const resetLevel = () => {
      player.x = 40;
      player.y = 90;
      player.facing = 1;
      player.flash = 0.9;
      items = makeItems();
      crabs = makeCrabs();
      lives = LIVES;
      setHud(0);
      setHits(0);
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;

      if (!wonRef.current) {
        const speed = 88;
        player.x += controls.current.x * speed * dt;
        player.y += controls.current.y * speed * dt;
        if (controls.current.x < 0) player.facing = -1;
        if (controls.current.x > 0) player.facing = 1;
        player.x = Math.max(10, Math.min(W - 10, player.x));
        player.y = Math.max(22, Math.min(142, player.y));

        player.flash = Math.max(0, player.flash - dt);

        for (const c of crabs) {
          c.x += c.vx * dt;
          c.y += c.vy * dt;
          if (c.x < c.minX || c.x > c.maxX) {
            c.vx *= -1;
            c.x = Math.max(c.minX, Math.min(c.maxX, c.x));
          }
          if (c.y < c.minY || c.y > c.maxY) {
            c.vy *= -1;
            c.y = Math.max(c.minY, Math.min(c.maxY, c.y));
          }
          if (Math.hypot(c.x - player.x, c.y - player.y) < 11 && player.flash <= 0) {
            player.flash = 0.85;
            const ang = Math.atan2(player.y - c.y, player.x - c.x);
            player.x += Math.cos(ang) * 14;
            player.y += Math.sin(ang) * 14;
            lives -= 1;
            setHits(LIVES - lives);
            blip(false);
            if (lives <= 0) resetLevel();
          }
        }

        for (const it of items) {
          if (it.got) continue;
          if (Math.hypot(it.x - player.x, it.y - player.y) < 12) {
            it.got = true;
            blip(true);
            const n = items.filter((i) => i.got).length;
            setHud(n);
            if (n === 3) {
              wonRef.current = true;
              setWon(true);
            }
          }
        }
      } else {
        planeX += 90 * dt;
      }

      ctx.fillStyle = "#7ec8e3";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#f4d35e";
      ctx.fillRect(0, 70, W, H);
      ctx.fillStyle = "#2ec4b6";
      ctx.fillRect(0, 150, W, 30);
      const wave = Math.sin(t * 3) * 3;
      ctx.fillStyle = "#1b9aaa";
      ctx.fillRect(0, 150 + wave, W, 4);

      ctx.fillStyle = "#6b3f1f";
      ctx.fillRect(18, 28, 4, 50);
      ctx.fillRect(292, 22, 4, 55);
      ctx.fillStyle = "#2d6a4f";
      ctx.fillRect(6, 22, 28, 10);
      ctx.fillRect(280, 14, 28, 10);

      ctx.fillStyle = "#c44536";
      ctx.fillRect(200, 48, 40, 8);
      ctx.fillStyle = "#e8d5a3";
      ctx.fillRect(208, 56, 24, 18);

      for (const it of items) {
        if (it.got) continue;
        const bounce = Math.sin(t * 4 + it.x) * 2;
        if (it.id === "ticket") drawTicket(ctx, it.x, it.y + bounce);
        if (it.id === "bag") drawBag(ctx, it.x, it.y + bounce);
        if (it.id === "lamp") drawLamp(ctx, it.x, it.y + bounce);
      }

      for (const c of crabs) drawCrab(ctx, c.x, c.y, t);

      if (player.flash === 0 || Math.floor(t * 12) % 2 === 0) {
        drawJinane(ctx, player.x, player.y, Math.floor(t * 8), player.facing);
      }

      if (wonRef.current) {
        drawPlane(ctx, planeX, 28);
        ctx.fillStyle = "rgba(10,18,20,0.35)";
        ctx.fillRect(0, 0, W, H);
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [controls]);

  return (
    <div className="scene game-scene">
      <div className="hud">
        <span>Lagon</span>
        <span>{hud}/3 objets · Vies {Math.max(0, LIVES - hits)}/3</span>
      </div>
      <canvas ref={canvasRef} className="pixel-canvas" />
      {won ? (
        <div className="win-overlay">
          <p>Décollage !</p>
          <PixelButton onClick={onWin}>Vers la France</PixelButton>
        </div>
      ) : (
        <DPad onChange={setDpad} />
      )}
    </div>
  );
}
