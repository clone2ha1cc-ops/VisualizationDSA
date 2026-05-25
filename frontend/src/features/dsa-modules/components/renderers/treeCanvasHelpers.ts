import type { CanvasRenderingContext2D } from 'undici-types';

export const NODE_RADIUS  = 22;
export const LEVEL_HEIGHT = 70;
export const MARGIN_TOP   = 50;

const COLOR_NODE   = '#1E293B';
const COLOR_BORDER = '#475569';
const COLOR_ACTIVE = '#FBBF24';
const COLOR_TEXT   = '#FFFFFF';
const COLOR_EDGE   = '#475569';

export function drawEdge(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const fromX = x1 + Math.cos(angle) * NODE_RADIUS;
  const fromY = y1 + Math.sin(angle) * NODE_RADIUS;
  const toX   = x2 - Math.cos(angle) * NODE_RADIUS;
  const toY   = y2 - Math.sin(angle) * NODE_RADIUS;
  ctx.strokeStyle = COLOR_EDGE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
  const arrowLen = 8;
  ctx.fillStyle = COLOR_EDGE;
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - arrowLen * Math.cos(angle - Math.PI / 6), toY - arrowLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - arrowLen * Math.cos(angle + Math.PI / 6), toY - arrowLen * Math.sin(angle + Math.PI / 6));
  ctx.fill();
}

export function drawNode(ctx: CanvasRenderingContext2D, x: number, y: number, value: number, isActive: boolean): void {
  ctx.beginPath();
  ctx.arc(x, y, NODE_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = isActive ? COLOR_ACTIVE : COLOR_NODE;
  ctx.fill();
  ctx.strokeStyle = isActive ? COLOR_ACTIVE : COLOR_BORDER;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = isActive ? '#0F172A' : COLOR_TEXT;
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(value), x, y);
}
