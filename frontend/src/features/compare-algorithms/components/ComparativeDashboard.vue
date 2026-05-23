<template>
  <div class="grid grid-cols-4 gap-3">
    <!-- Comparisons -->
    <div class="compare-stat-card">
      <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
        So sánh
      </div>
      <div class="flex items-center justify-around">
        <span class="text-lg font-extrabold" style="color: #06B6D4; text-shadow: 0 0 8px rgba(6, 182, 212, 0.2);">
          {{ store.leftStats.comparisons }}
        </span>
        <span class="text-xs font-semibold text-slate-600">vs</span>
        <span class="text-lg font-extrabold" style="color: #10B981; text-shadow: 0 0 8px rgba(16, 185, 129, 0.2);">
          {{ store.rightStats.comparisons }}
        </span>
      </div>
      <!-- Progress bars -->
      <div class="mt-2 space-y-1">
        <div class="h-1.5 rounded-full" style="background: rgba(6, 182, 212, 0.1);">
          <div
            class="h-full rounded-full transition-[width] duration-150"
            style="background: #06B6D4; box-shadow: 0 0 6px rgba(6, 182, 212, 0.4);"
            :style="{ width: leftCompareBarWidth + '%' }"
          />
        </div>
        <div class="h-1.5 rounded-full" style="background: rgba(16, 185, 129, 0.1);">
          <div
            class="h-full rounded-full transition-[width] duration-150"
            style="background: #10B981; box-shadow: 0 0 6px rgba(16, 185, 129, 0.4);"
            :style="{ width: rightCompareBarWidth + '%' }"
          />
        </div>
      </div>
    </div>

    <!-- Swaps -->
    <div class="compare-stat-card">
      <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
        Hoán vị
      </div>
      <div class="flex items-center justify-around">
        <span class="text-lg font-extrabold" style="color: #06B6D4; text-shadow: 0 0 8px rgba(6, 182, 212, 0.2);">
          {{ store.leftStats.swaps }}
        </span>
        <span class="text-xs font-semibold text-slate-600">vs</span>
        <span class="text-lg font-extrabold" style="color: #10B981; text-shadow: 0 0 8px rgba(16, 185, 129, 0.2);">
          {{ store.rightStats.swaps }}
        </span>
      </div>
      <div class="mt-2 space-y-1">
        <div class="h-1.5 rounded-full" style="background: rgba(6, 182, 212, 0.1);">
          <div
            class="h-full rounded-full transition-[width] duration-150"
            style="background: #06B6D4; box-shadow: 0 0 6px rgba(6, 182, 212, 0.4);"
            :style="{ width: leftSwapBarWidth + '%' }"
          />
        </div>
        <div class="h-1.5 rounded-full" style="background: rgba(16, 185, 129, 0.1);">
          <div
            class="h-full rounded-full transition-[width] duration-150"
            style="background: #10B981; box-shadow: 0 0 6px rgba(16, 185, 129, 0.4);"
            :style="{ width: rightSwapBarWidth + '%' }"
          />
        </div>
      </div>
    </div>

    <!-- Total Steps -->
    <div class="compare-stat-card">
      <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
        Tổng bước
      </div>
      <div class="flex items-center justify-around">
        <span class="text-lg font-extrabold" style="color: #06B6D4; text-shadow: 0 0 8px rgba(6, 182, 212, 0.2);">
          {{ store.leftTotalFrames }}
        </span>
        <span class="text-xs font-semibold text-slate-600">vs</span>
        <span class="text-lg font-extrabold" style="color: #10B981; text-shadow: 0 0 8px rgba(16, 185, 129, 0.2);">
          {{ store.rightTotalFrames }}
        </span>
      </div>
      <div class="mt-2 text-center">
        <span class="text-[10px] font-medium text-slate-500">
          Tỷ lệ: <span class="text-white font-bold">{{ store.efficiencyRatio }}x</span>
        </span>
      </div>
    </div>

    <!-- Progress -->
    <div class="compare-stat-card">
      <div class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
        Tiến trình
      </div>
      <div class="flex items-center justify-around">
        <span class="text-lg font-extrabold" style="color: #06B6D4;">
          {{ leftProgressDisplay }}%
        </span>
        <span class="text-xs font-semibold text-slate-600">vs</span>
        <span class="text-lg font-extrabold" style="color: #10B981;">
          {{ rightProgressDisplay }}%
        </span>
      </div>
      <div class="mt-2 space-y-1">
        <div class="h-1.5 rounded-full" style="background: rgba(6, 182, 212, 0.1);">
          <div
            class="h-full rounded-full transition-[width] duration-150"
            style="background: #06B6D4;"
            :style="{ width: store.leftProgressPercent + '%' }"
          />
        </div>
        <div class="h-1.5 rounded-full" style="background: rgba(16, 185, 129, 0.1);">
          <div
            class="h-full rounded-full transition-[width] duration-150"
            style="background: #10B981;"
            :style="{ width: store.rightProgressPercent + '%' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCompareAlgorithmsStore } from '../store/useCompareAlgorithmsStore';

const store = useCompareAlgorithmsStore();

const maxComparisons = computed(() =>
  Math.max(store.leftStats.comparisons, store.rightStats.comparisons, 1),
);
const maxSwaps = computed(() =>
  Math.max(store.leftStats.swaps, store.rightStats.swaps, 1),
);

const leftCompareBarWidth = computed(
  () => (store.leftStats.comparisons / maxComparisons.value) * 100,
);
const rightCompareBarWidth = computed(
  () => (store.rightStats.comparisons / maxComparisons.value) * 100,
);
const leftSwapBarWidth = computed(
  () => (store.leftStats.swaps / maxSwaps.value) * 100,
);
const rightSwapBarWidth = computed(
  () => (store.rightStats.swaps / maxSwaps.value) * 100,
);

const leftProgressDisplay = computed(() =>
  Math.round(store.leftProgressPercent),
);
const rightProgressDisplay = computed(() =>
  Math.round(store.rightProgressPercent),
);
</script>

<style scoped>
.compare-stat-card {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 12px 16px;
}
</style>
