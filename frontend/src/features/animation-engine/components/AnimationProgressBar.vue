<template>
  <div class="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-800/60">
    <div
      class="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-r-sm transition-[width] duration-100 ease-out shadow-[0_0_8px_rgba(6,182,212,0.6)]"
      :style="{ width: progressPercent + '%' }"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  progressPercent: number;
}>();
</script>
