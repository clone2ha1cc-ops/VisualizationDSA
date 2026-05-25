<template>
  <div v-if="options && type !== 'CANVAS_TARGET'" class="quiz-options">
    <button
      v-for="(option, idx) in options"
      :key="idx"
      class="quiz-option-btn"
      :class="{
        'option-selected':  selectedIndex === idx && !isSubmitted,
        'option-correct':   isSubmitted && idx === correctIndex,
        'option-incorrect': isSubmitted && selectedIndex === idx && idx !== correctIndex,
        'option-disabled':  isSubmitted,
      }"
      :disabled="isSubmitted"
      @click="$emit('select', idx)"
    >
      <span class="option-letter">{{ letters[idx] }}</span>
      <span class="option-text">{{ option }}</span>
      <span v-if="isSubmitted && idx === correctIndex" class="option-icon correct-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 5 5L20 7" /></svg>
      </span>
      <span v-if="isSubmitted && selectedIndex === idx && idx !== correctIndex" class="option-icon incorrect-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  options?: string[];
  type?: string;
  selectedIndex: number | null;
  isSubmitted: boolean;
  correctIndex?: number;
}>();
defineEmits<{ select: [number] }>();
const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
</script>

<style scoped>
.quiz-options { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.quiz-option-btn { display: flex; align-items: center; gap: 12px; width: 100%; padding: 14px 16px; text-align: left; font-family: 'Outfit','Inter',sans-serif; font-size: 13.5px; color: #e2e8f0; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; cursor: pointer; transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
.quiz-option-btn:hover:not(.option-disabled) { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); transform: translateY(-1px); }
.quiz-option-btn.option-selected  { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.1); }
.quiz-option-btn.option-correct   { border-color: #10b981; background: rgba(16,185,129,0.1); color: #6ee7b7; }
.quiz-option-btn.option-incorrect { border-color: #ef4444; background: rgba(239,68,68,0.1); color: #fca5a5; }
.quiz-option-btn.option-disabled  { cursor: default; opacity: 0.85; }
.option-letter { display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); font-size: 12px; font-weight: 700; color: #94a3b8; flex-shrink: 0; }
.option-text { flex: 1; line-height: 1.4; }
.option-icon { flex-shrink: 0; display: flex; align-items: center; }
.correct-icon { color: #10b981; }
.incorrect-icon { color: #ef4444; }
</style>
