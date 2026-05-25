<template>
  <Transition name="summary-fade">
    <div v-if="visible" class="summary-overlay">
      <div class="summary-card">
        <!-- Header -->
        <div class="summary-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" class="text-emerald-400">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="m9 11 3 3L22 4" />
          </svg>
          <h3 class="summary-title">Tổng kết trắc nghiệm</h3>
        </div>

        <QuizSummaryBadges :correct="correct" :total="total" :streak="streak" />

        <p class="summary-message">{{ summaryMessage }}</p>

        <QuizSummaryActions @retry="$emit('retry')" @close="$emit('close')" />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { QuizStatsManager } from '../engine/QuizStatsManager';
import QuizSummaryBadges from './QuizSummaryBadges.vue';
import QuizSummaryActions from './QuizSummaryActions.vue';

const props = defineProps<{ visible: boolean; correct: number; total: number }>();
defineEmits<{ retry: []; close: [] }>();

const streak = computed(() => QuizStatsManager.getStats().streak);

const accuracy = computed(() =>
  props.total === 0 ? 0 : Math.round((props.correct / props.total) * 100)
);

const summaryMessage = computed(() => {
  if (accuracy.value >= 80) return 'Xuất sắc! Bạn đã nắm vững kiến thức thuật toán này.';
  if (accuracy.value >= 50) return 'Khá tốt! Hãy ôn lại lý thuyết để cải thiện thêm.';
  return 'Cần cố gắng hơn! Xem lại bài giảng và thử lại nhé.';
});
</script>

<style scoped>
.summary-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.summary-card { width: 90%; max-width: 420px; background: rgba(30, 41, 59, 0.92); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 28px; padding: 28px 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.1); }
.summary-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.summary-title { font-size: 16px; font-weight: 700; color: #e2e8f0; margin: 0; }
.summary-message { font-size: 13px; color: #94a3b8; text-align: center; line-height: 1.6; margin: 0 0 20px; }
.summary-fade-enter-active { animation: fadeInOverlay 0.3s ease forwards; }
.summary-fade-leave-active { animation: fadeOutOverlay 0.25s ease-out forwards; }
@keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeOutOverlay { from { opacity: 1; } to { opacity: 0; } }
</style>
