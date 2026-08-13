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
const LIVES = 3;
const GOAL = 40;
const GAP = 118;
const LEFT = (W - GAP) / 2;
const RIGHT = LEFT + GAP;
const CENTER = W / 2;
const SPACING = 108;
const PLAYER = { w: 10, h: 14 };

type Kind = "left" | "right" | "mid" | "flyer";
type Obstacle = { depth: number; kind: Kind; phase: number };
type Rect = { x: number; y: number; w: number; h: number };

function spawnCourse(): Obstacle[] {
  const pattern: Kind[] = [
    "left",
    "right",
    "left",
    "mid",
    "right",
    "flyer",
    "left",
    "right",
    "mid",
    "left",
    "right",
    "flyer",
    "mid",
    "right",
    "left",
  ];
  const list: Obstacle[] = [];
  for (let i = 0; i < 40; i++) {
    list.push({
      depth: 80 + i * SPACING,
      kind: pattern[i % pattern.length],
      phase: i * 1.3,
    });
  }
  return list;
}

function obstacleRect(o: Obstacle, playerDepth: number, t: number): Rect {
  const cy = PLAYER_Y + (o.depth - playerDepth);
  if (o.kind === "left") return { x: LEFT, y: cy - 8, w: 22, h: 16 };
  if (o.kind === "right") return { x: RIGHT - 22, y: cy - 8, w: 22, h: 16 };
  if (o.kind === "flyer") {
    const fx = CENTER + Math.sin(t * 1.45 + o.phase) * 28;
    return { x: fx - 6, y: cy - 8, w: 12, h: 16 };
  }
  return { x: CENTER - 9, y: cy - 8, w: 18, h: 16 };
}

function playerRect(x: number): Rect {
  return {
    x: x - PLAYER.w / 2,
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

function fallSpeed(elapsed: number) {
  const u = Math.min(1, elapsed / GOAL);
  return 42 + u * 40;
}

type Props = { onWin: () => void };

export function RappelGame({ onWin }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { controls, setDpad } = useHeldControls();
  const [won, setWon] = useState(false);
  const [hitsCount, setHitsCount] = useState(0);
  const [remain, setRemain] = useState(GOAL);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    let depth = 0;
    let x = CENTER;
    let facing: 1 | -1 = 1;
    let flash = 0;
    let lives = LIVES;
    let elapsed = 0;
    let finished = false;
    let t = 0;
    let last = performance.now();
    let raf = 0;
    let obstacles = spawnCourse();
    let hudTick = 0;

    const resetRun = () => {
      depth = 0;
      x = CENTER;
      lives = LIVES;
      elapsed = 0;
      flash = 1;
      obstacles = spawnCourse();
      setHitsCount(0);
      setRemain(GOAL);
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      flash = Math.max(0, flash - dt);

      if (!finished) {
        elapsed += dt;
        depth += fallSpeed(elapsed) * dt;
        x += controls.current.x * 150 * dt;
        if (controls.current.x < 0) facing = -1;
        if (controls.current.x > 0) facing = 1;

        const half = PLAYER.w / 2 + 1;
        x = Math.max(LEFT + half, Math.min(RIGHT - half, x));

        const me = playerRect(x);
        if (flash <= 0) {
          for (const o of obstacles) {
            const block = obstacleRect(o, depth, t);
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

        hudTick += dt;
        if (hudTick > 0.1) {
          hudTick = 0;
          setRemain(Math.max(0, GOAL - elapsed));
        }

        if (elapsed >= GOAL) {
          finished = true;
          setRemain(0);
          setWon(true);
          blip(true);
        }

        ctx.fillStyle = "#070c0d";
        ctx.fillRect(0, 0, W, H);

        for (let y = 0; y < H; y++) {
          const world = depth + (y - PLAYER_Y);
          ctx.fillStyle = y % 16 < 2 ? "#15211f" : "#1b2826";
          ctx.fillRect(0, y, LEFT, 1);
          ctx.fillRect(RIGHT, y, W - RIGHT, 1);
          if (Math.floor(world) % 32 === 0) {
            ctx.fillStyle = "#8b5a2b";
            ctx.fillRect(LEFT - 2, y, GAP + 4, 3);
          }
        }

        for (const o of obstacles) {
          const block = obstacleRect(o, depth, t);
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
        const bar = Math.min(1, elapsed / GOAL);
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

  const secs = remain.toFixed(1);

  return (
    <div className="scene game-scene mine">
      <div className="hud">
        <span>{secs}s</span>
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
