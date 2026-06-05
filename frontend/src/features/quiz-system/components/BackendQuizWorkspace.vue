<template>
  <div class="h-full flex flex-col gap-4 p-4 overflow-auto">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <span class="text-text-primary font-bold text-sm">📝</span>
        </div>
        <div>
          <h2 class="text-base font-bold text-text-primary">Quiz System</h2>
          <p class="text-[10px] text-text-secondary">Trắc nghiệm DSA / OOP / SOLID / Patterns / DI</p>
        </div>
      </div>
      <div v-if="store.isBackendQuizMode" class="flex items-center gap-2">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/10 text-accent border border-accent/20">
          {{ store.backendQuizProgress }}
        </span>
        <button @click="store.exitBackendQuiz()"
          class="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-red/20 text-accent-red border border-accent-red/30 hover:bg-accent-red/30 transition-colors">
          Thoát Quiz
        </button>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="store.isBackendQuizLoading" class="flex-1">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SkeletonCard v-for="i in 6" :key="i" />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="store.backendQuizError" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <span class="text-sm text-accent-red">{{ store.backendQuizError }}</span>
        <button @click="store.loadQuizCatalog()" class="block mx-auto mt-2 px-4 py-1.5 rounded-lg text-xs bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30">
          Thử lại
        </button>
      </div>
    </div>

    <!-- Quiz Result -->
    <div v-else-if="store.backendResult" class="flex-1 flex flex-col items-center justify-center gap-4">
      <div class="rounded-2xl bg-bg-secondary/45 border border-white/5 backdrop-blur-xl p-8 max-w-lg w-full text-center">
        <div class="text-4xl mb-4">{{ store.backendResult.passed ? '🎉' : '😔' }}</div>
        <h3 class="text-xl font-bold text-text-primary mb-2">
          {{ store.backendResult.passed ? 'Xuất sắc!' : 'Cần cải thiện' }}
        </h3>
        <div class="text-3xl font-bold mb-2" :class="store.backendResult.passed ? 'text-accent-green' : 'text-accent-red'">
          {{ store.backendResult.score }} / {{ store.backendResult.maxScore }}
        </div>
        <div v-if="store.backendResult.xpAwarded > 0" class="text-sm text-accent mb-4">
          +{{ store.backendResult.xpAwarded }} XP
        </div>

        <!-- Question Results -->
        <div class="text-left mt-4 space-y-2">
          <div v-for="(qr, i) in store.backendResult.questionResults" :key="qr.questionId"
            class="p-3 rounded-lg" :class="qr.isCorrect ? 'bg-accent-green/10' : 'bg-accent-red/10'">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-sm">{{ qr.isCorrect ? '✓' : '✗' }}</span>
              <span class="text-xs font-medium text-text-primary">Câu {{ i + 1 }}</span>
            </div>
            <p class="text-[11px] text-text-secondary">{{ qr.explanation }}</p>
          </div>
        </div>

        <div class="flex gap-2 justify-center mt-6">
          <button @click="store.exitBackendQuiz()"
            class="px-4 py-2 rounded-lg text-xs font-medium bg-bg-surface text-text-primary border border-border-default hover:bg-bg-surface/80 transition-colors">
            Quay lại danh sách
          </button>
          <button v-if="store.activeBackendQuiz" @click="store.startBackendQuiz(store.activeBackendQuiz.id)"
            class="px-4 py-2 rounded-lg text-xs font-medium bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition-colors">
            Làm lại
          </button>
        </div>
      </div>
    </div>

    <!-- Active Quiz Question -->
    <div v-else-if="store.isBackendQuizMode && store.currentBackendQuestion" class="flex-1 flex flex-col gap-4">
      <div class="rounded-2xl bg-bg-secondary/45 border border-white/5 backdrop-blur-xl p-6 flex-1">
        <!-- Question Text -->
        <div class="mb-6">
          <span class="text-[10px] text-text-disabled uppercase tracking-wider">Câu hỏi {{ store.backendQuizIndex + 1 }}</span>
          <h3 class="text-sm font-semibold text-text-primary mt-1">{{ store.currentBackendQuestion.text }}</h3>
        </div>

        <!-- Options -->
        <div class="space-y-2">
          <button v-for="(option, idx) in store.currentBackendQuestion.options" :key="idx"
            @click="store.selectBackendAnswer(idx)"
            class="w-full text-left px-4 py-3 rounded-xl text-xs transition-all duration-200 border"
            :class="store.backendAnswers[store.backendQuizIndex] === idx
              ? 'bg-accent/20 border-accent/40 text-text-primary'
              : 'bg-bg-surface/30 border-border-default/30 text-text-secondary hover:bg-bg-surface/50'">
            <span class="font-bold mr-2">{{ String.fromCharCode(65 + idx) }}.</span>
            {{ option }}
          </button>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex items-center justify-between">
        <button @click="store.prevBackendQuestion()" :disabled="store.backendQuizIndex <= 0"
          class="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
          :class="store.backendQuizIndex > 0 ? 'bg-bg-surface text-text-primary border border-border-default hover:bg-bg-surface/80' : 'bg-bg-surface/30 text-text-disabled cursor-not-allowed'">
          ← Câu trước
        </button>
        <span class="text-xs text-text-secondary">{{ store.backendQuizProgress }}</span>
        <button v-if="store.activeBackendQuiz && store.backendQuizIndex < store.activeBackendQuiz.questions.length - 1"
          @click="store.nextBackendQuestion()"
          class="px-4 py-2 rounded-lg text-xs font-medium bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition-colors">
          Câu tiếp →
        </button>
        <button v-else @click="store.submitBackendQuiz()"
          :disabled="store.backendAnswers.some(a => a === null)"
          class="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
          :class="store.backendAnswers.every(a => a !== null)
            ? 'bg-accent-green/20 text-accent-green border border-accent-green/30 hover:bg-accent-green/30'
            : 'bg-bg-surface/30 text-text-disabled cursor-not-allowed'">
          Nộp bài ✓
        </button>
      </div>
    </div>

    <!-- Quiz Catalog (default view) -->
    <div v-else class="flex-1">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="quiz in store.quizCatalog" :key="quiz.id"
          class="rounded-2xl bg-bg-secondary/45 border border-white/5 backdrop-blur-xl p-5 cursor-pointer hover:border-accent/30 transition-all duration-200"
          @click="store.startBackendQuiz(quiz.id)">
          <div class="flex items-center justify-between mb-3">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              :class="difficultyClass(quiz.difficulty)">
              {{ quiz.difficulty }}
            </span>
            <span class="text-[10px] text-accent">+{{ quiz.xpReward }} XP</span>
          </div>
          <h3 class="text-sm font-semibold text-text-primary mb-1">{{ quiz.title }}</h3>
          <div class="flex items-center gap-3 text-[10px] text-text-secondary">
            <span>{{ quiz.questionCount }} câu hỏi</span>
            <span>Chủ đề: {{ quiz.topic }}</span>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="store.quizCatalog.length === 0 && !store.isBackendQuizLoading" class="text-center py-12">
        <p class="text-sm text-text-secondary mb-2">Chưa tải được danh sách quiz từ server.</p>
        <button @click="store.loadQuizCatalog()"
          class="px-4 py-2 rounded-lg text-xs font-medium bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition-colors">
          Tải danh sách quiz
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useQuizStore } from '../store/useQuizStore';
import SkeletonCard from '../../../components/SkeletonCard.vue';

const store = useQuizStore();

function difficultyClass(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return 'bg-accent-green/10 text-accent-green border border-accent-green/20';
    case 'medium': return 'bg-accent/10 text-accent border border-accent/20';
    case 'hard': return 'bg-accent-red/10 text-accent-red border border-accent-red/20';
    default: return 'bg-bg-surface/50 text-text-secondary';
  }
}

onMounted(() => {
  store.loadQuizCatalog();
});
</script>
