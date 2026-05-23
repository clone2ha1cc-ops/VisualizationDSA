<template>
  <div
    ref="containerRef"
    class="relative w-full h-full overflow-hidden rounded-2xl"
    :class="isFinished ? 'compare-canvas-finished' : ''"
    style="background: rgba(30, 41, 59, 0.35); border: 1px solid rgba(255, 255, 255, 0.05); backdrop-filter: blur(12px);"
  >
    <!-- Header -->
    <div class="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2"
         style="background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px);">
      <div class="flex items-center gap-2">
        <div
          class="w-2.5 h-2.5 rounded-full"
          :style="{ background: accentColor, boxShadow: `0 0 8px ${accentColor}40` }"
        />
        <span class="text-xs font-bold text-white uppercase tracking-wider">
          {{ algorithmName }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-[10px] font-mono text-slate-400">
          {{ timeComplexity }}
        </span>
        <span
          v-if="isFinished"
          class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
          :style="{ background: `${accentColor}20`, color: accentColor, boxShadow: `0 0 12px ${accentColor}30` }"
        >
          Hoàn thành
        </span>
      </div>
    </div>

    <!-- Canvas -->
    <canvas ref="canvasRef" class="w-full h-full block" />

    <!-- Step counter -->
    <div
      v-if="currentFrame"
      class="absolute bottom-3 left-4 pointer-events-none"
    >
      <span class="text-[10px] font-bold uppercase tracking-[0.08em]"
            :style="{ color: accentColor }">
        Step {{ currentFrame.stepId }} / {{ totalFrames }}
      </span>
      <p class="text-[11px] font-medium text-slate-300 leading-tight mt-0.5 max-w-[280px]"
         style="text-shadow: 0 1px 8px rgba(0,0,0,0.7);">
        {{ currentFrame.explanation }}
      </p>
    </div>

    <!-- Empty state -->
    <div
      v-if="!currentFrame"
      class="absolute inset-0 flex items-center justify-center pt-10"
    >
      <p class="text-sm text-slate-500 text-center px-6">
        Chọn thuật toán và tạo dữ liệu để bắt đầu so sánh.
      </p>
    </div>

    <!-- Progress bar bottom -->
    <div class="absolute bottom-0 left-0 right-0 h-[3px]" style="background: rgba(30, 41, 59, 0.6);">
      <div
        class="h-full rounded-r-sm transition-[width] duration-100 ease-out"
        :style="{
          width: progressPercent + '%',
          background: accentColor,
          boxShadow: `0 0 8px ${accentColor}90`,
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import type { FrameDTO } from '../../animation-engine/types/animation.types';

// ─── PROPS ─────────────────────────────────────────────────────────────────
const props = defineProps<{
  currentFrame: FrameDTO | null;
  totalFrames: number;
  currentIndex: number;
  algorithmName: string;
  timeComplexity: string;
  isFinished: boolean;
  accentColor: string;
  playbackSpeed: number;
}>();

const progressPercent = computed(() => {
  if (props.totalFrames <= 1) return 0;
  return (props.currentIndex / (props.totalFrames - 1)) * 100;
});

// ─── CANVAS CONSTANTS ──────────────────────────────────────────────────────
const MARGIN = 30;
const MARGIN_BOTTOM = 30;
const PADDING_TOP = 50;
const GAP = 6;

const COLOR_BG = '#0F172A';
const COLOR_DEFAULT = '#38BDF8';
const COLOR_COMPARE = '#FBBF24';
const COLOR_SWAP = '#EF4444';
const COLOR_SORTED = '#10B981';
const COLOR_TEXT = '#FFFFFF';

// ─── REFS ──────────────────────────────────────────────────────────────────
const containerRef = ref<HTMLDivElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

interface BarPosition {
  x: number;
  targetX: number;
}
let barPositions: BarPosition[] = [];
let isTransitioning = false;
let animationProgress = 0;
let lastTimestamp = 0;
let rafId: number | null = null;

function easeOut(t: number): number {
  return 1 - (1 - t) ** 3;
}

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

function calculateColumnWidth(n: number, canvasW: number): number {
  if (n <= 0) return 0;
  return (canvasW - GAP * (n - 1) - MARGIN * 2) / n;
}

function calculateColumnHeight(
  value: number,
  maxValue: number,
  canvasH: number,
): number {
  if (maxValue <= 0) return 0;
  return (value / maxValue) * (canvasH - PADDING_TOP - MARGIN_BOTTOM);
}

function calculateX(index: number, columnWidth: number): number {
  return MARGIN + index * (columnWidth + GAP);
}

function determineColor(index: number): string {
  const frame = props.currentFrame;
  if (!frame) return COLOR_DEFAULT;

  if (frame.highlights.sorted.includes(index)) return COLOR_SORTED;
  if (frame.highlights.swap.includes(index)) return COLOR_SWAP;
  if (frame.highlights.compare.includes(index)) return COLOR_COMPARE;
  return COLOR_DEFAULT;
}

function prepareTransition(): void {
  const frame = props.currentFrame;
  if (!frame || !canvasRef.value) return;

  const dpr = window.devicePixelRatio || 1;
  const canvasW = canvasRef.value.width / dpr;
  const n = frame.dataState.length;
  const columnWidth = calculateColumnWidth(n, canvasW);

  const newPositions: BarPosition[] = [];
  for (let i = 0; i < n; i++) {
    const targetX = calculateX(i, columnWidth);
    const currentX = barPositions[i]?.x ?? targetX;
    newPositions.push({ x: currentX, targetX });
  }
  barPositions = newPositions;
  animationProgress = 0;
  isTransitioning = true;
}

function renderCanvas(): void {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = COLOR_BG;
  ctx.fillRect(0, 0, w, h);

  const frame = props.currentFrame;
  if (!frame) return;

  const n = frame.dataState.length;
  if (n === 0) return;

  const columnWidth = calculateColumnWidth(n, w);
  const maxVal = Math.max(...frame.dataState, 1);

  for (let i = 0; i < n; i++) {
    const colH = calculateColumnHeight(frame.dataState[i], maxVal, h);
    const yPos = h - colH - MARGIN_BOTTOM;

    let xPos = calculateX(i, columnWidth);
    if (isTransitioning && barPositions[i]) {
      const t = easeOut(animationProgress);
      xPos = lerp(barPositions[i].x, barPositions[i].targetX, t);
    }

    const color = determineColor(i);
    ctx.fillStyle = color;

    const radius = Math.min(3, columnWidth / 4);
    ctx.beginPath();
    ctx.moveTo(xPos + radius, yPos);
    ctx.lineTo(xPos + columnWidth - radius, yPos);
    ctx.quadraticCurveTo(
      xPos + columnWidth,
      yPos,
      xPos + columnWidth,
      yPos + radius,
    );
    ctx.lineTo(xPos + columnWidth, yPos + colH);
    ctx.lineTo(xPos, yPos + colH);
    ctx.lineTo(xPos, yPos + radius);
    ctx.quadraticCurveTo(xPos, yPos, xPos + radius, yPos);
    ctx.closePath();
    ctx.fill();

    if (color === COLOR_SORTED) {
      ctx.shadowColor = COLOR_SORTED;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = COLOR_TEXT;
    ctx.font = `bold ${Math.min(11, columnWidth * 0.55)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(
      frame.dataState[i].toString(),
      xPos + columnWidth / 2,
      yPos - 4,
    );

    ctx.fillStyle = '#64748b';
    ctx.font = `${Math.min(9, columnWidth * 0.4)}px Inter, sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText(
      i.toString(),
      xPos + columnWidth / 2,
      h - MARGIN_BOTTOM + 5,
    );
  }

  if (!isTransitioning) {
    barPositions = frame.dataState.map((_, i) => {
      const x = calculateX(i, columnWidth);
      return { x, targetX: x };
    });
  }
}

function tick(timestamp: number): void {
  if (isTransitioning) {
    const duration = 300 / props.playbackSpeed;
    const elapsed = timestamp - lastTimestamp;
    animationProgress += elapsed / duration;

    if (animationProgress >= 1) {
      animationProgress = 1;
      isTransitioning = false;
      barPositions.forEach((bp) => {
        bp.x = bp.targetX;
      });
    }
  }

  renderCanvas();
  lastTimestamp = timestamp;
  rafId = requestAnimationFrame(tick);
}

function resizeCanvas(): void {
  const canvas = canvasRef.value;
  const container = containerRef.value;
  if (!canvas || !container) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = container.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';

  renderCanvas();
}

let resizeObserver: ResizeObserver | null = null;

watch(
  () => props.currentIndex,
  () => {
    prepareTransition();
  },
);

onMounted(() => {
  resizeCanvas();
  lastTimestamp = performance.now();
  rafId = requestAnimationFrame(tick);

  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => resizeCanvas());
    resizeObserver.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  if (rafId !== null) cancelAnimationFrame(rafId);
  resizeObserver?.disconnect();
});
</script>

<style scoped>
.compare-canvas-finished {
  border-color: rgba(16, 185, 129, 0.25) !important;
  box-shadow: 0 0 25px rgba(16, 185, 129, 0.08);
}
</style>
