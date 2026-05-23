<template>
  <div class="h-full flex flex-col gap-4" style="font-family: 'Outfit', sans-serif;">
    <!-- Top: Algorithm Selector -->
    <CompareAlgorithmSelector />

    <!-- Middle: Split Screen Dual Canvas -->
    <div class="flex-1 min-h-0 grid grid-cols-2 gap-4">
      <!-- Left Canvas -->
      <CompareCanvasPanel
        :currentFrame="store.leftCurrentFrame"
        :totalFrames="store.leftTotalFrames"
        :currentIndex="store.leftCurrentIndex"
        :algorithmName="store.leftAlgorithmName"
        :timeComplexity="store.leftTimeComplexity"
        :isFinished="store.leftIsFinished"
        accentColor="#06B6D4"
        :playbackSpeed="store.globalPlaySpeed"
      />

      <!-- Right Canvas -->
      <CompareCanvasPanel
        :currentFrame="store.rightCurrentFrame"
        :totalFrames="store.rightTotalFrames"
        :currentIndex="store.rightCurrentIndex"
        :algorithmName="store.rightAlgorithmName"
        :timeComplexity="store.rightTimeComplexity"
        :isFinished="store.rightIsFinished"
        accentColor="#10B981"
        :playbackSpeed="store.globalPlaySpeed"
      />
    </div>

    <!-- Bottom: Dashboard + Unified Controls -->
    <div class="flex-shrink-0 space-y-3">
      <!-- Comparative Stats Dashboard -->
      <ComparativeDashboard />

      <!-- Unified VCR Controls -->
      <div
        class="flex items-center gap-4 px-6 py-3 rounded-2xl"
        style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255, 255, 255, 0.06); backdrop-filter: blur(12px);"
      >
        <!-- VCR Buttons -->
        <div class="flex items-center gap-2">
          <!-- Stop -->
          <button
            @click="store.stopPlayback()"
            class="vcr-btn"
            title="Dừng lại (R)"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          </button>

          <!-- Step Backward -->
          <button
            @click="store.stepBackward()"
            :disabled="store.leftCurrentIndex === 0 && store.rightCurrentIndex === 0"
            class="vcr-btn"
            title="Bước lùi (←)"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <!-- Play/Pause -->
          <button
            @click="store.togglePlayback()"
            class="vcr-btn-primary"
            :title="store.isPlaying ? 'Tạm dừng (Space)' : (store.playbackState === 'FINISHED' ? 'Phát lại' : 'Phát (Space)')"
          >
            <svg v-if="store.isPlaying" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
            </svg>
            <svg v-else-if="store.playbackState === 'FINISHED'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>

          <!-- Step Forward -->
          <button
            @click="store.stepForward()"
            :disabled="store.bothFinished"
            class="vcr-btn"
            title="Bước tiến (→)"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 18l8.5-6L4 6v12zm9-12v12h2V6h-2z" />
            </svg>
          </button>
        </div>

        <!-- Unified Range Slider -->
        <div class="flex-1 flex items-center gap-3">
          <span class="text-[10px] font-mono text-slate-500 w-10 text-right">
            {{ Math.round(store.globalProgressPercent) }}%
          </span>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            :value="Math.round(store.globalProgressPercent)"
            @input="onSliderInput"
            class="unified-range-input flex-1"
          />
        </div>

        <!-- Speed Dropdown -->
        <select
          :value="store.globalPlaySpeed"
          @change="onSpeedChange"
          class="px-2 py-1 rounded-lg text-xs font-medium text-white cursor-pointer"
          style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08);"
        >
          <option :value="0.25" class="bg-slate-900">0.25x</option>
          <option :value="0.5" class="bg-slate-900">0.5x</option>
          <option :value="1" class="bg-slate-900">1.0x</option>
          <option :value="2" class="bg-slate-900">2.0x</option>
          <option :value="4" class="bg-slate-900">4.0x</option>
        </select>

        <!-- Mode Toggle -->
        <button
          @click="toggleMode"
          class="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
          :style="modeButtonStyle"
          :title="store.playbackMode === 'normalized' ? 'Chế độ đồng bộ tỷ lệ' : 'Chế độ độc lập'"
        >
          {{ store.playbackMode === 'normalized' ? 'Đồng bộ' : 'Độc lập' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue';
import { useCompareAlgorithmsStore } from '../store/useCompareAlgorithmsStore';
import CompareAlgorithmSelector from './CompareAlgorithmSelector.vue';
import CompareCanvasPanel from './CompareCanvasPanel.vue';
import ComparativeDashboard from './ComparativeDashboard.vue';

const store = useCompareAlgorithmsStore();

const modeButtonStyle = computed(() =>
  store.playbackMode === 'normalized'
    ? {
        background: 'rgba(16, 185, 129, 0.15)',
        color: '#10B981',
        border: '1px solid rgba(16, 185, 129, 0.3)',
      }
    : {
        background: 'rgba(6, 182, 212, 0.15)',
        color: '#06B6D4',
        border: '1px solid rgba(6, 182, 212, 0.3)',
      },
);

function onSliderInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  store.scrubToPercent(Number(target.value));
}

function onSpeedChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  store.setSpeed(Number(target.value));
}

function toggleMode(): void {
  store.setPlaybackMode(
    store.playbackMode === 'normalized' ? 'independent' : 'normalized',
  );
}

function handleKeydown(event: KeyboardEvent): void {
  if (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLSelectElement ||
    event.target instanceof HTMLTextAreaElement
  ) {
    return;
  }

  switch (event.key) {
    case ' ':
      event.preventDefault();
      store.togglePlayback();
      break;
    case 'ArrowRight':
      event.preventDefault();
      store.stepForward();
      break;
    case 'ArrowLeft':
      event.preventDefault();
      store.stepBackward();
      break;
    case 'r':
    case 'R':
      event.preventDefault();
      store.stopPlayback();
      break;
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
  store.cleanup();
});
</script>

<style scoped>
.vcr-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: #94A3B8;
  transition: all 0.15s ease;
  cursor: pointer;
}
.vcr-btn:hover:not(:disabled) {
  background: rgba(30, 41, 59, 0.8);
  color: white;
}
.vcr-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.vcr-btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #06B6D4, #10B981);
  color: white;
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.3);
  transition: all 0.15s ease;
  cursor: pointer;
}
.vcr-btn-primary:hover {
  box-shadow: 0 0 25px rgba(6, 182, 212, 0.5);
  transform: scale(1.05);
}

.unified-range-input {
  -webkit-appearance: none;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(to right, #06B6D4, #10B981);
  outline: none;
  cursor: pointer;
}
.unified-range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
  transition: transform 0.15s ease;
}
.unified-range-input::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}
</style>
