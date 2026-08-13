"use client";

import { useEffect, useRef, useState } from "react";
import { DPad } from "./DPad";
import { PixelButton } from "./PixelButton";
import { drawSpelunker, px } from "@/lib/sprites";
import { blip } from "@/lib/audio";
import { useHeldControls } from "@/lib/useHeldControls";

const W = 320;
const H = 180;
const PLAYER_Y = 92;
const STAGE_LEN = 155;
const MAX_STAGE = 3;
const LIVES = 3;

/** Hitbox joueur = presque le sprite 12×18, légèrement plus petite. */
const PLAYER = { w: 10, h: 14 };

type Kind = "left" | "right" | "mid" | "flyer";
type Obstacle = { depth: number; kind: Kind; phase: number };
type Rect = { x: number; y: number; w: number; h: number };

function shaft(depth: number, stage: number) {
  const gap = 122 - stage * 10;
  const amp = 22 + stage * 6;
  const center = W / 2 + Math.sin(depth * 0.021 + stage * 0.55) * amp;
  return { left: center - gap / 2, right: center + gap / 2, center, gap };
}

function spawnObstacles(stage: number): Obstacle[] {
  const patterns: Kind[][] = [
    ["left", "mid", "right", "left"],
    ["right", "flyer", "left", "mid", "right"],
    ["left", "mid", "flyer", "right", "left", "mid"],
  ];
  const kinds = patterns[Math.min(stage, patterns.length - 1)];
  const start = 40;
  const span = STAGE_LEN - 58;
  return kinds.map((kind, i) => ({
    depth: start + ((i + 0.5) * span) / kinds.length,
    kind,
    phase: i * 1.7,
  }));
}

/** Rectangle écran de l'obstacle — le même pour le dessin et la collision. */
function obstacleRect(o: Obstacle, playerDepth: number, stage: number, t: number): Rect {
  const s = shaft(o.depth, stage);
  const cy = PLAYER_Y + (o.depth - playerDepth);
  if (o.kind === "left") return { x: s.left, y: cy - 8, w: 18, h: 16 };
  if (o.kind === "right") return { x: s.right - 18, y: cy - 8, w: 18, h: 16 };
  if (o.kind === "flyer") {
    const fx = s.center + Math.sin(t * 1.7 + o.phase) * (s.gap * 0.24);
    return { x: fx - 6, y: cy - 8, w: 12, h: 16 };
  }
  return { x: s.center - 10, y: cy - 8, w: 20, h: 16 };
}

function playerRect(pxPos: number): Rect {
  return {
    x: pxPos - PLAYER.w / 2,
    y: PLAYER_Y - PLAYER.h / 2,
    w: PLAYER.w,
    h: PLAYER.h,
  };
}

