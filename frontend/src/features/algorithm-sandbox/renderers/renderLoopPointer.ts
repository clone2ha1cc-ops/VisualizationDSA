import type { AnimatedItem } from '../types/canvas.types';

const POINTER_COLORS: Record<string, string> = {
  i: '#a78bfa',  // violet
  j: '#f472b6',  // pink
};

/**
 * renderLoopPointer — vẽ arrow pointer cho biến vòng lặp (i, j, k...).
 * Pure function: không có side effect ngoài draw calls lên ctx.
 */
export function renderLoopPointers(
  ctx: CanvasRenderingContext2D,
  loopVariables: Record<string, number>,
  items: AnimatedItem[],
  slotWidth: number
) {
  let pointerOffset = 0;

  Object.entries(loopVariables).forEach(([varName, indexVal]) => {
    const idx = Number(indexVal);
    if (idx < 0 || idx >= items.length) return;

    const item = items[idx];
    const x = item.currentX + slotWidth / 2;
    const arrowY = 45 - pointerOffset;
    const color = POINTER_COLORS[varName] ?? '#e2e8f0';

    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;

    // Arrow triangle
    ctx.beginPath();
    ctx.moveTo(x, 70);
    ctx.lineTo(x - 5, 62);
    ctx.lineTo(x + 5, 62);
    ctx.closePath();
    ctx.fill();

    // Arrow stem
    ctx.beginPath();
    ctx.moveTo(x, 70);
    ctx.lineTo(x, arrowY);
    ctx.stroke();

    // Label badge
    ctx.beginPath();
    ctx.roundRect(x - 12, arrowY - 18, 24, 18, 4);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px "Outfit", "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(varName, x, arrowY - 9);

    ctx.restore();
    pointerOffset += 24;
  });
}
