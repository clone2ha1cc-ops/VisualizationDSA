<template>
  <div class="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-slate-900/80 rounded-xl border border-slate-800">
    <!-- Scenario Dropdown -->
    <div class="flex items-center gap-2">
      <label class="text-[10px] text-slate-400 uppercase tracking-wider whitespace-nowrap">Kịch bản</label>
      <select
        :value="selectedScenarioId"
        @change="onScenarioChange"
        class="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
      >
        <option v-for="s in scenarioList" :key="s.id" :value="s.id">{{ s.title }}</option>
      </select>
    </div>

    <span class="text-[11px] text-slate-400 flex-1 truncate">{{ scenarioDescription }}</span>

    <!-- Mutex Toggle -->
    <div class="flex items-center gap-2 flex-shrink-0">
      <span class="text-[10px] text-slate-400 uppercase tracking-wider">Mutex</span>
      <button
        @click="$emit('toggle-mutex')"
        class="relative w-10 h-5 rounded-full transition-colors"
        :class="mutexEnabled ? 'bg-cyan-600' : 'bg-slate-700'"
      >
        <span
          class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
          :class="mutexEnabled ? 'translate-x-5' : 'translate-x-0.5'"
        ></span>
      </button>
      <span class="text-[10px] font-bold" :class="mutexEnabled ? 'text-cyan-400' : 'text-slate-500'">
        {{ mutexEnabled ? 'BẬT' : 'TẮT' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  selectedScenarioId: string;
  scenarioList: { id: string; title: string }[];
  scenarioDescription: string;
  mutexEnabled: boolean;
}>();

const emit = defineEmits<{ 'scenario-change': [id: string]; 'toggle-mutex': [] }>();

function onScenarioChange(e: Event): void {
  emit('scenario-change', (e.target as HTMLSelectElement).value);
}
</script>
