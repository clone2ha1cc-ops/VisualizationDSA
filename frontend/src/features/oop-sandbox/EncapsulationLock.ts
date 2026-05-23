/**
 * EncapsulationLock - Hiệu ứng ổ khóa bảo vệ và cảnh báo vi phạm đóng gói
 *
 * Sprint 6: OOP Concepts Visualizer
 * - Ổ khóa Neon đại diện cho access modifiers
 * - Hiệu ứng rung lắc khi vi phạm truy cập private
 * - Laser beam animation cho cảnh báo
 */

import type { AccessModifier } from "./OOPReflectionEngine";

export interface LockConfig {
  x: number;
  y: number;
  size: number;
  modifier: AccessModifier;
  isViolated: boolean;
}

export interface LaserBeam {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
  opacity: number;
}

/**
 * Vẽ ổ khóa trên Canvas với hiệu ứng Neon theo access modifier
 */
export function drawAccessLock(
  ctx: CanvasRenderingContext2D,
  config: LockConfig,
): void {
  const { x, y, size, modifier, isViolated } = getLockStyles(config);

  ctx.save();

  // Glow effect
  ctx.shadowBlur = isViolated ? 20 : 15;
  ctx.shadowColor =
    modifier === "PRIVATE"
      ? "#ef4444" // Red for private
      : modifier === "PROTECTED"
        ? "#eab308" // Yellow for protected
        : "#22c55e"; // Green for public

  // Lock body (rounded rectangle)
  const bodyWidth = size * 0.8;
  const bodyHeight = size * 0.6;
  const bodyX = x - bodyWidth / 2;
  const bodyY = y - bodyHeight / 2 + size * 0.15;

  // Fill with gradient
  const gradient = ctx.createLinearGradient(
    bodyX,
    bodyY,
    bodyX,
    bodyY + bodyHeight,
  );
  if (modifier === "PRIVATE") {
    gradient.addColorStop(0, isViolated ? "#ef4444" : "#7f1d1d");
    gradient.addColorStop(1, isViolated ? "#dc2626" : "#991b1b");
  } else if (modifier === "PROTECTED") {
    gradient.addColorStop(0, "#eab308");
    gradient.addColorStop(1, "#a16207");
  } else {
    gradient.addColorStop(0, "#22c55e");
    gradient.addColorStop(1, "#15803d");
  }

  // Vi phạm: hiệu ứng rung lắc
  let shakeX = 0;
  let shakeY = 0;
  if (isViolated) {
    shakeX = (Math.random() - 0.5) * 4;
    shakeY = (Math.random() - 0.5) * 4;
  }

  // Draw lock shackle (phần vòng)
  ctx.beginPath();
  ctx.arc(x + shakeX, bodyY - size * 0.25 + shakeY, size * 0.25, Math.PI, 0);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = size * 0.1;
  ctx.stroke();

  // Draw lock body
  ctx.beginPath();
  ctx.roundRect(
    bodyX + shakeX,
    bodyY + shakeY,
    bodyWidth,
    bodyHeight,
    size * 0.1,
  );
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = isViolated ? "#fecaca" : "#ffffff";
  ctx.lineWidth = isViolated ? 3 : 2;
  ctx.stroke();

  // Draw keyhole
  ctx.beginPath();
  ctx.arc(
    x + shakeX,
    bodyY + bodyHeight * 0.35 + shakeY,
    size * 0.08,
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = isViolated ? "#fecaca" : "#1e293b";
  ctx.fill();

  // Keyhole bottom (triangle)
  ctx.beginPath();
  ctx.moveTo(x - size * 0.03 + shakeX, bodyY + bodyHeight * 0.4 + shakeY);
  ctx.lineTo(x + size * 0.03 + shakeX, bodyY + bodyHeight * 0.4 + shakeY);
  ctx.lineTo(x + shakeX, bodyY + bodyHeight * 0.6 + shakeY);
  ctx.closePath();
  ctx.fillStyle = isViolated ? "#fecaca" : "#1e293b";
  ctx.fill();

  // Violation warning text
  if (isViolated) {
    ctx.font = `bold ${size * 0.25}px monospace`;
    ctx.fillStyle = "#ef4444";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#ef4444";
    ctx.fillText("🔒 PRIVATE!", x, bodyY - size * 0.4);
  }

  ctx.restore();
}

/**
 * Vẽ tia laser cảnh báo vi phạm đóng gói
 */
export function drawViolationLaser(
  ctx: CanvasRenderingContext2D,
  beam: LaserBeam,
): void {
  ctx.save();

  // Glow effect
  ctx.shadowBlur = 20;
  ctx.shadowColor = beam.color;

  // Main laser line
  ctx.beginPath();
  ctx.moveTo(beam.x1, beam.y1);
  ctx.lineTo(beam.x2, beam.y2);
  ctx.strokeStyle = beam.color;
  ctx.lineWidth = beam.width;
  ctx.globalAlpha = beam.opacity;
  ctx.stroke();

  // Inner bright core
  ctx.beginPath();
  ctx.moveTo(beam.x1, beam.y1);
  ctx.lineTo(beam.x2, beam.y2);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = beam.width * 0.5;
  ctx.globalAlpha = beam.opacity * 1.5;
  ctx.stroke();

  // Spark at impact point
  ctx.beginPath();
  ctx.arc(beam.x2, beam.y2, beam.width * 1.5, 0, Math.PI * 2);
  ctx.fillStyle = beam.color;
  ctx.globalAlpha = beam.opacity * 2;
  ctx.fill();

  ctx.restore();
}

/**
 * Tạo animation rung lắc cho lock khi vi phạm
 */
export function createShakeAnimation(
  baseX: number,
  baseY: number,
  intensity: number = 4,
): { x: number; y: number } {
  return {
    x: baseX + (Math.random() - 0.5) * intensity,
    y: baseY + (Math.random() - 0.5) * intensity,
  };
}

/**
 * Lấy màu sắc cho từng access modifier
 */
export function getModifierColor(modifier: AccessModifier): {
  primary: string;
  glow: string;
  bg: string;
} {
  switch (modifier) {
    case "PRIVATE":
      return {
        primary: "#ef4444",
        glow: "rgba(239, 68, 68, 0.6)",
        bg: "rgba(239, 68, 68, 0.15)",
      };
    case "PROTECTED":
      return {
        primary: "#eab308",
        glow: "rgba(234, 179, 8, 0.6)",
        bg: "rgba(234, 179, 8, 0.15)",
      };
    case "PUBLIC":
      return {
        primary: "#22c55e",
        glow: "rgba(34, 197, 94, 0.6)",
        bg: "rgba(34, 197, 94, 0.15)",
      };
    default:
      return {
        primary: "#64748b",
        glow: "rgba(100, 116, 139, 0.6)",
        bg: "rgba(100, 116, 139, 0.15)",
      };
  }
}

/**
 * Vẽ badge cho access modifier (dùng trong UI)
 */
export function drawModifierBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  modifier: AccessModifier,
  width: number = 60,
  height: number = 20,
): void {
  const colors = getModifierColor(modifier);

  ctx.save();

  // Badge background
  ctx.beginPath();
  ctx.roundRect(x - width / 2, y - height / 2, width, height, 4);
  ctx.fillStyle = colors.bg;
  ctx.fill();
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Glow
  ctx.shadowBlur = 8;
  ctx.shadowColor = colors.glow;
  ctx.stroke();

  // Text
  ctx.font = `bold 10px sans-serif`;
  ctx.fillStyle = colors.primary;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(modifier.toLowerCase(), x, y);

  ctx.restore();
}

function getLockStyles(config: LockConfig): Required<LockConfig> {
  return {
    x: config.x,
    y: config.y,
    size: config.size,
    modifier: config.modifier,
    isViolated: config.isViolated,
  };
}

// Re-export types for convenience
export type { AccessModifier };

export default {
  drawAccessLock,
  drawViolationLaser,
  createShakeAnimation,
  getModifierColor,
  drawModifierBadge,
};
