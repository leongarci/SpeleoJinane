/** Dessin pixel. (x, y) = centre du sprite. */

export function px(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

const BODY_W = 12;
const BODY_H = 18;

function drawBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frame: number,
  facing: 1 | -1,
  paint: (ctx: CanvasRenderingContext2D) => void,
) {
  const bob = frame % 2 === 0 ? 0 : 1;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bob));
  if (facing < 0) ctx.scale(-1, 1);
  ctx.translate(-BODY_W / 2, -BODY_H / 2);
  paint(ctx);
  ctx.restore();
}

export function drawJinane(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frame: number,
  facing: 1 | -1 = 1,
) {
  drawBody(ctx, x, y, frame, facing, (c) => {
    px(c, 2, 0, 8, 5, "#3a2418");
    px(c, 1, 2, 10, 5, "#4a2c1a");
    px(c, 3, 3, 6, 5, "#e0a070");
    px(c, 4, 5, 1, 1, "#1a1208");
    px(c, 7, 5, 1, 1, "#1a1208");
    px(c, 5, 7, 2, 1, "#c45c4a");
    px(c, 3, 8, 6, 5, "#2a9d8f");
    px(c, 2, 9, 2, 3, "#e0a070");
    px(c, 8, 9, 2, 3, "#e0a070");
    px(c, 3, 13, 6, 3, "#e76f51");
    px(c, 3, 16, 2, 2, "#e0a070");
    px(c, 7, 16, 2, 2, "#e0a070");
  });
}

export function drawSpelunker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frame: number,
  facing: 1 | -1 = 1,
) {
  drawBody(ctx, x, y, frame, facing, (c) => {
    px(c, 3, 0, 6, 3, "#e76f51");
    px(c, 5, 1, 2, 2, "#ffe08a");
    px(c, 3, 3, 6, 4, "#e0a070");
    px(c, 4, 5, 1, 1, "#1a1208");
    px(c, 7, 5, 1, 1, "#1a1208");
    px(c, 3, 8, 6, 7, "#e76f51");
    px(c, 4, 9, 4, 2, "#1a1208");
    px(c, 2, 10, 2, 3, "#e0a070");
    px(c, 8, 10, 2, 3, "#e0a070");
    px(c, 3, 15, 2, 3, "#3a2418");
    px(c, 7, 15, 2, 3, "#3a2418");
  });
}

export function drawCrab(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  const pinch = Math.sin(t * 8) > 0 ? 0 : 1;
  ctx.save();
  ctx.translate(Math.round(x) - 6, Math.round(y) - 5);
  px(ctx, 2, 3, 8, 5, "#ee6c4d");
  px(ctx, 3, 4, 2, 2, "#1a1208");
  px(ctx, 7, 4, 2, 2, "#1a1208");
  px(ctx, 0, 2 - pinch, 3, 3, "#c44536");
  px(ctx, 9, 2 - pinch, 3, 3, "#c44536");
  px(ctx, 2, 8, 2, 2, "#c44536");
  px(ctx, 5, 8, 2, 2, "#c44536");
  px(ctx, 8, 8, 2, 2, "#c44536");
  ctx.restore();
}

export function drawTicket(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, x - 5, y - 2, 10, 7, "#f4e8c8");
  px(ctx, x - 4, y - 1, 3, 2, "#ee6c4d");
  px(ctx, x, y, 4, 1, "#2a9d8f");
}

export function drawBag(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, x - 4, y - 2, 8, 7, "#6b3f1f");
  px(ctx, x - 2, y - 4, 4, 3, "#4a2c1a");
  px(ctx, x - 1, y, 2, 2, "#f4a261");
}

export function drawLamp(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, x - 2, y - 4, 4, 3, "#cfd8dc");
  px(ctx, x - 1, y - 1, 2, 3, "#ffe08a");
  px(ctx, x - 2, y + 2, 4, 2, "#8d6e3f");
}

export function drawSilver(ctx: CanvasRenderingContext2D, x: number, y: number, glow: number) {
  px(ctx, x - 2, y - 2, 4, 4, glow > 0.5 ? "#ffffff" : "#c0c8d0");
  px(ctx, x - 1, y - 3, 2, 6, "#e8eef4");
  px(ctx, x - 3, y - 1, 6, 2, "#9aa7b5");
}

export function drawPlane(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, x, y + 3, 16, 4, "#eceff1");
  px(ctx, x + 12, y + 1, 6, 3, "#eceff1");
  px(ctx, x + 4, y, 8, 3, "#90caf9");
  px(ctx, x + 4, y + 6, 8, 3, "#90caf9");
  px(ctx, x + 16, y + 4, 3, 2, "#ee6c4d");
}

export function drawRock(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const rx = Math.round(x - w / 2);
  const ry = Math.round(y - h / 2);
  px(ctx, rx, ry + 2, w, h - 2, "#5a5348");
  px(ctx, rx + 1, ry, w - 2, h - 1, "#7a7366");
  px(ctx, rx + 2, ry + 2, 3, 3, "#c4b8a4");
  px(ctx, rx + w - 4, ry + h - 5, 3, 2, "#3d3830");
}

export function drawSpike(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, fromLeft: boolean) {
  const dir = fromLeft ? 1 : -1;
  const w = 16;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.fillStyle = "#8b5a2b";
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(dir * w, 0);
  ctx.lineTo(0, h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#c4894a";
  ctx.fillRect(dir > 0 ? 1 : -4, -2, 4, 4);
  ctx.restore();
}

export function drawCrystal(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  const glow = Math.sin(t * 6) > 0;
  px(ctx, x - 3, y - 6, 6, 12, glow ? "#7ec8e3" : "#4d9aaa");
  px(ctx, x - 1, y - 8, 2, 16, "#d7f6ff");
  px(ctx, x - 4, y - 2, 8, 4, "#2a6a78");
}
