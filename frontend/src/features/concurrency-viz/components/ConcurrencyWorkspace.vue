<template>
  <div class="h-full flex flex-col gap-3 overflow-hidden">
    <!-- Top Bar: Scenario Selector + Mutex Toggle -->
    <div class="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-slate-900/80 rounded-xl border border-slate-800">
      <!-- Scenario Dropdown -->
      <div class="flex items-center gap-2">
        <label class="text-[10px] text-slate-400 uppercase tracking-wider whitespace-nowrap">Kịch bản</label>
        <select
          :value="store.selectedScenarioId"
          @change="onScenarioChange"
          class="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        >
          <option v-for="s in store.scenarioList" :key="s.id" :value="s.id">
            {{ s.title }}
          </option>
        </select>
      </div>

      <!-- Scenario Description -->
      <span class="text-[11px] text-slate-400 flex-1 truncate">
        {{ store.activeScenario?.description ?? '' }}
      </span>

      <!-- Mutex Toggle -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <span class="text-[10px] text-slate-400 uppercase tracking-wider">Mutex</span>
        <button
          @click="store.setMutexEnabled(!store.mutexEnabled)"
          class="relative w-10 h-5 rounded-full transition-colors"
          :class="store.mutexEnabled ? 'bg-cyan-600' : 'bg-slate-700'"
        >
          <span
            class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
            :class="store.mutexEnabled ? 'translate-x-5' : 'translate-x-0.5'"
          ></span>
        </button>
        <span class="text-[10px] font-bold" :class="store.mutexEnabled ? 'text-cyan-400' : 'text-slate-500'">
          {{ store.mutexEnabled ? 'BẬT' : 'TẮT' }}
        </span>
      </div>
    </div>

    <!-- Main Content: Canvas + Pseudocode -->
    <div class="flex-1 min-h-0 grid grid-cols-3 gap-3">
      <!-- Thread Rails Canvas (2/3) -->
      <div class="col-span-2 min-h-0">
        <ThreadRailsCanvas
          :threads="store.threads"
          :locks="store.locks"
          :shared-counter="store.sharedCounter"
          :is-deadlocked="store.isDeadlocked"
          :deadlocked-thread-ids="store.deadlockedThreadIds"
        />
      </div>

      <!-- Pseudocode Panel (1/3) -->
      <div class="col-span-1 min-h-0 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
        <div class="px-3 py-2 border-b border-slate-800 bg-slate-800/50">
          <span class="text-[10px] text-slate-400 uppercase tracking-wider">Mã giả đa luồng</span>
        </div>
        <div class="flex-1 overflow-auto p-3">
          <pre class="text-[11px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">{{ store.activeScenario?.pseudocode ?? '' }}</pre>
        </div>
      </div>
    </div>

    <!-- Bottom: VCR Controls + Stats -->
    <div class="flex-shrink-0 flex items-center gap-4 px-4 py-3 bg-slate-900/80 rounded-xl border border-slate-800">
      <!-- Playback Controls -->
      <div class="flex items-center gap-2">
        <!-- Stop -->
        <button
          @click="store.stopSimulation()"
          class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          title="Dừng (R)"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="1" />
          </svg>
        </button>

        <!-- Step Backward -->
        <button
          @click="store.stepBackward()"
          :disabled="store.currentStepIndex <= 0"
          class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Lùi (←)"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        <!-- Play / Pause -->
        <button
          @click="store.togglePlayPause()"
          :disabled="store.isDeadlocked && store.playbackMode !== 'DEADLOCKED'"
          class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
          :class="playButtonClass"
          :title="store.isPlaying ? 'Tạm dừng (Space)' : 'Phát (Space)'"
        >
          <!-- Replay icon when finished -->
          <svg v-if="store.playbackMode === 'FINISHED'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
          </svg>
          <!-- Play icon -->
          <svg v-else-if="!store.isPlaying" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <!-- Pause icon -->
          <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        </button>

        <!-- Step Forward -->
        <button
          @click="store.stepForward()"
          :disabled="store.currentStepIndex >= store.totalSteps || store.isDeadlocked"
          class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Tiến (→)"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>
      </div>

      <!-- Timeline Slider -->
      <div class="flex-1 flex items-center gap-3">
        <span class="text-[10px] text-slate-500 tabular-nums w-16 text-right">
          {{ store.currentStepIndex }} / {{ store.totalSteps }}
        </span>
        <input
          type="range"
          :min="0"
          :max="store.totalSteps"
          :value="store.currentStepIndex"
          @input="onScrub"
          class="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-cyan-500"
          :class="store.isDeadlocked ? 'accent-rose-500' : 'accent-cyan-500'"
        />
        <span class="text-[10px] tabular-nums w-8"
          :class="store.isDeadlocked ? 'text-rose-400' : 'text-cyan-400'"
        >
          {{ store.progressPercent }}%
        </span>
      </div>

      <!-- Speed Control -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <span class="text-[10px] text-slate-400 uppercase tracking-wider">Tốc độ</span>
        <select
          :value="store.playSpeed"
          @change="onSpeedChange"
          class="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        >
          <option :value="0.25">0.25x</option>
          <option :value="0.5">0.5x</option>
          <option :value="1">1x</option>
          <option :value="2">2x</option>
          <option :value="4">4x</option>
        </select>
      </div>

      <!-- Playback Mode Badge -->
      <div class="flex-shrink-0">
        <span
          class="text-[9px] font-bold uppercase px-2 py-1 rounded-md"
          :class="modeBadgeClass"
        >
          {{ store.playbackMode }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { useConcurrencyStore } from '../store/useConcurrencyStore';
import ThreadRailsCanvas from './ThreadRailsCanvas.vue';

const store = useConcurrencyStore();

const playButtonClass = computed(() => {
  if (store.playbackMode === 'DEADLOCKED') return 'bg-rose-600/30 text-rose-400 cursor-not-allowed';
  if (store.playbackMode === 'FINISHED') return 'bg-emerald-600/30 text-emerald-400 hover:bg-emerald-600/50';
  if (store.isPlaying) return 'bg-cyan-600 text-white hover:bg-cyan-500';
  return 'bg-cyan-600/30 text-cyan-400 hover:bg-cyan-600/50';
});

const modeBadgeClass = computed(() => {
  switch (store.playbackMode) {
    case 'PLAYING': return 'bg-cyan-900/40 text-cyan-400';
    case 'PAUSED': return 'bg-amber-900/40 text-amber-400';
    case 'FINISHED': return 'bg-emerald-900/40 text-emerald-400';
    case 'DEADLOCKED': return 'bg-rose-900/40 text-rose-400';
    default: return 'bg-slate-800 text-slate-500';
  }
});

function onScenarioChange(e: Event): void {
  const target = e.target as HTMLSelectElement;
  store.initializeScenario(target.value);
}

function onScrub(e: Event): void {
  const target = e.target as HTMLInputElement;
  store.scrubToStep(Number(target.value));
}

function onSpeedChange(e: Event): void {
  const target = e.target as HTMLSelectElement;
  store.setSpeed(Number(target.value));
}

function handleKeydown(e: KeyboardEvent): void {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) return;

  switch (e.code) {
    case 'Space':
      e.preventDefault();
      store.togglePlayPause();
      break;
    case 'ArrowRight':
      e.preventDefault();
      store.stepForward();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      store.stepBackward();
      break;
    case 'KeyR':
      e.preventDefault();
      store.stopSimulation();
      break;
  }
}

onMounted(() => {
  store.initializeScenario('race-condition');
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  store.cleanup();
});
</script>
