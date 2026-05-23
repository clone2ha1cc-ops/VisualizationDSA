<template>
  <div class="flex flex-col h-full w-full gap-2">
    <!-- Top Area: Canvas + Sidebar (Pseudocode + Custom Input) -->
    <div class="flex-1 flex gap-2 min-h-0">
      <!-- Canvas (60%) -->
      <div class="flex-[6] rounded-xl overflow-hidden border border-slate-800 shadow-lg relative">
        <!-- Loading Overlay -->
        <div
          v-if="inputStore.isLoading"
          class="absolute inset-0 bg-slate-950/60 z-10 flex items-center justify-center"
        >
          <div class="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <CanvasLayer />
      </div>
      <!-- Sidebar (40%): Pseudocode + Custom Input stacked -->
      <div class="flex-[4] flex flex-col gap-2 min-h-0">
        <!-- Pseudocode -->
        <div class="flex-1 rounded-xl overflow-hidden border border-slate-800 shadow-lg min-h-0">
          <AnimPseudoCodePanel />
        </div>
        <!-- Custom Input Form -->
        <div class="flex-1 rounded-xl overflow-hidden border border-slate-800 shadow-lg min-h-0">
          <CustomInputForm />
        </div>
      </div>
    </div>

    <!-- Explanation Row -->
    <div class="h-16 rounded-xl overflow-hidden border border-slate-800 shadow-lg">
      <ExplanationPanel />
    </div>

    <!-- Control Panel Row -->
    <div class="h-40 rounded-xl overflow-hidden border border-slate-800 shadow-lg">
      <AnimControlPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import CanvasLayer from './CanvasLayer.vue';
import AnimPseudoCodePanel from './AnimPseudoCodePanel.vue';
import ExplanationPanel from './ExplanationPanel.vue';
import AnimControlPanel from './AnimControlPanel.vue';
import { CustomInputForm } from '../../custom-input';
import { useInputStore } from '../../custom-input/store/useInputStore';

const inputStore = useInputStore();
</script>
