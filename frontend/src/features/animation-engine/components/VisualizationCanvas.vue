<template>
  <div class="flex-[6] rounded-xl overflow-hidden border border-slate-800 shadow-lg relative">
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="absolute inset-0 bg-slate-950/60 z-10 flex items-center justify-center">
      <div class="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <CanvasLayer />
    <LectureOverlay />
    <QuizCardOverlay />

    <QuizSummaryCard
      :visible="showQuizSummary"
      :correct="sessionCorrect"
      :total="sessionTotal"
      @retry="$emit('retry')"
      @close="$emit('close-summary')"
    />

    <button v-if="showLectureBtn" class="e-lecture-btn" @click="$emit('open-lecture')" title="Mở bài giảng điện tử">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
        <path d="M6 6h10" /><path d="M6 10h10" />
      </svg>
      <span>E-Lecture</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import CanvasLayer from './CanvasLayer.vue';
import { LectureOverlay } from '../../e-lecture';
import { QuizCardOverlay, QuizSummaryCard } from '../../quiz-system';

defineProps<{
  isLoading: boolean;
  showQuizSummary: boolean;
  sessionCorrect: number;
  sessionTotal: number;
  showLectureBtn: boolean;
}>();

defineEmits<{ retry: []; 'close-summary': []; 'open-lecture': [] }>();
</script>

<style scoped>
.e-lecture-btn { position: absolute; top: 12px; right: 12px; z-index: 50; display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 10px; background: rgba(30, 41, 59, 0.85); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(6, 182, 212, 0.3); color: #67e8f9; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.e-lecture-btn:hover { background: rgba(6, 182, 212, 0.15); border-color: rgba(6, 182, 212, 0.5); box-shadow: 0 0 12px rgba(6, 182, 212, 0.2); }
</style>
