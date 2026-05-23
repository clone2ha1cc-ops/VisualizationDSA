import type { AnimatedItem } from '../types/canvas.types';
import type { BarStatus } from '../types/sorting.types';

// ─── NEON COLOR MAP ───────────────────────────────────────────────────────────
/** Màu Neon HSL theo trạng thái bar — đồng bộ với Sprint 2 spec */
const STATUS_COLORS: Record<BarStatus, { r: number; g: number; b: number }> = {
  IDLE:      { r: 6,   g: 182, b: 212 },  // Cyan  #06b6d4
  COMPARING: { r: 245, g: 158, b: 11  },  // Amber #f59e0b
  PIVOT:     { r: 251, g: 191, b: 36  },  // Yellow #fbbf24
  SWAPPED:   { r: 244, g: 63,  b: 94  },  // Rose  #f43f5e
  SORTED:    { r: 16,  g: 185, b: 129 },  // Emerald #10b981
};

/**
 * renderSortBar — [RENDER] Vẽ một cột bar sắp xếp với hiệu ứng Neon Glow.
 * Hỗ trợ đầy đủ 5 trạng thái BarStatus từ Sprint 2.
 * Pure function — không side-effect ngoài ctx draw calls.
 */
export function renderSortBar(
  ctx: CanvasRenderingContext2D,
  item: AnimatedItem,
  idx: number,
  maxVal: number,
  slotWidth: number,
  slotHeight: number,
  status: BarStatus = 'IDLE',
  /** Độ lệch Y thêm vào (dùng cho hiệu ứng cung parabol hoán vị) */
  arcOffsetY = 0
): void {
  const x = item.currentX;
  const baseY = 80 + arcOffsetY;
  const cardH = Math.max((item.value / Math.max(maxVal, 1)) * slotHeight, 28);
  const scale = item.currentScale;

  const colorSrc = STATUS_COLORS[status];
  const { r, g, b } = colorSrc;
  const colorStr = `rgb(${r}, ${g}, ${b})`;

  ctx.save();

  // Scale pivot/swap bars to pop out visually
  if (status !== 'IDLE') {
    ctx.translate(x + slotWidth / 2, baseY + cardH / 2);
    ctx.scale(scale, scale);
    ctx.translate(-(x + slotWidth / 2), -(baseY + cardH / 2));
  }

  // Gradient fill
  const grad = ctx.createLinearGradient(x, baseY, x, baseY + cardH);
  if (status === 'IDLE') {
    grad.addColorStop(0, 'rgba(6, 182, 212, 0.70)');
    grad.addColorStop(1, 'rgba(59, 130, 246, 0.12)');
  } else if (status === 'SORTED') {
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.65)`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.10)`);
  } else {
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.90)`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.18)`);
  }

  // Neon glow intensity
  ctx.shadowBlur  = status === 'IDLE' ? 6 : status === 'SORTED' ? 12 : 24;
  ctx.shadowColor = colorStr;
  ctx.fillStyle   = grad;
  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.85)`;
  ctx.lineWidth   = status === 'IDLE' ? 1.5 : 2.5;

  ctx.beginPath();
  ctx.roundRect(x, baseY, slotWidth, cardH, 10);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // SORTED checkmark stripe at top
  if (status === 'SORTED') {
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.25)`;
    ctx.fillRect(x + 2, baseY, slotWidth - 4, 5);
  }

  // Value label
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px "Outfit", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(item.value.toString(), x + slotWidth / 2, baseY + cardH / 2);

  // Index label below
  ctx.fillStyle = status === 'IDLE' ? '#64748b' : colorStr;
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillText(`[${idx}]`, x + slotWidth / 2, baseY + cardH + 18);

  ctx.restore();
}

/**
 * renderPivotLabel — Vẽ badge "PIVOT" nổi phía trên cột pivot.
 */
export function renderPivotLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  slotWidth: number,
  topY = 55
): void {
  const cx = x + slotWidth / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(251, 191, 36, 0.18)';
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.9)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cx - 22, topY - 14, 44, 16, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 9px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PIVOT', cx, topY - 6);
  ctx.restore();
}
