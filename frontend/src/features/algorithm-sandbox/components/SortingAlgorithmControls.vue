<template>
  <div class="absolute top-3 right-3.5 flex items-center gap-2 bg-[#0e1726]/80 backdrop-blur-md border border-slate-700/70 py-1.5 px-2.5 rounded-xl">
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
        @click="$emit('select', algo.key)"
      >
        {{ algo.label }}
      </button>
    </div>
    <div class="w-[1px] h-[18px] bg-slate-800" />
    
    <!-- Zoom info -->
    <span class="text-[11px] font-mono text-cyan-400 px-1.5">
      {{ Math.round(zoom * 100) }}%
    </span>
    
    <button
      class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-400 bg-transparent border border-slate-700/50 cursor-pointer transition-all duration-150 hover:text-white hover:border-slate-600 hover:bg-slate-800/40 active:scale-95"
      title="Reset view"
      @click="$emit('reset')"
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
</template>

<script setup lang="ts">
import type { SortAlgorithm } from '../types/sorting.types';

const ALGORITHMS: { key: SortAlgorithm; label: string }[] = [
  { key: "bubble", label: "Bubble" },
  { key: "quick", label: "Quick" },
  { key: "merge", label: "Merge" },
  { key: "heap", label: "Heap" },
];

defineProps<{
  selectedAlgo: SortAlgorithm;
  zoom: number;
}>();

defineEmits<{
  (e: 'select', algo: SortAlgorithm): void;
  (e: 'reset'): void;
}>();
</script>
