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

        <!-- E-Lecture Overlay -->
        <LectureOverlay />

        <!-- E-Lecture Toggle Button -->
        <button
          v-if="!lectureStore.isActive && hasLectureAvailable"
          class="e-lecture-btn"
          @click="openLecture"
          title="Mở bài giảng điện tử"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10" />
            <path d="M6 10h10" />
          </svg>
          <span>E-Lecture</span>
        </button>
      </div>
      <!-- Sidebar (40%): Pseudocode + Custom Input stacked -->
      <div class="flex-[4] flex flex-col gap-2 min-h-0">
        <!-- Pseudocode Sync (Multilingual Code Panel + Watch Variables) -->
        <div class="flex-1 rounded-xl overflow-hidden border border-slate-800 shadow-lg min-h-0">
          <MultilingualCodePanel />
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
import { computed, watch } from 'vue';
import CanvasLayer from './CanvasLayer.vue';
import ExplanationPanel from './ExplanationPanel.vue';
import AnimControlPanel from './AnimControlPanel.vue';
import { CustomInputForm } from '../../custom-input';
import { useInputStore } from '../../custom-input/store/useInputStore';
import { LectureOverlay, useLectureStore, loadLecture, hasLecture } from '../../e-lecture';
import { MultilingualCodePanel, usePseudocodeStore, loadPseudocodeScript as loadPsScript } from '../../pseudocode-sync';
import { useAnimationStore } from '../store/useAnimationStore';

const inputStore = useInputStore();
const lectureStore = useLectureStore();
const animStore = useAnimationStore();
const pseudocodeStore = usePseudocodeStore();

watch(
  () => animStore.algorithmId,
  (newId) => {
    if (!newId) {
      pseudocodeStore.resetStore();
      return;
    }
    const script = loadPsScript(newId);
    if (script) {
      pseudocodeStore.loadPseudocodeScript(script.languages);
    }
  },
  { immediate: true },
);

const hasLectureAvailable = computed(() => {
  return hasLecture(animStore.algorithmId);
});

async function openLecture(): Promise<void> {
  const script = await loadLecture(animStore.algorithmId);
  if (script) {
    lectureStore.startLecture(script);
  }
}
</script>

<style scoped>
.e-lecture-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 10px;
  background: rgba(30, 41, 59, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(6, 182, 212, 0.3);
  color: #67e8f9;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.e-lecture-btn:hover {
  background: rgba(6, 182, 212, 0.15);
  border-color: rgba(6, 182, 212, 0.5);
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.2);
}
</style>
