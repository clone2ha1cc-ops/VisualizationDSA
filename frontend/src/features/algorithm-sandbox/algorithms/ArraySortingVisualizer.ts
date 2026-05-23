import type { BarElement, SwapInterpolation } from '../types/sorting.types';

/**
 * ArraySortingVisualizer — [ANIMATION] Pure math utilities cho hoán vị Lerp.
 * Tính toán tọa độ nội suy và đường cung parabol khi 2 bar hoán vị vị trí.
 */
export class ArraySortingVisualizer {
  /**
   * Tính toán nội suy Lerp di chuyển vị trí 2 cột bar hoán vị.
   * Kết hợp di chuyển X tuyến tính + đường cong Y parabol để tránh chồng nhau.
   *
   * @param barA     Cột phần tử A (vị trí ban đầu)
   * @param barB     Cột phần tử B (vị trí ban đầu)
   * @param progress Tiến trình hoán vị [0.0 → 1.0]
   * @param arcHeight Chiều cao đỉnh cung parabol (px), mặc định 40
   */
  public static interpolateSwap(
    barA: BarElement,
    barB: BarElement,
    progress: number,
    arcHeight = 40
  ): SwapInterpolation {
    const targetXA = barB.x;
    const targetXB = barA.x;

    // Nội suy tuyến tính trục X
    const xA = barA.x + (targetXA - barA.x) * progress;
    const xB = barB.x + (targetXB - barB.x) * progress;

    // Cung parabol: f(t) = -4 * h * t * (1 - t)  → đỉnh tại t=0.5
    const curveY = -4 * arcHeight * progress * (1 - progress);

    return { xA, xB, curveY };
  }

  /**
   * Tính chiều cao cột bar tỷ lệ theo giá trị max.
   */
  public static barHeight(value: number, maxValue: number, maxSlotHeight: number): number {
    return Math.max((value / Math.max(maxValue, 1)) * maxSlotHeight, 28);
  }
}
