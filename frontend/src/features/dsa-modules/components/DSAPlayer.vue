<template>
  <div class="flex flex-col h-full w-full gap-2">
    <!-- Mode: Dashboard (no algorithm selected) -->
    <template v-if="!algoStore.currentAlgorithm">
      <AlgorithmDashboard @select="onAlgorithmSelected" />
    </template>

    <!-- Mode: Visualization (algorithm selected) -->
    <template v-else>
      <!-- Top bar: Algorithm info + Back button -->
      <div class="flex items-center gap-3 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
        <button
          class="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors"
          @click="goBack"
        >
          ← Quay lại
        </button>
        <div class="flex-1 flex items-center gap-3">
          <span class="text-sm font-bold text-white">{{ algoStore.currentAlgorithm.name }}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-cyan-900/50 text-cyan-400">
            {{ algoStore.currentAlgorithm.category }}
          </span>
          <span v-if="algoStore.metadata" class="text-[11px] text-slate-400">
            ⏱ {{ algoStore.metadata.timeComplexity }} · 💾 {{ algoStore.metadata.spaceComplexity }}
          </span>
        </div>
        <button
          class="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
          :disabled="isExecuting"
          @click="executeVisualization"
        >
          {{ isExecuting ? 'Đang chạy...' : 'Trực quan hóa' }}
        </button>
      </div>

      <!-- Main content -->
      <div class="flex-1 flex gap-2 min-h-0">
        <!-- Canvas Visualizer (65%) -->
        <div class="flex-[65] rounded-xl overflow-hidden border border-slate-800 shadow-lg relative">
          <AlgorithmVisualizer />
        </div>

        <!-- Sidebar: Pseudocode + Input (35%) -->
        <div class="flex-[35] flex flex-col gap-2 min-h-0">
          <!-- Metadata & Pseudocode -->
          <div class="flex-1 rounded-xl overflow-hidden border border-slate-800 shadow-lg min-h-0 bg-slate-900 p-3 overflow-auto">
            <h4 class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Mã giả (Pseudocode)</h4>
            <div v-if="algoStore.metadata" class="space-y-0.5">
              <div
                v-for="(line, idx) in algoStore.metadata.pseudoCode"
                :key="idx"
                class="text-xs font-mono px-2 py-0.5 rounded transition-colors"
                :class="
                  animStore.currentFrame?.activeLine === idx
                    ? 'bg-cyan-900/40 text-cyan-300'
                    : 'text-slate-400'
                "
              >
                {{ line }}
              </div>
            </div>
            <div v-if="algoStore.metadata" class="mt-3 text-xs text-slate-500 leading-relaxed">
              {{ algoStore.metadata.description }}
            </div>
          </div>

          <!-- Input Form -->
          <div class="rounded-xl overflow-hidden border border-slate-800 shadow-lg bg-slate-900 p-3">
            <h4 class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Dữ liệu đầu vào</h4>
            <textarea
              v-model="inputText"
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono resize-none focus:outline-none focus:border-cyan-500 transition-colors"
              rows="2"
              placeholder="Ví dụ: 5, 3, 8, 1, 9"
              @keydown.ctrl.enter.prevent="executeVisualization"
            />
            <div class="flex items-center gap-2 mt-2">
              <button
                class="text-[10px] text-slate-400 hover:text-cyan-400 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                @click="generateRandom"
              >
                Sinh ngẫu nhiên
              </button>
              <span class="text-[10px] text-slate-500 flex-1 text-right">
                Ctrl+Enter để chạy
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Explanation Row -->
      <div
        v-if="animStore.currentFrame"
        class="h-10 rounded-xl overflow-hidden border border-slate-800 shadow-lg bg-slate-900 flex items-center px-4"
      >
        <span class="text-xs text-slate-300">
          {{ animStore.currentFrame.explanation }}
        </span>
      </div>

      <!-- Control Panel -->
      <div class="h-14 rounded-xl overflow-hidden border border-slate-800 shadow-lg bg-slate-900 flex items-center justify-center gap-3 px-4">
        <button class="ctrl-btn" @click="animStore.stop()" title="Reset (R)">⏮</button>
        <button class="ctrl-btn" @click="animStore.stepBackward()" title="Step Back (←)">⏪</button>
        <button
          class="ctrl-btn-primary"
          @click="animStore.isPlaying ? animStore.pause() : animStore.play()"
          :title="animStore.isPlaying ? 'Pause (Space)' : 'Play (Space)'"
        >
          {{ animStore.isPlaying ? '⏸' : '▶' }}
        </button>
        <button class="ctrl-btn" @click="animStore.stepForward()" title="Step Forward (→)">⏩</button>

        <!-- Timeline Scrubber -->
        <input
          type="range"
          min="0"
          :max="Math.max(0, animStore.totalSteps - 1)"
          :value="animStore.currentIndex"
          class="flex-1 h-1 accent-cyan-500"
          @input="onScrub"
        />

        <!-- Speed -->
        <select
          class="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded px-2 py-1"
          :value="animStore.playbackSpeed"
          @change="onSpeedChange"
        >
          <option :value="0.5">0.5x</option>
          <option :value="1">1x</option>
          <option :value="2">2x</option>
          <option :value="5">5x</option>
          <option :value="10">10x</option>
        </select>

        <span class="text-[10px] text-slate-500 min-w-[80px] text-right">
          {{ animStore.currentIndex + 1 }} / {{ animStore.totalSteps }}
        </span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useAlgorithmStore } from '../store/useAlgorithmStore';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import { executeDSAAlgorithm } from '../services/dsaApi';
