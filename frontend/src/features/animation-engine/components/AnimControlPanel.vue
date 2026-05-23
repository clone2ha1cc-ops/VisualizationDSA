<template>
  <div
    class="control-panel-container"
    :class="{ 'disabled-panel': store.interactionLocked }"
  >
    <!-- VCR Controls Row -->
    <div class="vcr-row">
      <!-- Left: Step Backward / Play-Pause-Replay / Step Forward -->
      <div class="vcr-controls-left">
        <!-- Step Backward -->
        <button
          class="vcr-action-btn"
          :disabled="isFirstFrame || store.playbackState === 'UNINITIALIZED'"
          title="Lùi 1 bước (ArrowLeft)"
          @click="store.stepBackward()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="19 20 9 12 19 4 19 20" fill="currentColor" />
            <line x1="5" y1="19" x2="5" y2="5" />
          </svg>
        </button>

        <!-- Play / Pause / Replay -->
        <button
          class="vcr-play-btn"
          :disabled="store.playbackState === 'UNINITIALIZED'"
          :title="store.isPlaying ? 'Tạm dừng (Space)' : store.isFinished ? 'Phát lại (Space)' : 'Phát (Space)'"
          @click="handleTogglePlay"
        >
          <!-- Pause icon -->
          <svg v-if="store.isPlaying" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
          <!-- Replay icon -->
          <svg v-else-if="store.isFinished" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          <!-- Play icon -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </button>

        <!-- Step Forward -->
        <button
          class="vcr-action-btn"
          :disabled="isLastFrame || store.playbackState === 'UNINITIALIZED'"
          title="Tiến 1 bước (ArrowRight)"
          @click="store.stepForward()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
        </button>
      </div>

      <!-- Center: Timeline Slider -->
      <div
        class="timeline-slider-center"
        ref="sliderContainer"
        @mousemove="onSliderHover"
        @mouseleave="sliderTooltip.hideTooltip()"
      >
        <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>Step {{ store.currentIndex + 1 }}</span>
          <span>{{ store.totalSteps }} total</span>
        </div>
        <input
          type="range"
          min="0"
          :max="Math.max(store.totalSteps - 1, 0)"
          :value="store.currentIndex"
          :disabled="store.totalSteps === 0 || store.interactionLocked"
          class="custom-timeline-slider"
          :style="sliderProgressStyle"
          @mousedown="scrubEngine.startScrub()"
          @input="onScrubInput"
          @mouseup="scrubEngine.endScrub()"
          @touchstart="scrubEngine.startScrub()"
          @touchend="scrubEngine.endScrub()"
        />

        <!-- Dynamic Tooltip -->
        <div
          v-if="sliderTooltip.tooltip.value.visible && !store.interactionLocked"
          :style="{ left: sliderTooltip.tooltip.value.x + 'px' }"
          class="slider-dynamic-tooltip"
        >
          <span class="tooltip-step-label">Bước {{ sliderTooltip.tooltip.value.step }}:</span>
          <p class="tooltip-explanation-text">{{ truncateText(sliderTooltip.tooltip.value.text, 55) }}</p>
        </div>
      </div>

      <!-- Right: Speed Dropdown -->
      <div class="speed-controls-right">
        <select
          v-model.number="playbackSpeedModel"
          class="speed-select-dropdown"
          :disabled="store.interactionLocked"
        >
          <option v-for="speed in SPEED_PRESETS" :key="speed" :value="speed">
            {{ speed }}x{{ speed === 1.0 ? ' (Mặc định)' : '' }}
          </option>
        </select>
      </div>
    </div>

    <!-- State indicator row -->
    <div class="state-indicator-row">
      <span
        class="state-dot"
        :class="{
          'bg-slate-600': store.playbackState === 'UNINITIALIZED',
          'bg-cyan-500': store.playbackState === 'LOADED',
          'bg-green-500 animate-pulse': store.playbackState === 'PLAYING',
          'bg-amber-500': store.playbackState === 'PAUSED',
          'bg-emerald-500': store.playbackState === 'FINISHED',
        }"
      />
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

