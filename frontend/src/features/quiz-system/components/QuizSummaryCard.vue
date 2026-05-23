<template>
  <Transition name="summary-fade">
    <div v-if="visible" class="summary-overlay">
      <div class="summary-card">
        <!-- Header -->
        <div class="summary-header">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="text-emerald-400"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="m9 11 3 3L22 4" />
          </svg>
          <h3 class="summary-title">Tổng kết trắc nghiệm</h3>
        </div>

        <!-- Badges -->
        <div class="summary-badges-container">
          <div class="summary-badge-item">
            <span class="badge-value" :class="accuracyColor">{{ accuracy }}%</span>
            <span class="badge-label">Chính xác</span>
          </div>
          <div class="summary-badge-item">
            <span class="badge-value text-cyan-400">{{ correct }}/{{ total }}</span>
            <span class="badge-label">Câu đúng</span>
          </div>
          <div class="summary-badge-item">
            <span class="badge-value text-amber-400">{{ streak }}</span>
            <span class="badge-label">Chuỗi đúng</span>
          </div>
        </div>

        <!-- Message -->
        <p class="summary-message">
          {{ summaryMessage }}
        </p>

        <!-- Actions -->
        <div class="summary-actions">
          <button class="retry-btn" @click="$emit('retry')">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span>Làm lại</span>
          </button>
          <button class="close-btn" @click="$emit('close')">
            <span>Đóng</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { QuizStatsManager } from '../engine/QuizStatsManager';

const props = defineProps<{
  visible: boolean;
  correct: number;
  total: number;
}>();

defineEmits<{
  retry: [];
  close: [];
}>();

const accuracy = computed(() => {
  if (props.total === 0) return 0;
  return Math.round((props.correct / props.total) * 100);
});

const streak = computed(() => {
  return QuizStatsManager.getStats().streak;
});

const accuracyColor = computed(() => {
  if (accuracy.value >= 80) return 'text-emerald-400';
  if (accuracy.value >= 50) return 'text-amber-400';
  return 'text-rose-400';
});

const summaryMessage = computed(() => {
  if (accuracy.value >= 80) {
    return 'Xuất sắc! Bạn đã nắm vững kiến thức thuật toán này.';
  }
  if (accuracy.value >= 50) {
    return 'Khá tốt! Hãy ôn lại lý thuyết để cải thiện thêm.';
  }
  return 'Cần cố gắng hơn! Xem lại bài giảng và thử lại nhé.';
});
</script>

<style scoped>
.summary-overlay {
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

.summary-card {
  width: 90%;
  max-width: 420px;
  background: rgba(30, 41, 59, 0.92);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 28px;
  padding: 28px 32px;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(16, 185, 129, 0.1);
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.summary-title {
  font-size: 16px;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0;
}

.summary-badges-container {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.summary-badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  width: 90px;
}

.badge-value {
  font-size: 22px;
  font-weight: 800;
  text-shadow: 0 0 8px currentColor;
}

.badge-label {
  font-size: 10px;
  color: #64748b;
  margin-top: 4px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.summary-message {
  font-size: 13px;
  color: #94a3b8;
  text-align: center;
  line-height: 1.6;
  margin: 0 0 20px;
}

.summary-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.retry-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: rgba(6, 182, 212, 0.12);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 12px;
  color: #67e8f9;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: rgba(6, 182, 212, 0.2);
  border-color: rgba(6, 182, 212, 0.5);
}

.close-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.summary-fade-enter-active {
  animation: fadeInOverlay 0.3s ease forwards;
}

.summary-fade-leave-active {
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
</style>
