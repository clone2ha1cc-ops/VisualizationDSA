<template>
  <div class="summary-badges-container">
    <div class="summary-badge-item">
      <span class="badge-value" :class="accuracyColor">{{ accuracy }}%</span>
      <span class="badge-label">Chính xác</span>
    </div>
    <div class="summary-badge-item">
      <span class="badge-value text-cyan-400">{{ correct }}/{{ total }}</span>
      <span class="badge-label">Câu đúng</span>
    </div>
    <div class="summary-badge-item">
      <span class="badge-value text-amber-400">{{ streak }}</span>
      <span class="badge-label">Chuỗi đúng</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ correct: number; total: number; streak: number }>();

const accuracy = computed(() =>
  props.total === 0 ? 0 : Math.round((props.correct / props.total) * 100)
);

const accuracyColor = computed(() => {
  if (accuracy.value >= 80) return 'text-emerald-400';
  if (accuracy.value >= 50) return 'text-amber-400';
  return 'text-rose-400';
});
</script>

<style scoped>
.summary-badges-container { display: flex; justify-content: space-around; margin: 20px 0; }
.summary-badge-item { display: flex; flex-direction: column; align-items: center; padding: 14px; background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; width: 90px; }
.badge-value { font-size: 22px; font-weight: 800; text-shadow: 0 0 8px currentColor; }
.badge-label { font-size: 10px; color: #64748b; margin-top: 4px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; }
</style>
