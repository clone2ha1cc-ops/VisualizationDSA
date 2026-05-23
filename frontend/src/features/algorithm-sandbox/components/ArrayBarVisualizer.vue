<template>
  <div
    ref="container"
    class="relative w-full h-[380px] bg-[#090f19] rounded-[18px] border border-slate-800/85 overflow-hidden shadow-[0_8px_40px_rgba(6,182,212,0.06),0_2px_12px_rgba(0,0,0,0.5)]"
  >
    <!-- Background grid -->
    <div
      class="absolute inset-0 opacity-[0.18] pointer-events-none"
      style="
        background-image:
          linear-gradient(to right, #1e293b 1px, transparent 1px),
          linear-gradient(to bottom, #1e293b 1px, transparent 1px);
        background-size: 3.5rem 3.5rem;
        mask-image: radial-gradient(
          ellipse 65% 55% at 50% 50%,
          #000 60%,
          transparent 100%
        );
      "
    />

    <canvas
      ref="canvas"
      class="w-full h-full block cursor-grab active:cursor-grabbing"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
    />

    <!-- HUD Overlay -->
    <div
      class="absolute top-3.5 left-4 flex flex-col gap-1 pointer-events-none"
    >
      <span
        class="text-[10px] font-bold uppercase tracking-[0.08em] text-cyan-400"
        >Algorithm Viewport</span
      >
      <span
        class="text-[13px] font-semibold text-slate-100 max-w-[340px] leading-[1.4] drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]"
        >{{ stepDescription }}</span
      >
    </div>

    <!-- Algorithm selector + controls -->
    <div
      class="absolute top-3 right-3.5 flex items-center gap-2 bg-[#0e1726]/80 backdrop-blur-md border border-slate-700/70 py-1.5 px-2.5 rounded-xl"
    >
      <!-- Algorithm tabs -->
      <div class="flex gap-1">
        <button
          v-for="algo in ALGORITHMS"
          :key="algo.key"
          class="px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer transition-all duration-150"
          :class="
            selectedAlgo === algo.key
              ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/45'
              : 'border-slate-700/60 bg-[#070b13] text-slate-500 hover:text-slate-300 hover:border-slate-700'
          "
          @click="selectAlgorithm(algo.key)"
        >
          {{ algo.label }}
        </button>
      </div>
      <div class="w-[1px] h-[18px] bg-slate-800" />
      <!-- Zoom info -->
      <span class="text-[11px] font-mono text-cyan-400 px-1.5"
        >{{ Math.round(camera.zoom * 100) }}%</span
      >
      <button
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-400 bg-transparent border border-slate-700/50 cursor-pointer transition-all duration-150 hover:text-white hover:border-slate-600 hover:bg-slate-800/40 active:scale-95"
        title="Reset view"
        @click="resetViewport"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        Reset
      </button>
    </div>

    <!-- Progress bar -->
    <div class="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-800/60">
      <div
        class="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-r-sm transition-[width] duration-150 ease-out shadow-[0_0_8px_rgba(6,182,212,0.6)]"
        :style="{ width: progressPercent + '%' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ArrayBarVisualizer.vue — [UI] Sprint 2 component trực quan hóa mảng sắp xếp.
 * Concern: Template + lifecycle glue chỉ. Logic nằm trong composables/renderers.
 * Lines: < 200 (orchestrator chỉ)
 */
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useVcrStore } from "../../vcr-player";
import { CoreAnimationEngine } from "../../../core/CoreAnimationEngine";
import { useCamera } from "../composables/useCamera";
import { useMousePan } from "../composables/useMousePan";
import { useCanvasResize } from "../composables/useCanvasResize";
import { renderSortBar, renderPivotLabel } from "../renderers/renderSortBar";
import { renderLoopPointer } from "../renderers/renderLoopPointer";
import type {
  SortAlgorithm,
  SortFrame,
  BarStatus,
} from "../types/sorting.types";
import type { AnimatedItem, RGB } from "../types/canvas.types";
import { generateBubbleSortFrames } from "../algorithms/bubbleSort";
import { generateQuickSortFrames } from "../algorithms/quickSort";
import { generateMergeSortFrames } from "../algorithms/mergeSort";
import { generateHeapSortFrames } from "../algorithms/heapSort";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SLOT_W = 62;
const SLOT_H = 150;
const GAP = 18;

const ALGORITHMS: { key: SortAlgorithm; label: string }[] = [
  { key: "bubble", label: "Bubble" },
  { key: "quick", label: "Quick" },
  { key: "merge", label: "Merge" },
  { key: "heap", label: "Heap" },
];

const COLORS: Record<string, RGB> = {
  normal: { r: 6, g: 182, b: 212 },
  compare: { r: 245, g: 158, b: 11 },
  swap: { r: 244, g: 63, b: 94 },
  sorted: { r: 16, g: 185, b: 129 },
  pivot: { r: 251, g: 191, b: 36 },
};

// ─── STORE & REFS ─────────────────────────────────────────────────────────────
const vcrStore = useVcrStore();
const container = ref<HTMLDivElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const selectedAlgo = ref<SortAlgorithm>("bubble");

// ─── OFFSCREEN DOUBLE BUFFERING ────────────────────────────────────────────────
// Architecture Requirement: Offscreen Canvas để chống flickering, đạt 60 FPS mượt mà
const offscreenCanvas = ref<HTMLCanvasElement | null>(null);
const offscreenCtx = ref<CanvasRenderingContext2D | null>(null);

function initOffscreenCanvas(): void {
  if (!canvas.value) return;
  // Tạo offscreen canvas với cùng kích thước DPR như main canvas
  offscreenCanvas.value = document.createElement("canvas");
  resizeOffscreenCanvas();
  offscreenCtx.value = offscreenCanvas.value.getContext("2d");
}

function resizeOffscreenCanvas(): void {
  if (!canvas.value || !offscreenCanvas.value) return;
  offscreenCanvas.value.width = canvas.value.width;
  offscreenCanvas.value.height = canvas.value.height;
}

// ─── COMPOSABLES ──────────────────────────────────────────────────────────────
const { camera } = useCamera(canvas, SLOT_W, SLOT_H, GAP);
const { onMouseDown, onMouseMove, onMouseUp } = useMousePan(camera);
const { resizeCanvas, startListening, stopListening } = useCanvasResize(
  canvas,
  container,
  () => {
    resizeOffscreenCanvas();
    resetViewport();
  },
);

// ─── ANIMATED ITEMS ───────────────────────────────────────────────────────────
const items = ref<AnimatedItem[]>([]);
let animEngine: CoreAnimationEngine | null = null;

// Sort frames cho thuật toán đang chọn
const sortFrames = ref<SortFrame[]>([]);

// ─── DERIVED ──────────────────────────────────────────────────────────────────
const currentSortFrame = computed<SortFrame | null>(() => {
  const idx = vcrStore.currentFrameIndex;
  return sortFrames.value[idx] ?? null;
});

const stepDescription = computed(
  () => currentSortFrame.value?.description ?? "Chọn thuật toán và nhấn Play ▶",
);

const progressPercent = computed(() => {
  if (!sortFrames.value.length) return 0;
  return (vcrStore.currentFrameIndex / (sortFrames.value.length - 1)) * 100;
});

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function initItems(arr: number[]): void {
  items.value = arr.map((val, i) => ({
    id: i,
    value: val,
    currentX: i * (SLOT_W + GAP),
    targetX: i * (SLOT_W + GAP),
    currentScale: 1.0,
    targetScale: 1.0,
    currentRGB: { ...COLORS.normal },
    targetRGB: { ...COLORS.normal },
    status: "normal" as const,
  }));
}

function syncItemsToFrame(frame: SortFrame): void {
  // Cập nhật vị trí target theo arrayState - REORDER items để match arrayState
  const stateArr = frame.arrayState;

  // Tạo map từ value -> item để tìm nhanh
  const itemMap = new Map<number, AnimatedItem>();
  items.value.forEach((item) => itemMap.set(item.value, item));

  // Build lại items array theo thứ tự của arrayState
  const newOrder: AnimatedItem[] = [];
  stateArr.forEach((val) => {
    const item = itemMap.get(val);
    if (item) newOrder.push(item);
  });

  // Cập nhật lại items.value với thứ tự mới
  items.value = newOrder;

  // Cập nhật targetX cho tất cả items theo index mới
  items.value.forEach((item, i) => {
    item.targetX = i * (SLOT_W + GAP);
  });

  // Phân loại trạng thái màu theo frame
  items.value.forEach((item, idx) => {
    const isSorted = frame.sortedIndices.includes(idx);
    const isSwapped = frame.swappedIndices?.includes(idx);
    const isCompare = frame.comparingIndices?.includes(idx);
    const isPivot = frame.pivotIndex === idx;

    let tgt: RGB;
    let tScale = 1.0;

    if (isSorted) {
      tgt = COLORS.sorted;
      tScale = 1.0;
    } else if (isPivot) {
      tgt = COLORS.pivot;
      tScale = 1.08;
    } else if (isSwapped) {
      tgt = COLORS.swap;
      tScale = 1.12;
    } else if (isCompare) {
      tgt = COLORS.compare;
      tScale = 1.05;
    } else {
      tgt = COLORS.normal;
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

function resetViewport(): void {
  if (!canvas.value) return;
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.value.width / dpr;
  const h = canvas.value.height / dpr;
  const len = items.value.length || 6;
  const totalW = len * SLOT_W + (len - 1) * GAP;
  let zoom = 1.0;
  if (totalW > w * 0.85) zoom = (w * 0.85) / totalW;
  camera.value.zoom = zoom;
  camera.value.x = (w - totalW * zoom) / 2;
  camera.value.y = (h - SLOT_H * zoom) / 2 - 15;
}

// ─── ALGORITHM SELECT ─────────────────────────────────────────────────────────
function selectAlgorithm(algo: SortAlgorithm): void {
  selectedAlgo.value = algo;
  recompileForAlgo(algo);
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
  resetViewport();
}

// ─── RENDER LOOP (DOUBLE BUFFERED) ────────────────────────────────────────────
function render(deltaTime: number): void {
  if (!canvas.value || !offscreenCanvas.value || !offscreenCtx.value) return;

  const mainCtx = canvas.value.getContext("2d");
  if (!mainCtx) return;

  const ctx = offscreenCtx.value;
  const dpr = window.devicePixelRatio || 1;

  // Bước 1: Clear và setup transform cho offscreen canvas
  ctx.clearRect(
    0,
    0,
    offscreenCanvas.value.width,
    offscreenCanvas.value.height,
  );
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.translate(camera.value.x, camera.value.y);
  ctx.scale(camera.value.zoom, camera.value.zoom);

  const maxVal = Math.max(...items.value.map((i) => i.value), 1);
  // Tăng tốc độ lerp để animation mượt hơn (0.015 thay vì 0.009)
  const lerpT = Math.min(0.018 * deltaTime, 0.95);
  const frame = currentSortFrame.value;

  // Cập nhật animatedItems Lerp
  items.value.forEach((item) => {
    item.currentX = CoreAnimationEngine.lerp(
      item.currentX,
      item.targetX,
      lerpT,
    );
    item.currentScale = CoreAnimationEngine.lerp(
      item.currentScale,
      item.targetScale,
      lerpT,
    );
    item.currentRGB = lerpRGB(item.currentRGB, item.targetRGB, lerpT);
  });

  // Xác định trạng thái BarStatus cho mỗi item
  items.value.forEach((item, idx) => {
    let status: BarStatus = "IDLE";
    if (frame) {
      if (frame.sortedIndices.includes(idx)) status = "SORTED";
      else if (frame.pivotIndex === idx) status = "PIVOT";
      else if (frame.swappedIndices?.includes(idx)) status = "SWAPPED";
      else if (frame.comparingIndices?.includes(idx)) status = "COMPARING";
    }

    renderSortBar(ctx, item, idx, maxVal, SLOT_W, SLOT_H, status);

    // Vẽ PIVOT badge nổi
    if (status === "PIVOT") {
      renderPivotLabel(ctx, item.currentX, SLOT_W);
    }
  });

  // Loop pointer i/j
  if (frame?.comparingIndices) {
    const [idxI, idxJ] = frame.comparingIndices;
    if (items.value[idxI])
      renderLoopPointer(ctx, "i", items.value[idxI].currentX, SLOT_W);
    if (items.value[idxJ])
      renderLoopPointer(ctx, "j", items.value[idxJ].currentX, SLOT_W, 24);
  }

  ctx.restore();

  // Bước 2: Copy offscreen canvas lên main canvas một lần duy nhất (Double Buffer)
  mainCtx.clearRect(0, 0, canvas.value.width, canvas.value.height);
  mainCtx.drawImage(offscreenCanvas.value, 0, 0);
}

watch(currentSortFrame, (frame) => {
  if (frame) syncItemsToFrame(frame);
});

onMounted(() => {
  vcrStore.customCompileFn = () => {
    recompileForAlgo(selectedAlgo.value);
  };
  recompileForAlgo("bubble");
  resizeCanvas();
  initOffscreenCanvas(); // Khởi tạo offscreen canvas cho double buffering
  startListening();
  animEngine = new CoreAnimationEngine();
  animEngine.registerRender(render);
});

onBeforeUnmount(() => {
  vcrStore.customCompileFn = null;
  animEngine?.destroy();
  stopListening();
  // Cleanup offscreen canvas
  offscreenCanvas.value = null;
  offscreenCtx.value = null;
});
</script>
