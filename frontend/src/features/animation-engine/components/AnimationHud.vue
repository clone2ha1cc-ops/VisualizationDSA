<template>
  <div class="absolute top-3 left-4 max-w-[420px] pointer-events-none">
    <span class="text-[10px] font-bold uppercase tracking-[0.08em] text-cyan-400">
      Step {{ stepId }} / {{ totalSteps }}
    </span>
    <p class="text-[13px] font-semibold text-slate-100 leading-[1.4] mt-1 drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]">
      {{ explanation }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  stepId: number;
  totalSteps: number;
  explanation: string;
}>();
</script>
