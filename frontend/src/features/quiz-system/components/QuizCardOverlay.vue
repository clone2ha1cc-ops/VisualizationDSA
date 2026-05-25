<template>
  <Transition name="quiz-overlay">
    <div v-if="quizStore.isQuizActive" class="quiz-overlay-backdrop" @click.self="() => {}">
      <div class="quiz-dialog-card" :class="{
        'status-correct':   quizStore.isSubmitted && quizStore.isCorrect,
        'status-incorrect': quizStore.isSubmitted && !quizStore.isCorrect,
      }">
        <!-- Header -->
        <div class="quiz-header">
          <div class="quiz-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" x2="12.01" y1="17" y2="17" />
            </svg>
            <span>Trắc nghiệm đột xuất</span>
          </div>
          <div class="quiz-type-badge">{{ questionTypeLabel }}</div>
        </div>

        <!-- Prompt -->
        <p class="quiz-prompt">{{ quizStore.activeQuestion?.prompt }}</p>

        <!-- Canvas Target Hint -->
        <div v-if="quizStore.activeQuestion?.type === 'CANVAS_TARGET' && !quizStore.isSubmitted" class="canvas-hint">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
          </svg>
          <span>Nhấp trực tiếp vào đỉnh trên Canvas để trả lời</span>
        </div>

        <!-- Options -->
        <QuizOptionsList
          :options="quizStore.activeQuestion?.options"
          :type="quizStore.activeQuestion?.type"
          :selected-index="quizStore.selectedAnswerIndex"
          :is-submitted="quizStore.isSubmitted"
          :correct-index="quizStore.activeQuestion?.correctOptionIndex"
          @select="selectOption"
        />

        <!-- Feedback -->
        <Transition name="feedback-fade">
          <div v-if="quizStore.isSubmitted" class="quiz-feedback">
            <div class="feedback-header" :class="quizStore.isCorrect ? 'text-emerald-400' : 'text-rose-400'">
              <span class="feedback-icon">
                <svg v-if="quizStore.isCorrect" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m5 12 5 5L20 7" /></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" /><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </span>
              <span class="feedback-title">{{ quizStore.isCorrect ? 'Chính xác!' : 'Chưa đúng!' }}</span>
            </div>
            <div class="feedback-explanation">{{ quizStore.feedbackExplanation }}</div>
          </div>
        </Transition>

        <!-- Continue Button -->
        <div v-if="quizStore.isSubmitted" class="quiz-actions">
          <button class="continue-btn" @click="quizStore.dismissQuestionAndContinue()">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6" /></svg>
            <span>Tiếp tục bài giảng</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuizStore } from '../store/useQuizStore';
import QuizOptionsList from './QuizOptionsList.vue';

const quizStore = useQuizStore();

const questionTypeLabel = computed(() => {
  const t = quizStore.activeQuestion?.type;
  if (t === 'MULTIPLE_CHOICE') return 'Nhiều lựa chọn';
  if (t === 'TRUE_FALSE')      return 'Đúng / Sai';
  if (t === 'CANVAS_TARGET')   return 'Nhấp Canvas';
  return '';
});

function selectOption(idx: number): void {
  if (!quizStore.isSubmitted) quizStore.submitOptionAnswer(idx);
}
</script>

<style scoped>
.quiz-overlay-backdrop { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15,23,42,0.65); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.quiz-dialog-card { width: 90%; max-width: 520px; background: rgba(30,41,59,0.92); border: 1px solid rgba(255,255,255,0.08); border-radius: 28px; padding: 28px 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); max-height: 85vh; overflow-y: auto; }
.quiz-dialog-card.status-correct   { border-color: #10b981; box-shadow: 0 0 25px rgba(16,185,129,0.25); }
.quiz-dialog-card.status-incorrect { border-color: #ef4444; box-shadow: 0 0 25px rgba(239,68,68,0.25); animation: cssShakeError 0.4s ease-in-out; }
@keyframes cssShakeError { 0%,100% { transform: translateX(0); } 20%,60% { transform: translateX(-8px); } 40%,80% { transform: translateX(8px); } }
.quiz-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.quiz-badge { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #67e8f9; background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.25); padding: 4px 10px; border-radius: 8px; }
.quiz-type-badge { font-size: 10px; font-weight: 600; color: #94a3b8; background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.05); padding: 3px 8px; border-radius: 6px; }
.quiz-prompt { font-size: 15px; font-weight: 600; color: #e2e8f0; line-height: 1.6; margin: 0 0 20px; }
.canvas-hint { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: rgba(6,182,212,0.08); border: 1px solid rgba(6,182,212,0.2); border-radius: 12px; color: #67e8f9; font-size: 12px; font-weight: 500; margin-bottom: 16px; }
.quiz-feedback { padding: 16px; background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; margin-bottom: 16px; }
.feedback-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-weight: 700; font-size: 14px; }
.feedback-icon { display: flex; align-items: center; }
.feedback-explanation { font-size: 12.5px; color: #cbd5e1; line-height: 1.7; }
.quiz-actions { display: flex; justify-content: flex-end; }
.continue-btn { display: flex; align-items: center; gap: 6px; padding: 10px 20px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; color: #6ee7b7; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s; }
.continue-btn:hover { background: rgba(16,185,129,0.25); border-color: rgba(16,185,129,0.5); box-shadow: 0 0 12px rgba(16,185,129,0.15); }
.quiz-overlay-enter-active { animation: fadeInOverlay .3s cubic-bezier(.4,0,.2,1) forwards; }
.quiz-overlay-enter-active .quiz-dialog-card { animation: scaleUpCard .35s cubic-bezier(.34,1.56,.64,1) forwards; }
.quiz-overlay-leave-active { animation: fadeOutOverlay .25s ease-out forwards; }
@keyframes fadeInOverlay  { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeOutOverlay { from { opacity: 1; } to { opacity: 0; } }
@keyframes scaleUpCard    { from { transform: scale(.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.feedback-fade-enter-active { transition: opacity .3s ease, transform .3s ease; }
.feedback-fade-enter-from   { opacity: 0; transform: translateY(8px); }
</style>
