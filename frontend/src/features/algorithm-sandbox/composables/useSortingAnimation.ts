import { ref, computed } from "vue";
import { useVcrStore } from "../../vcr-player";
import { CoreAnimationEngine } from "../../../core/CoreAnimationEngine";
import type { SortAlgorithm, SortFrame } from "../types/sorting.types";
import type { AnimatedItem, RGB } from "../types/canvas.types";
import { generateBubbleSortFrames } from "../algorithms/bubbleSort";
import { generateQuickSortFrames } from "../algorithms/quickSort";
import { generateMergeSortFrames } from "../algorithms/mergeSort";
import { generateHeapSortFrames } from "../algorithms/heapSort";

export function useSortingAnimation(
  slotW: number,
  gap: number,
  colors: Record<string, RGB>,
  onResetViewport: () => void
) {
  const vcrStore = useVcrStore();
  const items = ref<AnimatedItem[]>([]);
  const sortFrames = ref<SortFrame[]>([]);
  const selectedAlgo = ref<SortAlgorithm>("bubble");

  const currentSortFrame = computed<SortFrame | null>(() => {
    const idx = vcrStore.currentFrameIndex;
    return sortFrames.value[idx] ?? null;
  });

  const stepDescription = computed(
    () => currentSortFrame.value?.description ?? "Chọn thuật toán và nhấn Play ▶"
  );

  const progressPercent = computed(() => {
    if (!sortFrames.value.length) return 0;
    return (vcrStore.currentFrameIndex / (sortFrames.value.length - 1)) * 100;
  });

  function initItems(arr: number[]): void {
    items.value = arr.map((val, i) => ({
      id: i,
      value: val,
      currentX: i * (slotW + gap),
      targetX: i * (slotW + gap),
      currentScale: 1.0,
      targetScale: 1.0,
      currentRGB: { ...colors.normal },
      targetRGB: { ...colors.normal },
      status: "normal" as const,
    }));
  }

  function syncItemsToFrame(frame: SortFrame): void {
    const stateArr = frame.arrayState;
    const itemMap = new Map<number, AnimatedItem>();
    items.value.forEach((item) => itemMap.set(item.value, item));

    const newOrder: AnimatedItem[] = [];
    stateArr.forEach((val) => {
      const item = itemMap.get(val);
      if (item) newOrder.push(item);
    });

    items.value = newOrder;

    items.value.forEach((item, i) => {
      item.targetX = i * (slotW + gap);
    });

    items.value.forEach((item, idx) => {
      const isSorted = frame.sortedIndices.includes(idx);
      const isSwapped = frame.swappedIndices?.includes(idx);
      const isCompare = frame.comparingIndices?.includes(idx);
      const isPivot = frame.pivotIndex === idx;

      let tgt: RGB;
      let tScale = 1.0;

      if (isSorted) {
        tgt = colors.sorted;
        tScale = 1.0;
      } else if (isPivot) {
        tgt = colors.pivot;
        tScale = 1.08;
      } else if (isSwapped) {
        tgt = colors.swap;
        tScale = 1.12;
      } else if (isCompare) {
        tgt = colors.compare;
        tScale = 1.05;
      } else {
        tgt = colors.normal;
        tScale = 1.0;
      }

      item.targetRGB = { ...tgt };
      item.targetScale = tScale;
    });
  }

  function lerpRGB(a: RGB, b: RGB, t: number): RGB {
    return {
      r: CoreAnimationEngine.lerp(a.r, b.r, t),
      g: CoreAnimationEngine.lerp(a.g, b.g, t),
      b: CoreAnimationEngine.lerp(a.b, b.b, t),
    };
  }

  function recompileForAlgo(algo: SortAlgorithm): void {
    const arrStr = vcrStore.rawInputArray;
    const parsedArr = arrStr
      .split(",")
      .map((num) => parseInt(num.trim(), 10))
      .filter((num) => !isNaN(num));
    const arr = parsedArr.length > 0 ? parsedArr : [45, 12, 85, 32, 9, 60];
    initItems(arr);

    const generators: Record<SortAlgorithm, (a: number[]) => SortFrame[]> = {
      bubble: generateBubbleSortFrames,
      quick: generateQuickSortFrames,
      merge: generateMergeSortFrames,
      heap: generateHeapSortFrames,
    };
    sortFrames.value = generators[algo](arr);
    vcrStore.playbackFrames = sortFrames.value as any;
    vcrStore.reset();
    onResetViewport();
  }

  function selectAlgorithm(algo: SortAlgorithm): void {
    selectedAlgo.value = algo;
    recompileForAlgo(algo);
  }

  return {
    items,
    sortFrames,
    selectedAlgo,
    currentSortFrame,
    stepDescription,
    progressPercent,
    initItems,
    syncItemsToFrame,
    lerpRGB,
    recompileForAlgo,
    selectAlgorithm,
  };
}
