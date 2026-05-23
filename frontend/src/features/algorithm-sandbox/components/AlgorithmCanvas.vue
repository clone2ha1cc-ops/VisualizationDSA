<template>
  <div
    class="canvas-container relative w-full h-[400px] bg-[#090f19] rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl shadow-cyan-950/20"
    ref="container"
  >
    <!-- background grid -->
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

    <canvas
      ref="canvas"
      class="w-full h-full block cursor-grab active:cursor-grabbing"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseLeave"
    ></canvas>

    <!-- HUD Info -->
    <div class="absolute top-4 left-4 pointer-events-none select-none flex flex-col gap-1">
      <div class="text-xs font-semibold uppercase tracking-wider text-cyan-400">DSA Viewport</div>
      <div class="text-lg font-bold text-white drop-shadow-md">{{ currentStepDescription }}</div>
    </div>

    <!-- Viewport Controls -->
    <div class="absolute top-4 right-4 flex items-center gap-2 bg-[#0e1726]/85 backdrop-blur border border-slate-700/60 p-1.5 rounded-xl shadow-lg">
      <button
        @click="handleResetViewport"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all active:scale-95"
        title="Reset camera zoom & position"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        <span>Reset view</span>
      </button>
      <div class="h-4 w-px bg-slate-800"></div>
      <div class="text-[11px] font-mono text-cyan-400 px-2">Zoom: {{ Math.round(camera.zoom * 100) }}%</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useVcrStore } from '../../vcr-player/store/useVcrStore';
import { CoreAnimationEngine } from '../../../core/CoreAnimationEngine';

// Composables
import { useCamera }         from '../composables/useCamera';
import { useMousePan }       from '../composables/useMousePan';
import { useCanvasResize }   from '../composables/useCanvasResize';
import { useAnimatedItems }  from '../composables/useAnimatedItems';

// Renderers
import { renderArrayBar }    from '../renderers/renderArrayBar';
import { renderLoopPointers } from '../renderers/renderLoopPointer';

// ─── Setup ────────────────────────────────────────────────────────────────────
const vcrStore   = useVcrStore();
const canvas     = ref<HTMLCanvasElement | null>(null);
const container  = ref<HTMLDivElement | null>(null);

const SLOT_WIDTH  = 70;
const SLOT_HEIGHT = 160;
const GAP         = 20;

// ─── Composables ──────────────────────────────────────────────────────────────
const { camera, resetViewport, handleWheel }       = useCamera(canvas, SLOT_WIDTH, SLOT_HEIGHT, GAP);
const { onMouseDown, onMouseMove, onMouseUp, onMouseLeave } = useMousePan(camera);
const { items, initializeItems, matchNewArrayToItems, updateItemStatuses, tickLerp } = useAnimatedItems();
const { resizeCanvas, startListening, stopListening } = useCanvasResize(canvas, container, () => {
  resetViewport(vcrStore.inputArray.length || 6);
});

// ─── HUD ──────────────────────────────────────────────────────────────────────
const currentStepDescription = computed(() =>
  vcrStore.currentFrame?.description ?? 'Sẵn sàng khởi chạy thuật toán'
);

const handleResetViewport = () => resetViewport(vcrStore.inputArray.length || 6);

// ─── Render Loop ──────────────────────────────────────────────────────────────
let animationEngine: CoreAnimationEngine | null = null;

const render = (deltaTime: number) => {
  if (!canvas.value) return;
  const ctx = canvas.value.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.translate(camera.value.x, camera.value.y);
  ctx.scale(camera.value.zoom, camera.value.zoom);

  const maxVal = Math.max(...items.value.map(i => i.value), 1);
  const speedAdjustedT = Math.min(0.008 * deltaTime * vcrStore.playbackSpeed, 1.0);
  const lerpFactor = vcrStore.isPlaying ? speedAdjustedT : Math.min(0.012 * deltaTime, 1.0);

  tickLerp(lerpFactor);

  items.value.forEach((item, idx) =>
    renderArrayBar(ctx, item, idx, maxVal, SLOT_WIDTH, SLOT_HEIGHT)
  );

  if (vcrStore.currentFrame?.canvasStateSnapshot.loopVariables) {
    renderLoopPointers(ctx, vcrStore.currentFrame.canvasStateSnapshot.loopVariables, items.value, SLOT_WIDTH);
  }

  ctx.restore();
};

// ─── Watchers ─────────────────────────────────────────────────────────────────
watch(() => vcrStore.inputArray, (newArr) => {
  initializeItems(newArr);
  resetViewport(newArr.length);
}, { deep: true });

watch(() => vcrStore.currentFrame, (newFrame) => {
  if (newFrame) {
    matchNewArrayToItems(newFrame.canvasStateSnapshot.array);
    updateItemStatuses(newFrame);
  }
});

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  initializeItems(vcrStore.inputArray);
  setTimeout(() => {
    resizeCanvas();
    canvas.value?.addEventListener('wheel', handleWheel, { passive: false });
  }, 100);
  startListening();
  animationEngine = new CoreAnimationEngine();
  animationEngine.registerRender(render);
});

onBeforeUnmount(() => {
  stopListening();
  canvas.value?.removeEventListener('wheel', handleWheel);
  animationEngine?.destroy();
});
</script>

<style scoped>
.viewport-controls button {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
