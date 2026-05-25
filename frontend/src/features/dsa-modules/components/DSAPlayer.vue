<template>
  <div class="flex flex-col h-full w-full gap-2">
    <!-- Mode: Dashboard (no algorithm selected) -->
    <template v-if="!algoStore.currentAlgorithm">
      <AlgorithmDashboard @select="onAlgorithmSelected" />
    </template>

    <!-- Mode: Visualization (algorithm selected) -->
    <template v-else>
      <DSAHeader
        :algorithm="algoStore.currentAlgorithm"
        :metadata="algoStore.metadata"
        :isExecuting="isExecuting"
        @back="goBack"
        @execute="executeVisualization"
      />

      <div class="flex-1 flex gap-2 min-h-0">
        <!-- Canvas Visualizer (65%) -->
        <div class="flex-[65] rounded-xl overflow-hidden border border-slate-800 shadow-lg relative">
          <AlgorithmVisualizer />
        </div>

        <!-- Sidebar: Pseudocode + Input (35%) -->
        <div class="flex-[35] flex flex-col gap-2 min-h-0">
          <PseudocodeViewer
            v-if="algoStore.metadata"
            :pseudoCode="algoStore.metadata.pseudoCode"
            :activeLine="animStore.currentFrame?.activeLine"
            :description="algoStore.metadata.description"
          />
          <DSAInputForm
            v-model="inputText"
            :algorithmCategory="algoStore.currentAlgorithm.category"
            @submit="executeVisualization"
          />
        </div>
      </div>

      <!-- Explanation Row -->
      <div v-if="animStore.currentFrame"
        class="h-10 rounded-xl overflow-hidden border border-slate-800 shadow-lg bg-slate-900 flex items-center px-4">
        <span class="text-xs text-slate-300">{{ animStore.currentFrame.explanation }}</span>
      </div>

      <!-- Control Panel -->
      <AnimationVcrControls
        :isPlaying="animStore.isPlaying"
        :currentIndex="animStore.currentIndex"
        :totalSteps="animStore.totalSteps"
        :playbackSpeed="animStore.playbackSpeed"
        @stop="animStore.stop()"
        @stepBackward="animStore.stepBackward()"
        @stepForward="animStore.stepForward()"
        @togglePlay="animStore.isPlaying ? animStore.pause() : animStore.play()"
        @scrub="animStore.scrubTo"
        @speedChange="animStore.setSpeed"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAlgorithmStore } from '../store/useAlgorithmStore';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import { executeDSAAlgorithm } from '../services/dsaApi';
import type { Algorithm } from '../types/algorithm.types';
import AlgorithmDashboard from './AlgorithmDashboard.vue';
import AlgorithmVisualizer from './AlgorithmVisualizer.vue';
import DSAHeader from './DSAHeader.vue';
import DSAInputForm from './DSAInputForm.vue';
import PseudocodeViewer from './PseudocodeViewer.vue';
import AnimationVcrControls from '../../animation-engine/components/AnimationVcrControls.vue';
import { useDSAKeyboard } from '../composables/useDSAKeyboard';

const algoStore   = useAlgorithmStore();
const animStore   = useAnimationStore();
const inputText   = ref('5, 3, 8, 1, 9, 2, 7');
const isExecuting = ref(false);

useDSAKeyboard(() => !!algoStore.currentAlgorithm, animStore as any);

function onAlgorithmSelected(algo: Algorithm): void {
  generateDefaultInput(algo);
  executeVisualization();
}

function generateDefaultInput(algo: Algorithm): void {
  const category = algo.category.toLowerCase();
  if (category === 'searching')       inputText.value = '2, 5, 8, 12, 16, 23, 38, 56, 72, 91, 23';
  else if (category === 'tree')       inputText.value = '50, 30, 70, 20, 40, 60, 80';
  else if (category === 'stack-queue') inputText.value = '10, 20, 30, 40, 50';
  else                                inputText.value = '5, 3, 8, 1, 9, 2, 7';
}

async function executeVisualization(): Promise<void> {
  if (!algoStore.currentAlgorithm || isExecuting.value) return;
  isExecuting.value = true;
  try {
    const data = inputText.value.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    if (data.length === 0) return;
    const result = await executeDSAAlgorithm(algoStore.currentAlgorithm.id, data);
    animStore.loadResult({ algorithmId: result.algorithmId, pseudoCode: result.pseudoCode, frames: result.frames });
  } catch (error) { console.error('Lỗi thực thi trực quan hóa:', error); }
  finally { isExecuting.value = false; }
}

function goBack(): void { animStore.stop(); algoStore.clearActive(); }
</script>
