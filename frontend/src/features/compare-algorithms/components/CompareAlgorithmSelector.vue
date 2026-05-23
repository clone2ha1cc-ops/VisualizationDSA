<template>
  <div class="flex items-center gap-4 p-4 rounded-2xl"
       style="background: rgba(30, 41, 59, 0.35); border: 1px solid rgba(255, 255, 255, 0.05); backdrop-filter: blur(12px);">
    <!-- Left Algorithm -->
    <div class="flex-1">
      <label class="block text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-1.5">
        Thuật toán Trái
      </label>
      <select
        :value="store.leftAlgorithmId"
        @change="onLeftChange"
        class="w-full px-3 py-2 rounded-xl text-sm font-medium text-white border transition-colors cursor-pointer"
        style="background: rgba(15, 23, 42, 0.7); border-color: rgba(6, 182, 212, 0.3);"
      >
        <option
          v-for="alg in sortingAlgorithms"
          :key="alg.id"
          :value="alg.id"
          :disabled="alg.id === store.rightAlgorithmId"
          class="bg-slate-900"
        >
          {{ alg.name }} — {{ alg.timeComplexity }}
        </option>
      </select>
    </div>

    <!-- VS Badge -->
    <div class="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full"
         style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(16, 185, 129, 0.15)); border: 1px solid rgba(255, 255, 255, 0.08);">
      <span class="text-xs font-black text-white tracking-wider">VS</span>
    </div>

    <!-- Right Algorithm -->
    <div class="flex-1">
      <label class="block text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1.5">
        Thuật toán Phải
      </label>
      <select
        :value="store.rightAlgorithmId"
        @change="onRightChange"
        class="w-full px-3 py-2 rounded-xl text-sm font-medium text-white border transition-colors cursor-pointer"
        style="background: rgba(15, 23, 42, 0.7); border-color: rgba(16, 185, 129, 0.3);"
      >
        <option
          v-for="alg in sortingAlgorithms"
          :key="alg.id"
          :value="alg.id"
          :disabled="alg.id === store.leftAlgorithmId"
          class="bg-slate-900"
        >
          {{ alg.name }} — {{ alg.timeComplexity }}
        </option>
      </select>
    </div>

    <!-- Input Controls -->
    <div class="flex-shrink-0 flex flex-col gap-1.5">
      <button
        @click="onGenerateAndLoad"
        class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
        style="background: linear-gradient(135deg, #06B6D4, #10B981); color: white; box-shadow: 0 0 15px rgba(6, 182, 212, 0.3);"
      >
        Tạo dữ liệu
      </button>
      <button
        @click="onLoadWithCurrent"
        class="px-4 py-2 rounded-xl text-xs font-medium transition-colors"
        style="background: rgba(30, 41, 59, 0.6); color: #94A3B8; border: 1px solid rgba(255, 255, 255, 0.06);"
      >
        So sánh
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ALGORITHM_CATALOG } from '../../dsa-modules/services/algorithmCatalog';
import { useCompareAlgorithmsStore } from '../store/useCompareAlgorithmsStore';

const store = useCompareAlgorithmsStore();

const sortingAlgorithms = computed(() =>
  ALGORITHM_CATALOG.filter((a) => a.category === 'Sorting'),
);

function onLeftChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  store.leftAlgorithmId = target.value;
}

function onRightChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  store.rightAlgorithmId = target.value;
}

function onGenerateAndLoad(): void {
  store.generateRandomInput(10);
  store.loadCompareSession(store.leftAlgorithmId, store.rightAlgorithmId);
}

function onLoadWithCurrent(): void {
  store.loadCompareSession(store.leftAlgorithmId, store.rightAlgorithmId);
}
</script>
