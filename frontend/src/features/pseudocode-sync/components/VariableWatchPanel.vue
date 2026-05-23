<template>
  <div class="watch-panel-card" v-if="watchVariables.length > 0">
    <div class="watch-title">WATCH VARIABLES</div>
    <div class="watch-variables-grid">
      <TransitionGroup name="var-fade">
        <div
          v-for="variable in watchVariables"
          :key="variable.name"
          class="watch-variable-badge"
        >
          <span class="var-name">{{ variable.name }}</span>
          <span class="var-value">{{ variable.value }}</span>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePseudocodeStore } from '../store/usePseudocodeStore';

const pseudocodeStore = usePseudocodeStore();

const watchVariables = computed(() => pseudocodeStore.watchVariablesList);
</script>

<style scoped>
.watch-panel-card {
  margin: 0;
  padding: 10px 12px;
  background: rgba(15, 23, 42, 0.4);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

.watch-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 600;
}

.watch-variables-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.watch-variable-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 8px;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.03);
  min-width: 48px;
}

.var-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: #94a3b8;
}

.var-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: bold;
  color: #06b6d4;
  text-shadow: 0 0 6px rgba(6, 182, 212, 0.3);
}

.var-fade-enter-active {
  transition: all 0.3s ease-out;
}

.var-fade-leave-active {
  transition: all 0.2s ease-in;
}

.var-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.var-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
