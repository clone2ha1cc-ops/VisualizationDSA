import { defineStore } from 'pinia';
import { ref, computed, shallowRef } from 'vue';
import type {
  FrameDTO,
  AlgorithmResult,
} from '../../animation-engine/types/animation.types';
import type {
  ComparePlaybackMode,
  ComparePlaybackState,
  CompareStats,
} from '../types/compare.types';
import { ALGORITHM_CATALOG } from '../../dsa-modules/services/algorithmCatalog';
import { generateDummyResult } from '../../dsa-modules/services/dummyGenerators';

/**
 * useCompareAlgorithmsStore — Pinia Store điều phối so sánh đối chiếu 2 thuật toán.
 * Quản lý VCR Controls đồng bộ, mảng frames kép, và chỉ số Big-O thời gian thực.
 */
export const useCompareAlgorithmsStore = defineStore('compareAlgorithms', () => {
  // ==========================================
  // STATE
  // ==========================================
  const leftAlgorithmId = ref('bubble-sort');
  const rightAlgorithmId = ref('selection-sort');

  const leftFrames = shallowRef<FrameDTO[]>([]);
  const rightFrames = shallowRef<FrameDTO[]>([]);
  const leftPseudoCode = ref<string[]>([]);
  const rightPseudoCode = ref<string[]>([]);

  const leftCurrentIndex = ref(0);
  const rightCurrentIndex = ref(0);

  const isPlaying = ref(false);
  const globalPlaySpeed = ref(1.0);
  const playbackMode = ref<ComparePlaybackMode>('independent');

  const inputArray = ref<number[]>([5, 3, 8, 1, 9, 2, 7, 4, 6]);

  let leftTimerId: number | null = null;
  let rightTimerId: number | null = null;

  // ==========================================
  // GETTERS
  // ==========================================
  const leftTotalFrames = computed(() => leftFrames.value.length);
  const rightTotalFrames = computed(() => rightFrames.value.length);

  const leftCurrentFrame = computed<FrameDTO | null>(() =>
    leftFrames.value.length > 0
      ? leftFrames.value[leftCurrentIndex.value] ?? null
      : null,
  );

  const rightCurrentFrame = computed<FrameDTO | null>(() =>
    rightFrames.value.length > 0
      ? rightFrames.value[rightCurrentIndex.value] ?? null
      : null,
  );

  const leftIsFinished = computed(
    () =>
      leftFrames.value.length > 0 &&
      leftCurrentIndex.value >= leftFrames.value.length - 1,
  );

  const rightIsFinished = computed(
    () =>
      rightFrames.value.length > 0 &&
      rightCurrentIndex.value >= rightFrames.value.length - 1,
  );

  const bothFinished = computed(
    () => leftIsFinished.value && rightIsFinished.value,
  );

  const leftProgressPercent = computed(() => {
    if (leftFrames.value.length <= 1) return 0;
    return (leftCurrentIndex.value / (leftFrames.value.length - 1)) * 100;
  });

  const rightProgressPercent = computed(() => {
    if (rightFrames.value.length <= 1) return 0;
    return (rightCurrentIndex.value / (rightFrames.value.length - 1)) * 100;
  });

  const globalProgressPercent = computed(() =>
    Math.max(leftProgressPercent.value, rightProgressPercent.value),
  );

  const playbackState = computed<ComparePlaybackState>(() => {
    if (leftFrames.value.length === 0 && rightFrames.value.length === 0)
      return 'UNINITIALIZED';
    if (bothFinished.value && !isPlaying.value) return 'FINISHED';
    if (isPlaying.value) return 'PLAYING';
    return leftCurrentIndex.value === 0 && rightCurrentIndex.value === 0
      ? 'LOADED'
      : 'PAUSED';
  });

  const leftStats = computed<CompareStats>(() =>
    extractStats(leftFrames.value, leftCurrentIndex.value),
  );

  const rightStats = computed<CompareStats>(() =>
    extractStats(rightFrames.value, rightCurrentIndex.value),
  );

  const efficiencyRatio = computed(() => {
    if (leftStats.value.comparisons === 0 || rightStats.value.comparisons === 0)
      return 1;
    return Number(
      (leftStats.value.comparisons / rightStats.value.comparisons).toFixed(1),
    );
  });

  const leftAlgorithmName = computed(
    () =>
      ALGORITHM_CATALOG.find((a) => a.id === leftAlgorithmId.value)?.name ??
      leftAlgorithmId.value,
  );

  const rightAlgorithmName = computed(
    () =>
      ALGORITHM_CATALOG.find((a) => a.id === rightAlgorithmId.value)?.name ??
      rightAlgorithmId.value,
  );

  const leftTimeComplexity = computed(
    () =>
      ALGORITHM_CATALOG.find((a) => a.id === leftAlgorithmId.value)
        ?.timeComplexity ?? '',
  );

  const rightTimeComplexity = computed(
    () =>
      ALGORITHM_CATALOG.find((a) => a.id === rightAlgorithmId.value)
        ?.timeComplexity ?? '',
  );

  // ==========================================
  // ACTIONS
  // ==========================================

  function extractStats(frames: FrameDTO[], currentIdx: number): CompareStats {
    let comparisons = 0;
    let swaps = 0;

    for (let i = 0; i <= currentIdx && i < frames.length; i++) {
      const h = frames[i].highlights;
      if (h.compare && h.compare.length > 0) comparisons++;
      if (h.swap && h.swap.length > 0) swaps++;
    }

    return {
      comparisons,
      swaps,
      totalFrames: frames.length,
      currentFrame: currentIdx,
      progressPercent:
        frames.length <= 1 ? 0 : (currentIdx / (frames.length - 1)) * 100,
    };
  }

  function loadCompareSession(leftAlg: string, rightAlg: string): void {
    stopPlayback();

    leftAlgorithmId.value = leftAlg;
    rightAlgorithmId.value = rightAlg;

    const leftResult = generateDummyResult(leftAlg, [...inputArray.value]);
    const rightResult = generateDummyResult(rightAlg, [...inputArray.value]);

    leftFrames.value = leftResult.frames;
    rightFrames.value = rightResult.frames;
    leftPseudoCode.value = leftResult.pseudoCode;
    rightPseudoCode.value = rightResult.pseudoCode;

    leftCurrentIndex.value = 0;
    rightCurrentIndex.value = 0;
  }

  function generateRandomInput(size: number = 10): void {
    const arr: number[] = [];
    for (let i = 0; i < size; i++) {
      arr.push(Math.floor(Math.random() * 99) + 1);
    }
    inputArray.value = arr;
  }

  function startPlayback(): void {
    if (isPlaying.value) return;
    if (bothFinished.value) {
      leftCurrentIndex.value = 0;
      rightCurrentIndex.value = 0;
    }
    isPlaying.value = true;

    if (playbackMode.value === 'normalized') {
      startNormalizedPlayback();
    } else {
      startIndependentPlayback();
    }
  }

  function startIndependentPlayback(): void {
    const baseDelay = 1000 / globalPlaySpeed.value;

    if (!leftIsFinished.value) {
      scheduleLeftTick(baseDelay);
    }
    if (!rightIsFinished.value) {
      scheduleRightTick(baseDelay);
    }
  }

  function startNormalizedPlayback(): void {
    const leftTotal = leftTotalFrames.value;
    const rightTotal = rightTotalFrames.value;
    const maxTotal = Math.max(leftTotal, rightTotal);

    if (maxTotal === 0) return;

    const baseDelay = 1000 / globalPlaySpeed.value;

    if (!leftIsFinished.value) {
      const leftDelay =
        leftTotal < maxTotal ? baseDelay * (maxTotal / leftTotal) : baseDelay;
      scheduleLeftTick(leftDelay);
    }
    if (!rightIsFinished.value) {
      const rightDelay =
        rightTotal < maxTotal
          ? baseDelay * (maxTotal / rightTotal)
          : baseDelay;
      scheduleRightTick(rightDelay);
    }
  }

  function scheduleLeftTick(delay: number): void {
    leftTimerId = setTimeout(() => {
      if (!isPlaying.value) return;
      if (leftCurrentIndex.value < leftFrames.value.length - 1) {
        leftCurrentIndex.value++;
        if (!leftIsFinished.value) {
          scheduleLeftTick(delay);
        } else {
          checkBothFinished();
        }
      }
    }, delay) as unknown as number;
  }

  function scheduleRightTick(delay: number): void {
    rightTimerId = setTimeout(() => {
      if (!isPlaying.value) return;
      if (rightCurrentIndex.value < rightFrames.value.length - 1) {
        rightCurrentIndex.value++;
        if (!rightIsFinished.value) {
          scheduleRightTick(delay);
        } else {
          checkBothFinished();
        }
      }
    }, delay) as unknown as number;
  }

  function checkBothFinished(): void {
    if (bothFinished.value) {
      isPlaying.value = false;
    }
  }

  function pausePlayback(): void {
    isPlaying.value = false;
    clearTimers();
  }

  function stopPlayback(): void {
    pausePlayback();
    leftCurrentIndex.value = 0;
    rightCurrentIndex.value = 0;
  }

  function togglePlayback(): void {
    if (isPlaying.value) {
      pausePlayback();
    } else {
      startPlayback();
    }
  }

  function stepForward(): void {
    pausePlayback();
    if (leftCurrentIndex.value < leftFrames.value.length - 1) {
      leftCurrentIndex.value++;
    }
    if (rightCurrentIndex.value < rightFrames.value.length - 1) {
      rightCurrentIndex.value++;
    }
  }

  function stepBackward(): void {
    pausePlayback();
    if (leftCurrentIndex.value > 0) leftCurrentIndex.value--;
    if (rightCurrentIndex.value > 0) rightCurrentIndex.value--;
  }

  function scrubToPercent(percent: number): void {
    pausePlayback();
    const clamped = Math.max(0, Math.min(100, percent));

    if (leftFrames.value.length > 1) {
      leftCurrentIndex.value = Math.round(
        (clamped / 100) * (leftFrames.value.length - 1),
      );
    }
    if (rightFrames.value.length > 1) {
      rightCurrentIndex.value = Math.round(
        (clamped / 100) * (rightFrames.value.length - 1),
      );
    }
  }

  function setSpeed(speed: number): void {
    globalPlaySpeed.value = speed;
    if (isPlaying.value) {
      clearTimers();
      if (playbackMode.value === 'normalized') {
        startNormalizedPlayback();
      } else {
        startIndependentPlayback();
      }
    }
  }

  function setPlaybackMode(mode: ComparePlaybackMode): void {
    const wasPlaying = isPlaying.value;
    if (wasPlaying) pausePlayback();
    playbackMode.value = mode;
    if (wasPlaying) startPlayback();
  }

  function clearTimers(): void {
    if (leftTimerId !== null) {
      clearTimeout(leftTimerId);
      leftTimerId = null;
    }
    if (rightTimerId !== null) {
      clearTimeout(rightTimerId);
      rightTimerId = null;
    }
  }

  function cleanup(): void {
    stopPlayback();
    leftFrames.value = [];
    rightFrames.value = [];
    leftPseudoCode.value = [];
    rightPseudoCode.value = [];
  }

  return {
    // State
    leftAlgorithmId,
    rightAlgorithmId,
    leftFrames,
    rightFrames,
    leftPseudoCode,
    rightPseudoCode,
    leftCurrentIndex,
    rightCurrentIndex,
    isPlaying,
    globalPlaySpeed,
    playbackMode,
    inputArray,

    // Getters
    leftTotalFrames,
    rightTotalFrames,
    leftCurrentFrame,
    rightCurrentFrame,
    leftIsFinished,
    rightIsFinished,
    bothFinished,
    leftProgressPercent,
    rightProgressPercent,
    globalProgressPercent,
    playbackState,
    leftStats,
    rightStats,
    efficiencyRatio,
    leftAlgorithmName,
    rightAlgorithmName,
    leftTimeComplexity,
    rightTimeComplexity,

    // Actions
    loadCompareSession,
    generateRandomInput,
    startPlayback,
    pausePlayback,
    stopPlayback,
    togglePlayback,
    stepForward,
    stepBackward,
    scrubToPercent,
    setSpeed,
    setPlaybackMode,
    cleanup,
  };
});
