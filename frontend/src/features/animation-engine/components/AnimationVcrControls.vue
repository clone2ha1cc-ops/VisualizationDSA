<template>
  <div class="h-14 rounded-xl overflow-hidden border border-slate-800 shadow-lg bg-slate-900 flex items-center justify-center gap-3 px-4">
    <button class="ctrl-btn" @click="$emit('stop')" title="Reset (R)">
      <BaseIcon name="stop" class="w-3.5 h-3.5" />
    </button>
    <button class="ctrl-btn" @click="$emit('stepBackward')" title="Step Back (←)">
      <BaseIcon name="step-backward" class="w-3.5 h-3.5" />
    </button>
    <button
      class="ctrl-btn-primary"
      @click="$emit('togglePlay')"
      :title="isPlaying ? 'Pause (Space)' : 'Play (Space)'"
    >
      <BaseIcon :name="isPlaying ? 'pause' : 'play'" class="w-4 h-4" />
    </button>
    <button class="ctrl-btn" @click="$emit('stepForward')" title="Step Forward (→)">
      <BaseIcon name="step-forward" class="w-3.5 h-3.5" />
    </button>

    <!-- Timeline Scrubber -->
    <input
      type="range"
      min="0"
      :max="Math.max(0, totalSteps - 1)"
      :value="currentIndex"
      class="flex-1 h-1 accent-cyan-500 cursor-pointer"
      @input="onScrub"
    />

    <!-- Speed -->
    <select
      class="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded px-2 py-1 focus:outline-none focus:border-cyan-500 transition-colors"
      :value="playbackSpeed"
      @change="onSpeedChange"
    >
      <option :value="0.5">0.5x</option>
      <option :value="1">1x</option>
      <option :value="2">2x</option>
      <option :value="5">5x</option>
      <option :value="10">10x</option>
    </select>

    <span class="text-[10px] text-slate-500 min-w-[80px] text-right font-mono">
      {{ currentIndex + 1 }} / {{ totalSteps }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isPlaying: boolean;
  currentIndex: number;
  totalSteps: number;
  playbackSpeed: number;
}>();

const emit = defineEmits<{
  (e: 'stop'): void;
  (e: 'stepBackward'): void;
  (e: 'stepForward'): void;
  (e: 'togglePlay'): void;
  (e: 'scrub', index: number): void;
  (e: 'speedChange', speed: number): void;
}>();

function onScrub(e: Event): void {
  const target = e.target as HTMLInputElement;
  emit('scrub', parseInt(target.value, 10));
}

function onSpeedChange(e: Event): void {
  const target = e.target as HTMLSelectElement;
  emit('speedChange', parseFloat(target.value));
}
</script>

<style scoped>
.ctrl-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background-color: #1e293b;
  border: 1px solid #334155;
  color: #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  transition: color 0.15s, background-color 0.15s;
  cursor: pointer;
}
.ctrl-btn:hover {
  background-color: #334155;
  color: #ffffff;
}
.ctrl-btn-primary {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background-color: #0891b2;
  border: none;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  transition: background-color 0.15s;
  cursor: pointer;
}
.ctrl-btn-primary:hover {
  background-color: #06b6d4;
}
</style>
