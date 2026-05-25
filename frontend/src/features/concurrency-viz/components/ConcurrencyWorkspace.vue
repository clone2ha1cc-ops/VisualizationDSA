<template>
  <div class="h-full flex flex-col gap-3 overflow-hidden">
    <ConcurrencyScenarioToolbar
      :selected-scenario-id="store.selectedScenarioId"
      :scenario-list="store.scenarioList"
      :scenario-description="store.activeScenario?.description ?? ''"
      :mutex-enabled="store.mutexEnabled"
      @scenario-change="store.initializeScenario"
      @toggle-mutex="store.setMutexEnabled(!store.mutexEnabled)"
    />

    <!-- Main Content: Canvas + Pseudocode -->
    <div class="flex-1 min-h-0 grid grid-cols-3 gap-3">
      <div class="col-span-2 min-h-0">
        <ThreadRailsCanvas
          :threads="store.threads"
          :locks="store.locks"
          :shared-counter="store.sharedCounter"
          :is-deadlocked="store.isDeadlocked"
          :deadlocked-thread-ids="store.deadlockedThreadIds"
        />
      </div>
      <div class="col-span-1 min-h-0 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
        <div class="px-3 py-2 border-b border-slate-800 bg-slate-800/50">
          <span class="text-[10px] text-slate-400 uppercase tracking-wider">Mã giả đa luồng</span>
        </div>
        <div class="flex-1 overflow-auto p-3">
          <pre class="text-[11px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">{{ store.activeScenario?.pseudocode ?? '' }}</pre>
        </div>
      </div>
    </div>

    <ConcurrencyPlaybackBar
      :step-index="store.currentStepIndex"
      :total-steps="store.totalSteps"
      :progress-percent="store.progressPercent"
      :is-playing="store.isPlaying"
      :is-deadlocked="store.isDeadlocked"
      :playback-mode="store.playbackMode"
      :play-speed="store.playSpeed"
      @stop="store.stopSimulation()"
      @step-backward="store.stepBackward()"
      @step-forward="store.stepForward()"
      @toggle-play="store.togglePlayPause()"
      @scrub="store.scrubToStep"
      @speed-change="store.setSpeed"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useConcurrencyStore } from '../store/useConcurrencyStore';
import ThreadRailsCanvas from './ThreadRailsCanvas.vue';
import ConcurrencyScenarioToolbar from './ConcurrencyScenarioToolbar.vue';
import ConcurrencyPlaybackBar from './ConcurrencyPlaybackBar.vue';

const store = useConcurrencyStore();

function handleKeydown(e: KeyboardEvent): void {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) return;
  switch (e.code) {
    case 'Space': e.preventDefault(); store.togglePlayPause(); break;
    case 'ArrowRight': e.preventDefault(); store.stepForward(); break;
    case 'ArrowLeft': e.preventDefault(); store.stepBackward(); break;
    case 'KeyR': e.preventDefault(); store.stopSimulation(); break;
  }
}

onMounted(() => { store.initializeScenario('race-condition'); window.addEventListener('keydown', handleKeydown); });
onUnmounted(() => { window.removeEventListener('keydown', handleKeydown); store.cleanup(); });
</script>
