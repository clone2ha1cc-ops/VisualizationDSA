<template>
  <div class="watch-panel-container">
    <!-- Header -->
    <div class="flex items-center gap-2 px-4 py-2 border-b"
      style="border-color: rgba(255, 255, 255, 0.05); background: rgba(30, 41, 59, 0.6);"
    >
      <div class="w-2 h-2 rounded-full bg-cyan-500"></div>
      <span class="text-xs font-medium text-slate-300 uppercase tracking-wider">
        Watch Panel
      </span>
      <span class="ml-auto text-[10px] text-slate-500 font-mono">
        {{ variableEntries.length }} var{{ variableEntries.length !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Variables List -->
    <div class="watch-variables-list">
      <template v-if="variableEntries.length === 0">
        <div class="text-center text-slate-500 text-xs py-6">
          Chua co bien nao dang theo doi
        </div>
      </template>

      <TransitionGroup name="var-item" tag="div" class="flex flex-col gap-1.5">
        <div
          v-for="entry in variableEntries"
          :key="entry.name"
          class="watch-variable-item-row"
          :class="{ 'value-mutated': mutatedKeys.includes(entry.name) }"
        >
          <!-- Variable name -->
          <span class="watch-var-name">{{ entry.name }}</span>

          <!-- Assignment arrow -->
          <span class="text-slate-600 text-xs mx-2">=</span>

          <!-- Variable value -->
          <span
            class="watch-var-value"
            :class="{ 'text-cyan-400': mutatedKeys.includes(entry.name) }"
          >
            {{ formatValue(entry.value) }}
          </span>

          <!-- Mutation indicator dot -->
          <div
            v-if="mutatedKeys.includes(entry.name)"
            class="w-1.5 h-1.5 rounded-full bg-cyan-400 ml-2 animate-pulse"
          ></div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  variables: Record<string, string | number | undefined>;
  mutatedKeys: string[];
}>();

interface VariableEntry {
  name: string;
  value: string | number | undefined;
}

const variableEntries = computed<VariableEntry[]>(() => {
  return Object.entries(props.variables).map(([name, value]) => ({
    name,
    value,
  }));
});

function formatValue(value: string | number | undefined): string {
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  return String(value);
}
</script>

<style scoped>
.watch-panel-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  overflow: hidden;
}

.watch-variables-list {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.watch-variable-item-row {
  display: flex;
  align-items: center;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border-left: 2px solid transparent;
  transition: all 0.2s ease;
}

.watch-variable-item-row.value-mutated {
  border-left-color: #06B6D4;
  background: rgba(6, 182, 212, 0.04);
}

.watch-var-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #94A3B8;
}

.watch-var-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  color: #E2E8F0;
}

/* TransitionGroup animations */
.var-item-enter-active {
  transition: all 0.25s ease;
}
.var-item-leave-active {
  transition: all 0.2s ease;
}
.var-item-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}
.var-item-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
