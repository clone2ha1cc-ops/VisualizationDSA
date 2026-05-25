import { defineStore } from 'pinia';
import { ref, computed, shallowRef } from 'vue';
import type { FrameDTO } from '../../animation-engine/types/animation.types';
import type { ComparePlaybackMode, ComparePlaybackState, CompareStats } from '../types/compare.types';
import { ALGORITHM_CATALOG } from '../../dsa-modules/services/algorithmCatalog';
import { generateDummyResult } from '../../dsa-modules/services/dummyGenerators';
import { extractStats, scheduleLeftTick, scheduleRightTick } from './compareHelpers';

/**
 * useCompareAlgorithmsStore — Pinia Store điều phối so sánh đối chiếu 2 thuật toán.
 * Quản lý VCR Controls đồng bộ, mảng frames kép, và chỉ số Big-O thời gian thực.
 */
export const useCompareAlgorithmsStore = defineStore('compareAlgorithms', () => {
  // STATE
  const leftAlgorithmId    = ref('bubble-sort');
  const rightAlgorithmId   = ref('selection-sort');
  const leftFrames         = shallowRef<FrameDTO[]>([]);
  const rightFrames        = shallowRef<FrameDTO[]>([]);
  const leftPseudoCode     = ref<string[]>([]);
  const rightPseudoCode    = ref<string[]>([]);
  const leftCurrentIndex   = ref(0);
  const rightCurrentIndex  = ref(0);
  const isPlaying          = ref(false);
  const globalPlaySpeed    = ref(1.0);
  const playbackMode       = ref<ComparePlaybackMode>('independent');
  const inputArray         = ref<number[]>([5, 3, 8, 1, 9, 2, 7, 4, 6]);
  const leftTimerRef       = { value: null as number | null };
  const rightTimerRef      = { value: null as number | null };

  // GETTERS
  const leftTotalFrames     = computed(() => leftFrames.value.length);
  const rightTotalFrames    = computed(() => rightFrames.value.length);
  const leftCurrentFrame    = computed<FrameDTO | null>(() => leftFrames.value[leftCurrentIndex.value] ?? null);
  const rightCurrentFrame   = computed<FrameDTO | null>(() => rightFrames.value[rightCurrentIndex.value] ?? null);
  const leftIsFinished      = computed(() => leftFrames.value.length > 0 && leftCurrentIndex.value >= leftFrames.value.length - 1);
  const rightIsFinished     = computed(() => rightFrames.value.length > 0 && rightCurrentIndex.value >= rightFrames.value.length - 1);
  const bothFinished        = computed(() => leftIsFinished.value && rightIsFinished.value);
  const leftProgressPercent = computed(() => leftFrames.value.length <= 1 ? 0 : (leftCurrentIndex.value / (leftFrames.value.length - 1)) * 100);
  const rightProgressPercent = computed(() => rightFrames.value.length <= 1 ? 0 : (rightCurrentIndex.value / (rightFrames.value.length - 1)) * 100);
  const globalProgressPercent = computed(() => Math.max(leftProgressPercent.value, rightProgressPercent.value));

  const playbackState = computed<ComparePlaybackState>(() => {
    if (leftFrames.value.length === 0 && rightFrames.value.length === 0) return 'UNINITIALIZED';
    if (bothFinished.value && !isPlaying.value) return 'FINISHED';
    if (isPlaying.value) return 'PLAYING';
    return leftCurrentIndex.value === 0 && rightCurrentIndex.value === 0 ? 'LOADED' : 'PAUSED';
  });

  const leftStats           = computed<CompareStats>(() => extractStats(leftFrames.value, leftCurrentIndex.value));
  const rightStats          = computed<CompareStats>(() => extractStats(rightFrames.value, rightCurrentIndex.value));
  const efficiencyRatio     = computed(() => leftStats.value.comparisons === 0 || rightStats.value.comparisons === 0 ? 1 : Number((leftStats.value.comparisons / rightStats.value.comparisons).toFixed(1)));
  const leftAlgorithmName   = computed(() => ALGORITHM_CATALOG.find(a => a.id === leftAlgorithmId.value)?.name ?? leftAlgorithmId.value);
  const rightAlgorithmName  = computed(() => ALGORITHM_CATALOG.find(a => a.id === rightAlgorithmId.value)?.name ?? rightAlgorithmId.value);
  const leftTimeComplexity  = computed(() => ALGORITHM_CATALOG.find(a => a.id === leftAlgorithmId.value)?.timeComplexity ?? '');
  const rightTimeComplexity = computed(() => ALGORITHM_CATALOG.find(a => a.id === rightAlgorithmId.value)?.timeComplexity ?? '');

  // ACTIONS
  function clearTimers(): void {
    if (leftTimerRef.value  !== null) { clearTimeout(leftTimerRef.value);  leftTimerRef.value  = null; }
    if (rightTimerRef.value !== null) { clearTimeout(rightTimerRef.value); rightTimerRef.value = null; }
  }

  function checkBothFinished(): void { if (bothFinished.value) isPlaying.value = false; }

  function startIndependentPlayback(): void {
    const d = 1000 / globalPlaySpeed.value;
    if (!leftIsFinished.value)  scheduleLeftTick (d, isPlaying, leftCurrentIndex,  leftFrames.value.length,  leftIsFinished,  checkBothFinished, leftTimerRef);
    if (!rightIsFinished.value) scheduleRightTick(d, isPlaying, rightCurrentIndex, rightFrames.value.length, rightIsFinished, checkBothFinished, rightTimerRef);
  }

  function startNormalizedPlayback(): void {
    const max = Math.max(leftTotalFrames.value, rightTotalFrames.value);
    if (max === 0) return;
    const base = 1000 / globalPlaySpeed.value;
    if (!leftIsFinished.value)  scheduleLeftTick (leftTotalFrames.value  < max ? base * (max / leftTotalFrames.value)  : base, isPlaying, leftCurrentIndex,  leftFrames.value.length,  leftIsFinished,  checkBothFinished, leftTimerRef);
    if (!rightIsFinished.value) scheduleRightTick(rightTotalFrames.value < max ? base * (max / rightTotalFrames.value) : base, isPlaying, rightCurrentIndex, rightFrames.value.length, rightIsFinished, checkBothFinished, rightTimerRef);
  }

  function startPlayback(): void {
    if (isPlaying.value) return;
    if (bothFinished.value) { leftCurrentIndex.value = 0; rightCurrentIndex.value = 0; }
    isPlaying.value = true;
    playbackMode.value === 'normalized' ? startNormalizedPlayback() : startIndependentPlayback();
  }

  function pausePlayback():  void { isPlaying.value = false; clearTimers(); }
  function stopPlayback():   void { pausePlayback(); leftCurrentIndex.value = 0; rightCurrentIndex.value = 0; }
  function togglePlayback(): void { isPlaying.value ? pausePlayback() : startPlayback(); }

  function stepForward():  void { pausePlayback(); if (leftCurrentIndex.value  < leftFrames.value.length  - 1) leftCurrentIndex.value++;  if (rightCurrentIndex.value < rightFrames.value.length - 1) rightCurrentIndex.value++; }
  function stepBackward(): void { pausePlayback(); if (leftCurrentIndex.value  > 0) leftCurrentIndex.value--;  if (rightCurrentIndex.value > 0) rightCurrentIndex.value--; }

  function scrubToPercent(percent: number): void {
    pausePlayback();
    const c = Math.max(0, Math.min(100, percent));
    if (leftFrames.value.length  > 1) leftCurrentIndex.value  = Math.round((c / 100) * (leftFrames.value.length  - 1));
    if (rightFrames.value.length > 1) rightCurrentIndex.value = Math.round((c / 100) * (rightFrames.value.length - 1));
  }

  function setSpeed(speed: number): void {
    globalPlaySpeed.value = speed;
    if (isPlaying.value) { clearTimers(); playbackMode.value === 'normalized' ? startNormalizedPlayback() : startIndependentPlayback(); }
  }

  function setPlaybackMode(mode: ComparePlaybackMode): void {
    const was = isPlaying.value; if (was) pausePlayback();
    playbackMode.value = mode; if (was) startPlayback();
  }

  function generateRandomInput(size = 10): void {
    inputArray.value = Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1);
  }

  function loadCompareSession(leftAlg: string, rightAlg: string): void {
    stopPlayback();
    leftAlgorithmId.value  = leftAlg;
    rightAlgorithmId.value = rightAlg;
    const L = generateDummyResult(leftAlg,  [...inputArray.value]);
    const R = generateDummyResult(rightAlg, [...inputArray.value]);
    leftFrames.value    = L.frames;    rightFrames.value    = R.frames;
    leftPseudoCode.value = L.pseudoCode; rightPseudoCode.value = R.pseudoCode;
    leftCurrentIndex.value = 0; rightCurrentIndex.value = 0;
  }

  function cleanup(): void { stopPlayback(); leftFrames.value = []; rightFrames.value = []; leftPseudoCode.value = []; rightPseudoCode.value = []; }

  return {
    leftAlgorithmId, rightAlgorithmId, leftFrames, rightFrames, leftPseudoCode, rightPseudoCode,
    leftCurrentIndex, rightCurrentIndex, isPlaying, globalPlaySpeed, playbackMode, inputArray,
    leftTotalFrames, rightTotalFrames, leftCurrentFrame, rightCurrentFrame, leftIsFinished, rightIsFinished,
    bothFinished, leftProgressPercent, rightProgressPercent, globalProgressPercent, playbackState,
    leftStats, rightStats, efficiencyRatio, leftAlgorithmName, rightAlgorithmName, leftTimeComplexity, rightTimeComplexity,
    loadCompareSession, generateRandomInput, startPlayback, pausePlayback, stopPlayback,
    togglePlayback, stepForward, stepBackward, scrubToPercent, setSpeed, setPlaybackMode, cleanup,
  };
});
