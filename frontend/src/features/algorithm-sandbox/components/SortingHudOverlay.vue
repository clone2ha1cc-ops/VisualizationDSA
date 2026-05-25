<template>
  <div class="absolute top-3.5 left-4 flex flex-col gap-1 pointer-events-none">
    <span class="text-[10px] font-bold uppercase tracking-[0.08em] text-cyan-400">
      Algorithm Viewport
    </span>
    <span class="text-[13px] font-semibold text-slate-100 max-w-[340px] leading-[1.4] drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]">
      {{ stepDescription }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  stepDescription: string;
}>();
</script>
