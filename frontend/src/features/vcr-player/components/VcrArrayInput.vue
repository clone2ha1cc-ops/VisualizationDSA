<template>
  <div class="space-y-2">
    <label class="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Input Array</label>
    <div class="flex gap-2">
      <div class="flex-1 relative">
        <input
          v-model="rawInputArray"
          type="text"
          placeholder="45, 12, 85, 32, 9, 60"
          class="w-full bg-slate-950 border border-slate-700/50 rounded-lg px-3 py-2 text-sm font-mono text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none transition-colors"
        />
      </div>
      <button @click="$emit('randomize')" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors">
        Random
      </button>
      <button @click="$emit('compile')" class="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium transition-colors">
        Run
      </button>
    </div>
    <div v-if="compilationError" class="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-300">
      {{ compilationError }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ rawInputArray: string; compilationError: string | null }>();
defineEmits<{ randomize: []; compile: [] }>();
</script>
