import type { Ref } from 'vue';
import type { FrameDTO } from '../../animation-engine/types/animation.types';
import type { CompareStats } from '../types/compare.types';

/**
 * Tính toán thống kê so sánh (comparisons/swaps) từ danh sách frames đến vị trí hiện tại.
 */
export function extractStats(frames: FrameDTO[], currentIdx: number): CompareStats {
  let comparisons = 0;
  let swaps = 0;
  for (let i = 0; i <= currentIdx && i < frames.length; i++) {
    const h = frames[i].highlights;
    if (h.compare && h.compare.length > 0) comparisons++;
    if (h.swap    && h.swap.length    > 0) swaps++;
  }
  return {
    comparisons, swaps,
    totalFrames:     frames.length,
    currentFrame:    currentIdx,
    progressPercent: frames.length <= 1 ? 0 : (currentIdx / (frames.length - 1)) * 100,
  };
}

/** Lên lịch tick cho side LEFT của playback. */
export function scheduleLeftTick(
  delay: number,
  isPlaying: Ref<boolean>,
  leftCurrentIndex: Ref<number>,
  leftFramesLength: number,
  leftIsFinished: Ref<boolean>,
  onFinished: () => void,
  timerRef: { value: number | null },
): void {
  timerRef.value = setTimeout(() => {
    if (!isPlaying.value) return;
    if (leftCurrentIndex.value < leftFramesLength - 1) {
      leftCurrentIndex.value++;
      if (!leftIsFinished.value) scheduleLeftTick(delay, isPlaying, leftCurrentIndex, leftFramesLength, leftIsFinished, onFinished, timerRef);
      else onFinished();
    }
  }, delay) as unknown as number;
}

/** Lên lịch tick cho side RIGHT của playback. */
export function scheduleRightTick(
  delay: number,
  isPlaying: Ref<boolean>,
  rightCurrentIndex: Ref<number>,
  rightFramesLength: number,
  rightIsFinished: Ref<boolean>,
  onFinished: () => void,
  timerRef: { value: number | null },
): void {
  timerRef.value = setTimeout(() => {
    if (!isPlaying.value) return;
    if (rightCurrentIndex.value < rightFramesLength - 1) {
      rightCurrentIndex.value++;
      if (!rightIsFinished.value) scheduleRightTick(delay, isPlaying, rightCurrentIndex, rightFramesLength, rightIsFinished, onFinished, timerRef);
      else onFinished();
    }
  }, delay) as unknown as number;
}
