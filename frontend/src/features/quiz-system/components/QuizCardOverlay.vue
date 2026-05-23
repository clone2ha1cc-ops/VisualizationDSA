<template>
  <Transition name="quiz-overlay">
    <div
      v-if="quizStore.isQuizActive"
      class="quiz-overlay-backdrop"
      @click.self="handleBackdropClick"
    >
      <div
        class="quiz-dialog-card"
        :class="{
          'status-correct': quizStore.isSubmitted && quizStore.isCorrect,
          'status-incorrect': quizStore.isSubmitted && !quizStore.isCorrect,
        }"
      >
        <!-- Header -->
        <div class="quiz-header">
          <div class="quiz-badge">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" x2="12.01" y1="17" y2="17" />
            </svg>
            <span>Trắc nghiệm đột xuất</span>
          </div>
          <div class="quiz-type-badge">
            {{ questionTypeLabel }}
          </div>
        </div>

        <!-- Question Prompt -->
        <p class="quiz-prompt">{{ quizStore.activeQuestion?.prompt }}</p>

        <!-- Canvas Target Mode Hint -->
        <div
          v-if="quizStore.activeQuestion?.type === 'CANVAS_TARGET' && !quizStore.isSubmitted"
          class="canvas-hint"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          <span>Nhấp trực tiếp vào đỉnh trên Canvas để trả lời</span>
        </div>

        <!-- Options (MC / TF) -->
        <div
          v-if="
            quizStore.activeQuestion?.options &&
            quizStore.activeQuestion.type !== 'CANVAS_TARGET'
          "
          class="quiz-options"
        >
          <button
            v-for="(option, idx) in quizStore.activeQuestion.options"
            :key="idx"
            class="quiz-option-btn"
            :class="{
              'option-selected': quizStore.selectedAnswerIndex === idx && !quizStore.isSubmitted,
              'option-correct':
                quizStore.isSubmitted && idx === quizStore.activeQuestion.correctOptionIndex,
              'option-incorrect':
                quizStore.isSubmitted &&
                quizStore.selectedAnswerIndex === idx &&
                idx !== quizStore.activeQuestion.correctOptionIndex,
              'option-disabled': quizStore.isSubmitted,
            }"
            :disabled="quizStore.isSubmitted"
            @click="selectOption(idx)"
          >
            <span class="option-letter">{{ optionLetters[idx] }}</span>
            <span class="option-text">{{ option }}</span>
            <span
              v-if="quizStore.isSubmitted && idx === quizStore.activeQuestion.correctOptionIndex"
              class="option-icon correct-icon"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <path d="m5 12 5 5L20 7" />
              </svg>
            </span>
            <span
              v-if="
                quizStore.isSubmitted &&
                quizStore.selectedAnswerIndex === idx &&
                idx !== quizStore.activeQuestion.correctOptionIndex
              "
              class="option-icon incorrect-icon"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </span>
          </button>
        </div>

        <!-- Feedback / Explanation -->
        <Transition name="feedback-fade">
          <div v-if="quizStore.isSubmitted" class="quiz-feedback">
            <div class="feedback-header" :class="quizStore.isCorrect ? 'text-emerald-400' : 'text-rose-400'">
              <span v-if="quizStore.isCorrect" class="feedback-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="m5 12 5 5L20 7" />
                </svg>
              </span>
              <span v-else class="feedback-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10" /><path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </span>
              <span class="feedback-title">
                {{ quizStore.isCorrect ? 'Chính xác!' : 'Chưa đúng!' }}
              </span>
            </div>
            <div class="feedback-explanation">
              {{ quizStore.feedbackExplanation }}
            </div>
          </div>
        </Transition>

        <!-- Action Buttons -->
        <div v-if="quizStore.isSubmitted" class="quiz-actions">
          <button class="continue-btn" @click="continueLesson">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
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

const quizStore = useQuizStore();

const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

