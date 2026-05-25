<template>
  <div class="h-full flex flex-col gap-3 overflow-auto p-3">
    <!-- Search Bar -->
    <div class="relative">
      <input
        ref="searchInput"
        v-model="searchQuery"
        type="text"
        placeholder="Tìm kiếm thuật toán... (nhấn / để focus)"
        class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        @input="algoStore.setSearchQuery(searchQuery)"
      />
    </div>

    <!-- Algorithm Cards Grid -->
    <div
      v-for="category in groupedAlgorithms"
      :key="category.name"
      class="space-y-2"
    >
      <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
        {{ category.name }}
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        <button
          v-for="algo in category.items"
          :key="algo.id"
          class="group bg-slate-800/60 border rounded-lg p-3 text-left transition-all hover:bg-slate-700/60 hover:border-cyan-600 hover:shadow-lg hover:shadow-cyan-900/20 focus:outline-none focus:border-cyan-500"
          :class="
            algoStore.currentAlgorithm?.id === algo.id
              ? 'border-cyan-500 bg-slate-700/60'
              : 'border-slate-700'
          "
          @click="handleSelect(algo)"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-semibold text-slate-100 group-hover:text-white">
              {{ algo.name }}
            </span>
            <span
              class="text-[10px] px-1.5 py-0.5 rounded font-medium"
              :class="difficultyClass(algo.difficulty)"
            >
              {{ algo.difficulty }}
            </span>
          </div>
          <div class="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
            <span class="flex items-center gap-1"><BaseIcon name="clock" class="w-3 h-3 text-slate-400" /> {{ algo.timeComplexity }}</span>
            <span class="flex items-center gap-1"><BaseIcon name="database" class="w-3 h-3 text-slate-400" /> {{ algo.spaceComplexity }}</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useAlgorithmStore } from '../store/useAlgorithmStore';
import type { Algorithm } from '../types/algorithm.types';

const algoStore = useAlgorithmStore();
const searchQuery = ref('');
const searchInput = ref<HTMLInputElement | null>(null);

const emit = defineEmits<{
  (e: 'select', algo: Algorithm): void;
}>();

const groupedAlgorithms = computed(() => {
  const groups: Record<string, Algorithm[]> = {};
  for (const algo of algoStore.filteredAlgorithms) {
    if (!groups[algo.category]) groups[algo.category] = [];
    groups[algo.category].push(algo);
  }
  return Object.entries(groups).map(([name, items]) => ({ name, items }));
});

function difficultyClass(difficulty: string): string {
  switch (difficulty) {
    case 'Easy':
      return 'bg-emerald-900/50 text-emerald-400';
    case 'Medium':
      return 'bg-amber-900/50 text-amber-400';
    case 'Hard':
      return 'bg-red-900/50 text-red-400';
    default:
      return 'bg-slate-700 text-slate-400';
  }
}

function handleSelect(algo: Algorithm): void {
  algoStore.selectAlgorithm(algo);
  emit('select', algo);
}

function handleKeydown(e: KeyboardEvent): void {
  if (e.key === '/' && document.activeElement !== searchInput.value) {
    e.preventDefault();
    searchInput.value?.focus();
  }
  if (e.key === 'Escape') {
    searchQuery.value = '';
    algoStore.setSearchQuery('');
    searchInput.value?.blur();
  }
}

onMounted(() => {
  algoStore.fetchAlgorithms();
  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>
