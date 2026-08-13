"use client";

import { useEffect, useRef, useState } from "react";
import { DPad } from "./DPad";
import { PixelButton } from "./PixelButton";
import { drawSilver, drawSpelunker } from "@/lib/sprites";
import { blip } from "@/lib/audio";
import { useHeldControls } from "@/lib/useHeldControls";

const COLS = 15;
const ROWS = 13;
const TILE = 16;
const W = COLS * TILE;
const H = ROWS * TILE;
const STRIDE = 17;
const TS = 16;
const HIT = 0.28;

function generateMaze(cols: number, rows: number): number[][] {
  const g = Array.from({ length: rows }, () => Array(cols).fill(1));
  const stack: [number, number][] = [[1, 1]];
  g[1][1] = 0;
  const dirs: [number, number][] = [
    [0, -2],
    [2, 0],
    [0, 2],
    [-2, 0],
  ];
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const nbs = dirs
      .map(([dx, dy]) => [x + dx, y + dy, dx, dy] as const)
      .filter(
        ([nx, ny]) =>
          ny > 0 && ny < rows - 1 && nx > 0 && nx < cols - 1 && g[ny][nx] === 1,
      );
    if (!nbs.length) {
      stack.pop();
      continue;
    }
    const [nx, ny, dx, dy] = nbs[Math.floor(Math.random() * nbs.length)];
    g[y + dy / 2][x + dx / 2] = 0;
    g[ny][nx] = 0;
    stack.push([nx, ny]);
  }
  g[rows - 2][cols - 2] = 0;
  g[rows - 2][cols - 3] = 0;
  return g;
}

type Props = { onWin: () => void };

export function MazeGame({ onWin }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tilesRef = useRef<HTMLImageElement | null>(null);
  const { controls, setDpad } = useHeldControls();
  const [hud, setHud] = useState(0);
  const [won, setWon] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = "/assets/kenney/Spritesheet/roguelikeDungeon_transparent.png";
    img.onload = () => {
      tilesRef.current = img;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const maze = generateMaze(COLS, ROWS);
    const floors: [number, number][] = [];
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (maze[y][x] === 0) floors.push([x, y]);
      }
    }
    const player = { x: 1.5, y: 1.5, facing: 1 as 1 | -1 };
    const exit = { x: COLS - 2, y: ROWS - 2 };
    const silvers: { x: number; y: number; got: boolean }[] = [];
    for (const [x, y] of floors) {
      if (silvers.length >= 3) break;
      if ((x === 1 && y === 1) || (x === exit.x && y === exit.y)) continue;
      if ((x + y) % 7 === 0) silvers.push({ x, y, got: false });
    }
    while (silvers.length < 3) {
      const [x, y] = floors[Math.floor(Math.random() * floors.length)];
      if (!silvers.some((s) => s.x === x && s.y === y) && !(x === 1 && y === 1)) {
        silvers.push({ x, y, got: false });
      }
    }

    const cellOpen = (x: number, y: number) => {
      const cx = Math.floor(x);
      const cy = Math.floor(y);
      if (cy < 0 || cx < 0 || cy >= ROWS || cx >= COLS) return false;
      return maze[cy][cx] === 0;
    };
    const fits = (x: number, y: number) =>
      cellOpen(x - HIT, y - HIT) &&
      cellOpen(x + HIT, y - HIT) &&
      cellOpen(x - HIT, y + HIT) &&
      cellOpen(x + HIT, y + HIT);

    let t = 0;
    let last = performance.now();
    let raf = 0;
    let finished = false;

    const blit = (col: number, row: number, dx: number, dy: number) => {
      const img = tilesRef.current;
      if (!img) return;
      ctx.drawImage(img, col * STRIDE, row * STRIDE, TS, TS, dx, dy, TILE, TILE);
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;

      if (!finished) {
        const speed = 4.4;
        const nx = player.x + controls.current.x * speed * dt;
        const ny = player.y + controls.current.y * speed * dt;
        if (controls.current.x < 0) player.facing = -1;
        if (controls.current.x > 0) player.facing = 1;
        if (fits(nx, player.y)) player.x = nx;
        if (fits(player.x, ny)) player.y = ny;

        for (const s of silvers) {
          if (s.got) continue;
          if (Math.hypot(s.x + 0.5 - player.x, s.y + 0.5 - player.y) < 0.55) {
            s.got = true;
            blip(true);
            const n = silvers.filter((i) => i.got).length;
            setHud(n);
          }
        }

        const gotAll = silvers.every((s) => s.got);
        if (
          gotAll &&
          Math.hypot(exit.x + 0.5 - player.x, exit.y + 0.5 - player.y) < 0.7
        ) {
          finished = true;
          setWon(true);
          blip(true);
        }
      }

      ctx.fillStyle = "#070c0d";
      ctx.fillRect(0, 0, W, H);

      const px = player.x;
      const py = player.y;
      const radius = 3.2;

      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const dist = Math.hypot(x + 0.5 - px, y + 0.5 - py);
          if (dist > radius + 0.6) continue;
          const dx = x * TILE;
          const dy = y * TILE;
          if (maze[y][x] === 1) {
            ctx.fillStyle = "#243332";
            ctx.fillRect(dx, dy, TILE, TILE);
            blit(0, 0, dx, dy);
            ctx.fillStyle = "#1b2826";
            ctx.fillRect(dx, dy + TILE - 3, TILE, 3);
          } else {
            ctx.fillStyle = "#3d3428";
            ctx.fillRect(dx, dy, TILE, TILE);
            blit(6, 2, dx, dy);
            ctx.fillStyle = "#2a241c";
            if ((x + y) % 2 === 0) ctx.fillRect(dx + 4, dy + 4, 2, 2);
          }
          if (x === exit.x && y === exit.y) {
            ctx.fillStyle = "#f4a261";
            ctx.fillRect(dx + 3, dy + 2, 10, 12);
            blit(2, 8, dx, dy);
          }
        }
      }

      for (const s of silvers) {
        if (s.got) continue;
        const dist = Math.hypot(s.x + 0.5 - px, s.y + 0.5 - py);
        if (dist > radius) continue;
        drawSilver(ctx, s.x * TILE + 8, s.y * TILE + 8, (Math.sin(t * 6) + 1) / 2);
      }

      drawSpelunker(
        ctx,
        player.x * TILE,
        player.y * TILE,
        Math.floor(t * 8),
        player.facing,
      );

      const g = ctx.createRadialGradient(
        px * TILE,
        py * TILE,
        8,
        px * TILE,
        py * TILE,
        radius * TILE,
      );
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(0.55, "rgba(0,0,0,0.15)");
      g.addColorStop(1, "rgba(0,0,0,0.82)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [controls]);

  return (
    <div className="scene game-scene mine">
      <div className="hud">
        <span>Mine d&apos;argent</span>
        <span>{hud}/3 pépites</span>
      </div>
      <canvas ref={canvasRef} className="pixel-canvas maze-canvas" />
      {won ? (
        <div className="win-overlay">
          <p>La sortie !</p>
          <PixelButton onClick={onWin}>Les puits</PixelButton>
        </div>
      ) : (
        <DPad onChange={setDpad} />
      )}
    </div>
  );
}