const store = useAnimationStore();
const speedPrefs = useSpeedPreferences();
const scrubEngine = useThrottledScrub();
const sliderTooltip = useSliderTooltip();
const { registerHotkeys } = usePlaybackHotkeys();

const sliderContainer = ref<HTMLDivElement | null>(null);

const isFirstFrame = computed(() => store.currentIndex === 0);
const isLastFrame = computed(() => store.isFinished);

const playbackSpeedModel = computed({
  get: () => store.playbackSpeed,
  set: (val: number) => {
    store.setSpeed(val);
    speedPrefs.saveSpeed(val);
  },
});

const sliderProgressStyle = computed(() => {
  const percent = store.totalSteps <= 1 ? 0 : (store.currentIndex / (store.totalSteps - 1)) * 100;
  return {
    '--progress-percent': `${percent}%`,
  };
});

function handleTogglePlay(): void {
  if (store.isFinished) {
    store.goToFrame(0);
    store.play();
  } else {
    store.togglePlay();
  }
}

function onScrubInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  scrubEngine.updateScrubPosition(parseInt(target.value, 10));
}

function onSliderHover(event: MouseEvent): void {
  sliderTooltip.handleSliderHover(event, sliderContainer.value);
}

let cleanupHotkeys: (() => void) | null = null;

onMounted(() => {
  speedPrefs.initSpeedFromStorage();
  cleanupHotkeys = registerHotkeys();
});

onBeforeUnmount(() => {
  if (cleanupHotkeys) cleanupHotkeys();
});
</script>

<style scoped>
.control-panel-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  color: #e2e8f0;
  transition: opacity 0.2s ease;
}

.disabled-panel {
  opacity: 0.5;
  pointer-events: none;
}

.vcr-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.vcr-controls-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.vcr-action-btn {
  padding: 8px;
  border-radius: 10px;
  border: 1px solid rgba(71, 85, 105, 0.6);
  color: #94a3b8;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s;
}

.vcr-action-btn:hover:not(:disabled) {
  color: #ffffff;
  border-color: #64748b;
  background: rgba(100, 116, 139, 0.15);
}

.vcr-action-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.vcr-play-btn {
  padding: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  color: #ffffff;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 0 16px rgba(6, 182, 212, 0.3);
}

.vcr-play-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #22d3ee, #06b6d4);
  box-shadow: 0 0 24px rgba(6, 182, 212, 0.5);
  transform: scale(1.05);
}

.vcr-play-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.timeline-slider-center {
  flex: 1;
  position: relative;
  min-width: 0;
}

.custom-timeline-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  transition: height 0.1s ease;
  background: linear-gradient(
    to right,
    #10b981 0%,
    #10b981 var(--progress-percent, 0%),
    rgba(255, 255, 255, 0.1) var(--progress-percent, 0%),
    rgba(255, 255, 255, 0.1) 100%
  );
}

.custom-timeline-slider:hover {
  height: 8px;
}

.custom-timeline-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 10px #10b981;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.custom-timeline-slider::-webkit-slider-thumb:hover {
  transform: scale(1.3);
}

.custom-timeline-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 10px #10b981;
  border: none;
  cursor: pointer;
}

.custom-timeline-slider:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.slider-dynamic-tooltip {
  position: absolute;
  top: -52px;
  width: 200px;
  padding: 6px 10px;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  pointer-events: none;
  z-index: 10;
}

.tooltip-step-label {
  font-size: 10px;
  font-weight: 700;
  color: #10b981;
  text-transform: uppercase;
}

.tooltip-explanation-text {
  font-size: 11px;
  color: #cbd5e1;
  margin: 2px 0 0;
  line-height: 1.3;
}

.speed-controls-right {
  flex-shrink: 0;
}

.speed-select-dropdown {
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.5);
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  transition: all 0.15s;
}

.speed-select-dropdown:hover {
  border-color: #10b981;
  color: #10b981;
}

.speed-select-dropdown:focus {
  border-color: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.2);
}

.speed-select-dropdown:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.state-indicator-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.state-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>
