<template>
  <div
    ref="container"
    class="relative w-full h-[380px] bg-[#090f19] rounded-[18px] border border-slate-800/85 overflow-hidden shadow-[0_8px_40px_rgba(6,182,212,0.06),0_2px_12px_rgba(0,0,0,0.5)]"
  >
    <!-- Background grid -->
    <div
      class="absolute inset-0 opacity-[0.18] pointer-events-none bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_50%,#000_60%,transparent_100%)] bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)]"
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
    <SortingHudOverlay :stepDescription="stepDescription" />

    <!-- Algorithm selector + controls -->
    <SortingAlgorithmControls
      :selectedAlgo="selectedAlgo"
      :zoom="zoom"
      @select="selectAlgorithm"
      @reset="resetViewport"
    />

    <!-- Progress bar -->
    <SortingProgressBar :progressPercent="progressPercent" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useSortingCanvas } from "../composables/useSortingCanvas";
import SortingHudOverlay from "./SortingHudOverlay.vue";
import SortingAlgorithmControls from "./SortingAlgorithmControls.vue";
import SortingProgressBar from "./SortingProgressBar.vue";

const container = ref<HTMLDivElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);

const {
  selectedAlgo,
  stepDescription,
  progressPercent,
  zoom,
  selectAlgorithm,
  resetViewport,
  onMouseDown,
  onMouseMove,
  onMouseUp,
} = useSortingCanvas(canvas, container);
</script>
