<template>
  <div class="flex items-center gap-3 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
    <button
      class="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors"
      @click="$emit('back')"
    >
      ← Quay lại
    </button>
    <div class="flex-1 flex items-center gap-3">
      <span class="text-sm font-bold text-white">{{ algorithm.name }}</span>
      <span class="text-[10px] px-1.5 py-0.5 rounded bg-cyan-900/50 text-cyan-400">
        {{ algorithm.category }}
      </span>
      <span v-if="metadata" class="text-[11px] text-slate-400 flex items-center gap-2">
        <span class="flex items-center gap-1"><BaseIcon name="clock" class="w-3 h-3 text-slate-400" /> {{ metadata.timeComplexity }}</span>
        <span>·</span>
        <span class="flex items-center gap-1"><BaseIcon name="database" class="w-3 h-3 text-slate-400" /> {{ metadata.spaceComplexity }}</span>
      </span>
    </div>
    <button
      class="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
      :disabled="isExecuting"
      @click="$emit('execute')"
    >
      {{ isExecuting ? 'Đang chạy...' : 'Trực quan hóa' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Algorithm } from '../types/algorithm.types';

defineProps<{
  algorithm: Algorithm;
  metadata: {
    timeComplexity: string;
    spaceComplexity: string;
  } | null;
  isExecuting: boolean;
}>();

defineEmits<{
  (e: 'back'): void;
  (e: 'execute'): void;
}>();
</script>
