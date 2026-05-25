<template>
  <div class="control-panel-container" :class="{ 'disabled-panel': store.interactionLocked }">
    <!-- VCR Controls Row -->
    <div class="vcr-row">
      <VcrButtonsRow
        :is-first-frame="isFirstFrame"
        :is-last-frame="isLastFrame"
        :is-uninitialized="store.playbackState === 'UNINITIALIZED'"
        :is-playing="store.isPlaying"
        :is-finished="store.isFinished"
        @step-backward="store.stepBackward()"
        @step-forward="store.stepForward()"
        @toggle-play="handleTogglePlay"
      />

      <AnimTimelineSlider
        :current-index="store.currentIndex"
        :total-steps="store.totalSteps"
        :disabled="store.interactionLocked"
        :progress-style="sliderProgressStyle"
        :tooltip-visible="sliderTooltip.tooltip.value.visible"
        :tooltip-x="sliderTooltip.tooltip.value.x"
        :tooltip-step="sliderTooltip.tooltip.value.step"
        :tooltip-text="truncateText(sliderTooltip.tooltip.value.text, 55)"
        @hover="onSliderHover"
        @leave="sliderTooltip.hideTooltip()"
        @scrub-start="scrubEngine.startScrub()"
        @scrub-input="onScrubInput"
        @scrub-end="scrubEngine.endScrub()"
        ref="timelineRef"
      />

      <!-- Speed Dropdown -->
      <div class="speed-controls-right">
        <select v-model.number="playbackSpeedModel" class="speed-select-dropdown" :disabled="store.interactionLocked">
          <option v-for="speed in SPEED_PRESETS" :key="speed" :value="speed">
            {{ speed }}x{{ speed === 1.0 ? ' (Mặc định)' : '' }}
          </option>
        </select>
      </div>
    </div>

    <!-- State indicator row -->
    <div class="state-indicator-row">
      <span class="state-dot" :class="{
        'bg-slate-600': store.playbackState === 'UNINITIALIZED',
        'bg-cyan-500': store.playbackState === 'LOADED',
        'bg-green-500 animate-pulse': store.playbackState === 'PLAYING',
        'bg-amber-500': store.playbackState === 'PAUSED',
        'bg-emerald-500': store.playbackState === 'FINISHED',
      }" />
      <span class="text-xs text-slate-500">{{ store.playbackState }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useAnimationStore } from '../store/useAnimationStore';
import { SPEED_PRESETS, useSpeedPreferences } from '../composables/useSpeedPreferences';
import { useThrottledScrub } from '../composables/useThrottledScrub';
import { usePlaybackHotkeys } from '../composables/usePlaybackHotkeys';
import { useSliderTooltip, truncateText } from '../composables/useSliderTooltip';
import VcrButtonsRow from './VcrButtonsRow.vue';
import AnimTimelineSlider from './AnimTimelineSlider.vue';

const store        = useAnimationStore();
const speedPrefs   = useSpeedPreferences();
const scrubEngine  = useThrottledScrub();
const sliderTooltip = useSliderTooltip();
const { registerHotkeys } = usePlaybackHotkeys();

const timelineRef  = ref<InstanceType<typeof AnimTimelineSlider> | null>(null);
const isFirstFrame = computed(() => store.currentIndex === 0);
const isLastFrame  = computed(() => store.isFinished);

const playbackSpeedModel = computed({
  get: () => store.playbackSpeed,
  set: (val: number) => { store.setSpeed(val); speedPrefs.saveSpeed(val); },
});

const sliderProgressStyle = computed(() => {
  const percent = store.totalSteps <= 1 ? 0 : (store.currentIndex / (store.totalSteps - 1)) * 100;
  return { '--progress-percent': `${percent}%` };
});

function handleTogglePlay(): void {
  if (store.isFinished) { store.goToFrame(0); store.play(); } else { store.togglePlay(); }
}

function onScrubInput(event: Event): void {
  scrubEngine.updateScrubPosition(parseInt((event.target as HTMLInputElement).value, 10));
}

function onSliderHover(event: MouseEvent): void {
  sliderTooltip.handleSliderHover(event, timelineRef.value?.containerRef ?? null);
}

let cleanupHotkeys: (() => void) | null = null;
onMounted(() => { speedPrefs.initSpeedFromStorage(); cleanupHotkeys = registerHotkeys(); });
onBeforeUnmount(() => { if (cleanupHotkeys) cleanupHotkeys(); });
</script>

<style scoped>
.control-panel-container { height: 100%; display: flex; flex-direction: column; gap: 8px; padding: 12px 16px; background: rgba(15,23,42,0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-top: 1px solid rgba(148,163,184,0.1); color: #e2e8f0; transition: opacity 0.2s ease; }
.disabled-panel { opacity: 0.5; pointer-events: none; }
.vcr-row { display: flex; align-items: center; gap: 16px; flex: 1; min-height: 0; }
.speed-controls-right { flex-shrink: 0; }
.speed-select-dropdown { padding: 6px 10px; border-radius: 8px; background: rgba(30,41,59,0.8); border: 1px solid rgba(71,85,105,0.5); color: #94a3b8; font-size: 12px; font-weight: 600; cursor: pointer; outline: none; transition: all 0.15s; }
.speed-select-dropdown:hover { border-color: #10b981; color: #10b981; }
.speed-select-dropdown:focus { border-color: #10b981; box-shadow: 0 0 8px rgba(16,185,129,0.2); }
.speed-select-dropdown:disabled { opacity: 0.4; cursor: not-allowed; }
.state-indicator-row { display: flex; align-items: center; gap: 8px; }
.state-dot { width: 8px; height: 8px; border-radius: 50%; }
</style>
