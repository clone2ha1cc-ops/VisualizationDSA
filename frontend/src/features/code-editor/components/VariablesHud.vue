<template>
  <div
    v-if="activeLoopVars.length > 0"
    class="px-4 py-2 bg-slate-800/50 border-b border-slate-700/30 shrink-0"
  >
    <div class="flex items-center gap-2 flex-wrap">
      <span class="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
        Variables:
      </span>
      <span
        v-for="[vName, vVal] in activeLoopVars"
        :key="vName"
        class="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-xs font-mono text-cyan-300"
      >
        {{ vName }} = {{ vVal }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  activeLoopVars: [string, any][];
}>();
</script>
