/**
 * sorting.types.ts — Type definitions cho Sprint 2 Sorting Algorithms.
 * [TYPES] — Shared interfaces dùng bởi tất cả frame generators và renderers.
 */

// ─── BAR ELEMENT ──────────────────────────────────────────────────────────────
/** Trạng thái trực quan của một cột bar trong hoạt ảnh sắp xếp */
export type BarStatus = "IDLE" | "COMPARING" | "PIVOT" | "SWAPPED" | "SORTED";

export interface BarElement {
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string; // HSL Neon Glow string
  status: BarStatus;
}

// ─── SORT FRAME ───────────────────────────────────────────────────────────────
/** Một khung hình snapshot của dòng thời gian sắp xếp */
export interface SubArray {
  start: number;
  end: number;
  level: number;
  isActive: boolean;
}

export interface SortFrame {
  stepIndex: number;
  arrayState: number[];
  /** Hai chỉ số đang được so sánh */
  comparingIndices: [number, number] | null;
  /** Chỉ số Pivot (dùng cho QuickSort) */
  pivotIndex: number | null;
  /** Hai chỉ số vừa được hoán vị */
  swappedIndices: [number, number] | null;
  /** Các chỉ số đã xếp đúng vị trí cuối */
  sortedIndices: number[];
  /** Mô tả bước hiện tại (hiển thị HUD) */
  description: string;
  /** Tên thuật toán */
  algorithm: SortAlgorithm;
  /** Merge sort: các sub-arrays đang hiển thị */
  subArrays?: SubArray[];
  /** Merge sort: phạm vi đang merge */
  mergeRange?: { start: number; end: number };
}

// ─── ALGORITHM ENUM ───────────────────────────────────────────────────────────
export type SortAlgorithm = "bubble" | "quick" | "merge" | "heap";

// ─── SWAP INTERPOLATION ───────────────────────────────────────────────────────
/** Kết quả tính toán nội suy hoán vị Lerp + cung parabol */
export interface SwapInterpolation {
  xA: number;
  xB: number;
  /** Độ lệch trục Y theo cung parabol (âm = đi lên) */
  curveY: number;
}
