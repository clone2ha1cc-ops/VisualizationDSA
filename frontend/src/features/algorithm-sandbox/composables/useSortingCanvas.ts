import { ref, onMounted, onBeforeUnmount, watch, computed, type Ref } from "vue";
import { useVcrStore } from "../../vcr-player";
import { CoreAnimationEngine } from "../../../core/CoreAnimationEngine";
import { useCamera } from "./useCamera";
import { useMousePan } from "./useMousePan";
import { useCanvasResize } from "./useCanvasResize";
import { renderSortBar, renderPivotLabel } from "../renderers/renderSortBar";
import { renderLoopPointer } from "../renderers/renderLoopPointer";
import type { BarStatus, SortAlgorithm } from "../types/sorting.types";
import type { RGB } from "../types/canvas.types";
import { useSortingAnimation } from "./useSortingAnimation";

export function useSortingCanvas(
  canvas: Ref<HTMLCanvasElement | null>,
  container: Ref<HTMLDivElement | null>
) {
  const SLOT_W = 62;
  const SLOT_H = 150;
  const GAP = 18;

  const COLORS: Record<string, RGB> = {
    normal: { r: 6, g: 182, b: 212 },
    compare: { r: 245, g: 158, b: 11 },
    swap: { r: 244, g: 63, b: 94 },
    sorted: { r: 16, g: 185, b: 129 },
    pivot: { r: 251, g: 191, b: 36 },
  };

  const vcrStore = useVcrStore();
  const offscreenCanvas = ref<HTMLCanvasElement | null>(null);
  const offscreenCtx = ref<CanvasRenderingContext2D | null>(null);

  const { camera } = useCamera(canvas, SLOT_W, SLOT_H, GAP);
  const { onMouseDown, onMouseMove, onMouseUp } = useMousePan(camera);

  const {
    items,
    selectedAlgo,
    currentSortFrame,
    stepDescription,
    progressPercent,
    syncItemsToFrame,
    lerpRGB,
    recompileForAlgo,
    selectAlgorithm,
  } = useSortingAnimation(SLOT_W, GAP, COLORS, resetViewport);

  const { resizeCanvas, startListening, stopListening } = useCanvasResize(
    canvas,
    container,
    () => {
      resizeOffscreenCanvas();
      resetViewport();
    }
  );

  let animEngine: CoreAnimationEngine | null = null;
  const zoom = computed(() => camera.value.zoom);

  function initOffscreenCanvas(): void {
    if (!canvas.value) return;
    offscreenCanvas.value = document.createElement("canvas");
    resizeOffscreenCanvas();
    offscreenCtx.value = offscreenCanvas.value.getContext("2d");
  }

  function resizeOffscreenCanvas(): void {
    if (!canvas.value || !offscreenCanvas.value) return;
    offscreenCanvas.value.width = canvas.value.width;
    offscreenCanvas.value.height = canvas.value.height;
  }

  function resetViewport(): void {
    if (!canvas.value) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.value.width / dpr;
    const h = canvas.value.height / dpr;
    const len = items.value.length || 6;
    const totalW = len * SLOT_W + (len - 1) * GAP;
    let z = 1.0;
    if (totalW > w * 0.85) z = (w * 0.85) / totalW;
    camera.value.zoom = z;
    camera.value.x = (w - totalW * z) / 2;
    camera.value.y = (h - SLOT_H * z) / 2 - 15;
  }

  function render(deltaTime: number): void {
    if (!canvas.value || !offscreenCanvas.value || !offscreenCtx.value) return;

    const mainCtx = canvas.value.getContext("2d");
    if (!mainCtx) return;

    const ctx = offscreenCtx.value;
    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, offscreenCanvas.value.width, offscreenCanvas.value.height);
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.translate(camera.value.x, camera.value.y);
    ctx.scale(camera.value.zoom, camera.value.zoom);

    const maxVal = Math.max(...items.value.map((i) => i.value), 1);
    const lerpT = Math.min(0.018 * deltaTime, 0.95);
    const frame = currentSortFrame.value;

    items.value.forEach((item) => {
      item.currentX = CoreAnimationEngine.lerp(item.currentX, item.targetX, lerpT);
      item.currentScale = CoreAnimationEngine.lerp(item.currentScale, item.targetScale, lerpT);
      item.currentRGB = lerpRGB(item.currentRGB, item.targetRGB, lerpT);
    });

    items.value.forEach((item, idx) => {
      let status: BarStatus = "IDLE";
      if (frame) {
        if (frame.sortedIndices.includes(idx)) status = "SORTED";
        else if (frame.pivotIndex === idx) status = "PIVOT";
        else if (frame.swappedIndices?.includes(idx)) status = "SWAPPED";
        else if (frame.comparingIndices?.includes(idx)) status = "COMPARING";
      }

      renderSortBar(ctx, item, idx, maxVal, SLOT_W, SLOT_H, status);

      if (status === "PIVOT") {
        renderPivotLabel(ctx, item.currentX, SLOT_W);
      }
    });

    if (frame?.comparingIndices) {
      const [idxI, idxJ] = frame.comparingIndices;
      if (items.value[idxI])
        renderLoopPointer(ctx, "i", items.value[idxI].currentX, SLOT_W);
      if (items.value[idxJ])
        renderLoopPointer(ctx, "j", items.value[idxJ].currentX, SLOT_W, 24);
    }

    ctx.restore();

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
    initOffscreenCanvas();
    startListening();
    animEngine = new CoreAnimationEngine();
    animEngine.registerRender(render);
  });

  onBeforeUnmount(() => {
    vcrStore.customCompileFn = null;
    animEngine?.destroy();
    stopListening();
    offscreenCanvas.value = null;
    offscreenCtx.value = null;
  });

  return {
    selectedAlgo,
    stepDescription,
    progressPercent,
    zoom,
    selectAlgorithm,
    resetViewport,
    onMouseDown,
    onMouseMove,
    onMouseUp,
  };
}
