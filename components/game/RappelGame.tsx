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
const GAP = 126;
const LEFT = (W - GAP) / 2;
const RIGHT = LEFT + GAP;
const LANES = 3;
const LANE_W = GAP / LANES;
const PLAYER = { w: 10, h: 14 };
const SPAWN_AHEAD = 200;

type Lane = 0 | 1 | 2;
type Obstacle = { depth: number; lane: Lane };
type Rect = { x: number; y: number; w: number; h: number };

function laneX(lane: Lane) {
  return LEFT + LANE_W * lane + LANE_W / 2;
}

function laneRect(lane: Lane, cy: number, h = 18): Rect {
  return {
    x: LEFT + lane * LANE_W + 2,
    y: cy - h / 2,
    w: LANE_W - 4,
    h,
  };
}

function shuffleLanes(): Lane[] {
  const lanes: Lane[] = [0, 1, 2];
  for (let i = lanes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = lanes[i]!;
    lanes[i] = lanes[j]!;
    lanes[j] = tmp;
  }
  return lanes;
}

/** 1 ou 2 couloirs bloqués, jamais les 3. */
function randomBlocked(): Lane[] {
  const count = Math.random() < 0.4 ? 2 : 1;
  return shuffleLanes().slice(0, count);
}

function spawnGap(elapsed: number) {
  const u = Math.min(1, elapsed / GOAL);
  return 1.15 - u * 0.35;
}

function obstacleRect(o: Obstacle, playerDepth: number): Rect {
  const cy = PLAYER_Y + (o.depth - playerDepth);
  return laneRect(o.lane, cy, 18);
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

function drawBlock(ctx: CanvasRenderingContext2D, r: Rect, lane: Lane) {
  const x = Math.round(r.x);
  const y = Math.round(r.y);
  const w = Math.round(r.w);
  const h = Math.round(r.h);
  const fill = lane === 1 ? "#7a7366" : "#8b5a2b";
  const hi = lane === 1 ? "#c4b8a4" : "#c4894a";
  px(ctx, x, y, w, h, fill);
  px(ctx, x + 2, y + 2, w - 4, h - 4, hi);
  px(ctx, x + 4, y + 4, 4, 3, "#e8c48a");
}

function fallSpeed(elapsed: number) {
  const u = Math.min(1, elapsed / GOAL);
  return 58 + u * 52;
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
    let lane: Lane = 1;
    let x = laneX(1);
    let facing: 1 | -1 = 1;
    let flash = 0;
    let lives = LIVES;
    let elapsed = 0;
    let finished = false;
    let t = 0;
    let last = performance.now();
    let raf = 0;
    let obstacles: Obstacle[] = [];
    let spawnWait = 0.8;
    let hudTick = 0;
    let prevInput = 0;

    const spawnRow = () => {
      const at = depth + SPAWN_AHEAD;
      for (const blocked of randomBlocked()) {
        obstacles.push({ depth: at, lane: blocked });
      }
    };

    const resetRun = () => {
      depth = 0;
      lane = 1;
      x = laneX(1);
      lives = LIVES;
      elapsed = 0;
      flash = 1;
      prevInput = 0;
      obstacles = [];
      spawnWait = 0.8;
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

        spawnWait -= dt;
        if (spawnWait <= 0) {
          spawnRow();
          spawnWait = spawnGap(elapsed);
        }
        if (obstacles.length > 24) {
          obstacles = obstacles.filter((o) => o.depth > depth - 40);
        }

        const input = controls.current.x;
        if (input < 0 && prevInput >= 0) {
          lane = (Math.max(0, lane - 1) as Lane);
          facing = -1;
        }
        if (input > 0 && prevInput <= 0) {
          lane = (Math.min(2, lane + 1) as Lane);
          facing = 1;
        }
        prevInput = input;

        const target = laneX(lane);
        x += (target - x) * Math.min(1, 18 * dt);

        const me = playerRect(x);
        if (flash <= 0) {
          for (const o of obstacles) {
            const block = obstacleRect(o, depth);
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
          ctx.fillStyle = "#243332";
          ctx.fillRect(LEFT + LANE_W - 1, y, 2, 1);
          ctx.fillRect(LEFT + LANE_W * 2 - 1, y, 2, 1);
          if (Math.floor(world) % 32 === 0) {
            ctx.fillStyle = "#8b5a2b";
            ctx.fillRect(LEFT - 2, y, GAP + 4, 3);
          }
        }

        for (const o of obstacles) {
          const block = obstacleRect(o, depth);
          if (block.y + block.h < -4 || block.y > H + 4) continue;
          drawBlock(ctx, block, o.lane);
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