const questionTypeLabel = computed(() => {
  const type = quizStore.activeQuestion?.type;
  if (type === 'MULTIPLE_CHOICE') return 'Nhiều lựa chọn';
  if (type === 'TRUE_FALSE') return 'Đúng / Sai';
  if (type === 'CANVAS_TARGET') return 'Nhấp Canvas';
  return '';
});

function selectOption(idx: number): void {
  if (quizStore.isSubmitted) return;
  quizStore.submitOptionAnswer(idx);
}

function continueLesson(): void {
  quizStore.dismissQuestionAndContinue();
}

function handleBackdropClick(): void {
  // Prevent dismissing without answering
}
</script>

<style scoped>
.quiz-overlay-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.quiz-dialog-card {
  width: 90%;
  max-width: 520px;
  background: rgba(30, 41, 59, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  padding: 28px 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  max-height: 85vh;
  overflow-y: auto;
}

.quiz-dialog-card.status-correct {
  border-color: #10b981;
  box-shadow: 0 0 25px rgba(16, 185, 129, 0.25);
}

.quiz-dialog-card.status-incorrect {
  border-color: #ef4444;
  box-shadow: 0 0 25px rgba(239, 68, 68, 0.25);
  animation: cssShakeError 0.4s ease-in-out;
}

@keyframes cssShakeError {
  0%,
  100% {
    transform: translateX(0);
  }
  20%,
  60% {
    transform: translateX(-8px);
  }
  40%,
  80% {
    transform: translateX(8px);
  }
}

.quiz-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.quiz-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #67e8f9;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.25);
  padding: 4px 10px;
  border-radius: 8px;
}

.quiz-type-badge {
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 3px 8px;
  border-radius: 6px;
}

.quiz-prompt {
  font-size: 15px;
  font-weight: 600;
  color: #e2e8f0;
  line-height: 1.6;
  margin: 0 0 20px;
}

.canvas-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(6, 182, 212, 0.08);
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 12px;
  color: #67e8f9;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 16px;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.quiz-option-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  text-align: left;
  font-family: 'Outfit', 'Inter', sans-serif;
  font-size: 13.5px;
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.quiz-option-btn:hover:not(.option-disabled) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.quiz-option-btn.option-selected {
  border-color: rgba(99, 102, 241, 0.5);
  background: rgba(99, 102, 241, 0.1);
}

.quiz-option-btn.option-correct {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  color: #6ee7b7;
}

.quiz-option-btn.option-incorrect {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
}

.quiz-option-btn.option-disabled {
  cursor: default;
  opacity: 0.85;
}

.option-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  flex-shrink: 0;
}

.option-text {
  flex: 1;
  line-height: 1.4;
}

.option-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.correct-icon {
  color: #10b981;
}

.incorrect-icon {
  color: #ef4444;
}

.quiz-feedback {
  padding: 16px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  margin-bottom: 16px;
}

.feedback-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-weight: 700;
  font-size: 14px;
}

.feedback-icon {
  display: flex;
  align-items: center;
}

.feedback-title {
  letter-spacing: 0.02em;
}

.feedback-explanation {
  font-size: 12.5px;
  color: #cbd5e1;
  line-height: 1.7;
}

.quiz-actions {
  display: flex;
  justify-content: flex-end;
}

.continue-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  color: #6ee7b7;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.continue-btn:hover {
  background: rgba(16, 185, 129, 0.25);
  border-color: rgba(16, 185, 129, 0.5);
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.15);
}

/* Transitions */
.quiz-overlay-enter-active {
  animation: fadeInOverlay 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.quiz-overlay-enter-active .quiz-dialog-card {
  animation: scaleUpCard 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.quiz-overlay-leave-active {
  animation: fadeOutOverlay 0.25s ease-out forwards;
}

@keyframes fadeInOverlay {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOutOverlay {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes scaleUpCard {
  from {
    transform: scale(0.92);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.feedback-fade-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.feedback-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
</style>