function hits(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function drawBlock(ctx: CanvasRenderingContext2D, r: Rect, kind: Kind) {
  const x = Math.round(r.x);
  const y = Math.round(r.y);
  const w = Math.round(r.w);
  const h = Math.round(r.h);
  if (kind === "flyer") {
    px(ctx, x + 2, y, w - 4, h, "#4d9aaa");
    px(ctx, x + 4, y - 2, w - 8, h + 4, "#d7f6ff");
    px(ctx, x, y + 4, w, 6, "#2a6a78");
    return;
  }
  if (kind === "mid") {
    px(ctx, x, y + 2, w, h - 2, "#5a5348");
    px(ctx, x + 1, y, w - 2, h - 1, "#7a7366");
    px(ctx, x + 2, y + 2, 4, 3, "#c4b8a4");
    return;
  }
  px(ctx, x, y, w, h, "#8b5a2b");
  px(ctx, x + 2, y + 2, w - 4, h - 4, "#c4894a");
  px(ctx, x + 4, y + 4, 3, 3, "#e8c48a");
}

type Props = { onWin: () => void };

export function RappelGame({ onWin }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { controls, setDpad } = useHeldControls();
  const [pit, setPit] = useState(1);
  const [won, setWon] = useState(false);
  const [hitsCount, setHitsCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    let stage = 0;
    let depth = 0;
    let x = W / 2;
    let facing: 1 | -1 = 1;
    let flash = 0;
    let lives = LIVES;
    let finished = false;
    let t = 0;
    let last = performance.now();
    let raf = 0;
    let obstacles = spawnObstacles(0);

    const resetRun = () => {
      stage = 0;
      depth = 0;
      lives = LIVES;
      flash = 1;
      obstacles = spawnObstacles(0);
      x = shaft(0, 0).center;
      setPit(1);
      setHitsCount(0);
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      flash = Math.max(0, flash - dt);

      if (!finished) {
        const before = shaft(depth, stage);
        depth += (42 + stage * 7) * dt;
        const here = shaft(depth, stage);
        x += here.center - before.center;
        x += controls.current.x * 145 * dt;
        if (controls.current.x < 0) facing = -1;
        if (controls.current.x > 0) facing = 1;

        const half = PLAYER.w / 2 + 1;
        x = Math.max(here.left + half, Math.min(here.right - half, x));

        const me = playerRect(x);
        if (flash <= 0) {
          for (const o of obstacles) {
            const block = obstacleRect(o, depth, stage, t);
            if (hits(me, block)) {
              flash = 0.85;
              lives -= 1;
              setHitsCount(LIVES - lives);
              blip(false);
              if (lives <= 0) resetRun();
              break;
            }
          }
        }

        if (depth >= STAGE_LEN) {
          depth = 0;
          stage += 1;
          setPit(Math.min(MAX_STAGE, stage + 1));
          blip(true);
          if (stage >= MAX_STAGE) {
            finished = true;
            setWon(true);
          } else {
            obstacles = spawnObstacles(stage);
            x = shaft(0, stage).center;
            flash = 0.6;
          }
        }

        ctx.fillStyle = "#070c0d";
        ctx.fillRect(0, 0, W, H);

        const drawStage = Math.min(stage, MAX_STAGE - 1);
        for (let y = 0; y < H; y++) {
          const world = depth + (y - PLAYER_Y);
          const s = shaft(world, drawStage);
          ctx.fillStyle = y % 16 < 2 ? "#15211f" : "#1b2826";
          ctx.fillRect(0, y, Math.max(0, s.left), 1);
          ctx.fillRect(s.right, y, W - s.right, 1);
          if (y % 32 === 0) {
            ctx.fillStyle = "#8b5a2b";
            ctx.fillRect(s.left - 2, y, s.right - s.left + 4, 3);
          }
        }

        for (const o of obstacles) {
          const block = obstacleRect(o, depth, drawStage, t);
          if (block.y + block.h < -4 || block.y > H + 4) continue;
          drawBlock(ctx, block, o.kind);
        }

        ctx.fillStyle = "#cfd8dc";
        ctx.fillRect(Math.round(x) - 1, 0, 2, PLAYER_Y - 8);
        if (flash === 0 || Math.floor(t * 14) % 2 === 0) {
          drawSpelunker(ctx, x, PLAYER_Y, Math.floor(t * 10), facing);
        }

        ctx.fillStyle = "#3a2a18";
        ctx.fillRect(W - 12, 10, 6, 84);
        ctx.fillStyle = "#f4a261";
        ctx.fillRect(W - 11, 11, 4, 82);
        ctx.fillStyle = "#ffe08a";
        const bar = Math.min(1, depth / STAGE_LEN);
        ctx.fillRect(W - 11, 11 + 82 - bar * 82, 4, bar * 82);
      } else {
        ctx.fillStyle = "#070c0d";
        ctx.fillRect(0, 0, W, H);
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [controls]);

  return (
    <div className="scene game-scene mine">
      <div className="hud">
        <span>Puits {Math.min(pit, 3)}/3</span>
        <span>Vies {Math.max(0, LIVES - hitsCount)}/3</span>
      </div>
      <canvas ref={canvasRef} className="pixel-canvas" />
      {won ? (
        <div className="win-overlay">
          <p>Au fond !</p>
          <PixelButton onClick={onWin}>L&apos;invitation</PixelButton>
        </div>
      ) : (
        <DPad mode="horizontal" onChange={setDpad} />
      )}
    </div>
  );
}
