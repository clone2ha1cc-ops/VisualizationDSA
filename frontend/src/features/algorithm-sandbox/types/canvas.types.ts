/**
 * canvas.types.ts — Type definitions cho algorithm-sandbox feature module.
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface AnimatedItem {
  id: number;
  value: number;
  currentX: number;
  targetX: number;
  currentScale: number;
  targetScale: number;
  currentRGB: RGB;
  targetRGB: RGB;
  status: 'normal' | 'compare' | 'swap' | 'highlight';
}

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}