import type { Algorithm } from '../types/algorithm.types';
import AlgorithmDashboard from './AlgorithmDashboard.vue';
import AlgorithmVisualizer from './AlgorithmVisualizer.vue';

const algoStore = useAlgorithmStore();
const animStore = useAnimationStore();
const inputText = ref('5, 3, 8, 1, 9, 2, 7');
const isExecuting = ref(false);

function onAlgorithmSelected(algo: Algorithm): void {
  generateDefaultInput(algo);
  executeVisualization();
}

function generateDefaultInput(algo: Algorithm): void {
  const category = algo.category.toLowerCase();
  if (category === 'searching') {
    inputText.value = '2, 5, 8, 12, 16, 23, 38, 56, 72, 91, 23';
  } else if (category === 'tree') {
    inputText.value = '50, 30, 70, 20, 40, 60, 80';
  } else if (category === 'stack-queue') {
    inputText.value = '10, 20, 30, 40, 50';
  } else {
    inputText.value = '5, 3, 8, 1, 9, 2, 7';
  }
}

function generateRandom(): void {
  const category = algoStore.currentAlgorithm?.category.toLowerCase() ?? 'sorting';
  const count = category === 'tree' || category === 'stack-queue' ? 7 : 8;
  const max = category === 'tree' ? 99 : 50;
  const values: number[] = [];

  if (category === 'searching') {
    for (let i = 0; i < count; i++) values.push(Math.floor(Math.random() * max) + 1);
    values.sort((a, b) => a - b);
    const target = values[Math.floor(Math.random() * values.length)];
    values.push(target);
  } else {
    for (let i = 0; i < count; i++) values.push(Math.floor(Math.random() * max) + 1);
  }

  inputText.value = values.join(', ');
}

async function executeVisualization(): Promise<void> {
  if (!algoStore.currentAlgorithm || isExecuting.value) return;

  isExecuting.value = true;
  try {
    const data = inputText.value
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    if (data.length === 0) return;

    const result = await executeDSAAlgorithm(algoStore.currentAlgorithm.id, data);
    animStore.loadResult({
      algorithmId: result.algorithmId,
      pseudoCode: result.pseudoCode,
      frames: result.frames,
    });
  } finally {
    isExecuting.value = false;
  }
}

function goBack(): void {
  animStore.stop();
  algoStore.clearActive();
}

function onScrub(e: Event): void {
  const target = e.target as HTMLInputElement;
  animStore.scrubTo(parseInt(target.value, 10));
}

function onSpeedChange(e: Event): void {
  const target = e.target as HTMLSelectElement;
  animStore.setSpeed(parseFloat(target.value));
}

function handleKeydown(e: KeyboardEvent): void {
  if (!algoStore.currentAlgorithm) return;
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

  switch (e.key) {
    case ' ':
      e.preventDefault();
      animStore.isPlaying ? animStore.pause() : animStore.play();
      break;
    case 'ArrowRight':
      e.preventDefault();
      animStore.stepForward();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      animStore.stepBackward();
      break;
    case 'r':
    case 'R':
      e.preventDefault();
      animStore.stop();
      break;
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
});
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
