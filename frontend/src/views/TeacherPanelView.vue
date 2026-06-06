<template>
  <div class="teacher-panel">
    <h1 class="panel-title">
      🎓 Teacher Dashboard
      <span class="panel-title__badge">Admin</span>
    </h1>

    <!-- Analytics Grid -->
    <section class="analytics-section">
      <h2 class="section-heading">Thống kê lớp học</h2>
      <div class="analytics-grid">
        <div v-for="metric in analyticsCards" :key="metric.label" class="metric-card">
          <span class="metric-card__value">{{ metric.value }}</span>
          <span class="metric-card__label">{{ metric.label }}</span>
        </div>
      </div>
    </section>

    <!-- Quiz Management -->
    <section class="quiz-manage-section">
      <h2 class="section-heading">Thêm câu hỏi Quiz mới</h2>
      <form class="quiz-form" @submit.prevent="submitQuiz">
        <div class="form-row">
          <label class="form-label">Tiêu đề Quiz</label>
          <input v-model="newQuiz.title" class="form-input" placeholder="VD: Cơ bản về Linked List" required />
        </div>
        <div class="form-row">
          <label class="form-label">Chủ đề</label>
          <input v-model="newQuiz.topic" class="form-input" placeholder="VD: linked-list" required />
        </div>
        <div class="form-row form-row--inline">
          <div>
            <label class="form-label">Độ khó</label>
            <select v-model="newQuiz.difficulty" class="form-select">
              <option value="easy">Dễ</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Khó</option>
            </select>
          </div>
          <div>
            <label class="form-label">XP Reward</label>
            <input v-model.number="newQuiz.xpReward" type="number" class="form-input" min="10" max="500" />
          </div>
        </div>

        <!-- Questions -->
        <div class="questions-section">
          <h3 class="questions-heading">
            Câu hỏi ({{ newQuiz.questions.length }})
            <button type="button" class="btn-add-q" @click="addQuestion">+ Thêm câu</button>
          </h3>
          <div v-for="(q, qi) in newQuiz.questions" :key="qi" class="question-block">
            <div class="question-block__header">
              <span class="question-block__num">Câu {{ qi + 1 }}</span>
              <button v-if="newQuiz.questions.length > 1" type="button" class="btn-remove" @click="removeQuestion(qi)">×</button>
            </div>
            <input v-model="q.text" class="form-input" placeholder="Nội dung câu hỏi..." required />
            <div class="options-grid">
              <div v-for="(_, oi) in q.options" :key="oi" class="option-row">
                <input type="radio" :name="'correct-' + qi" :value="oi" v-model="q.correctIndex" />
                <input v-model="q.options[oi]" class="form-input form-input--sm" :placeholder="'Đáp án ' + String.fromCharCode(65 + oi)" required />
              </div>
            </div>
            <input v-model="q.explanation" class="form-input form-input--sm" placeholder="Giải thích đáp án đúng..." />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-submit" :disabled="submitting">
            {{ submitting ? 'Đang gửi...' : 'Gửi Quiz vào hệ thống' }}
          </button>
          <p v-if="submitMessage" class="submit-message" :class="{ 'submit-message--error': submitError }">
            {{ submitMessage }}
          </p>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

interface QuestionForm {
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const newQuiz = reactive({
  title: '',
  topic: '',
  difficulty: 'medium',
  xpReward: 50,
  questions: [createEmptyQuestion()] as QuestionForm[],
});

const submitting = ref(false);
const submitMessage = ref('');
const submitError = ref(false);

interface AnalyticsMetric {
  label: string;
  value: string | number;
}

const analyticsCards = ref<AnalyticsMetric[]>([
  { label: 'Tổng Quiz', value: '—' },
  { label: 'Lượt làm bài', value: '—' },
  { label: 'Tỷ lệ đạt', value: '—' },
  { label: 'Câu hỏi đã trả lời', value: '—' },
]);

function createEmptyQuestion(): QuestionForm {
  return { text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' };
}

function addQuestion(): void {
  newQuiz.questions.push(createEmptyQuestion());
}

function removeQuestion(index: number): void {
  newQuiz.questions.splice(index, 1);
}

async function loadAnalytics(): Promise<void> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/analytics`);
    if (!res.ok) return;
    const data = await res.json();
    analyticsCards.value = [
      { label: 'Tổng Quiz', value: data.totalQuizzes },
      { label: 'Lượt làm bài', value: data.totalAttempts },
      { label: 'Tỷ lệ đạt', value: data.averagePassRate + '%' },
      { label: 'Câu hỏi đã trả lời', value: data.totalQuestionsAnswered },
    ];
  } catch { /* analytics is optional */ }
}

async function submitQuiz(): Promise<void> {
  submitting.value = true;
  submitMessage.value = '';
  submitError.value = false;

  const payload = {
    id: '',
    title: newQuiz.title,
    topic: newQuiz.topic,
    difficulty: newQuiz.difficulty,
    xpReward: newQuiz.xpReward,
    questions: newQuiz.questions.map((q, i) => ({
      id: `custom-q${i + 1}`,
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    })),
  };

  try {
    const res = await fetch(`${BASE_URL}/api/v1/concepts/quiz/manage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message ?? 'Thêm quiz thất bại');
    }
    submitMessage.value = 'Quiz đã được thêm thành công!';
    newQuiz.title = '';
    newQuiz.topic = '';
    newQuiz.difficulty = 'medium';
    newQuiz.xpReward = 50;
    newQuiz.questions = [createEmptyQuestion()];
    await loadAnalytics();
  } catch (err: unknown) {
    submitError.value = true;
    submitMessage.value = err instanceof Error ? err.message : 'Lỗi không xác định';
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  loadAnalytics();
});
</script>

<style scoped>
.teacher-panel {
  padding: 2rem;
  min-height: 100%;
  overflow-y: auto;
}

.panel-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary, #e2e8f0);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.panel-title__badge {
  font-size: 0.7rem;
  padding: 2px 10px;
  border-radius: 4px;
  background: rgba(234, 179, 8, 0.15);
  color: #eab308;
  font-weight: 700;
  text-transform: uppercase;
}

.section-heading {
  font-size: 1.1rem;
  color: var(--text-primary, #e2e8f0);
  margin-bottom: 1rem;
  font-weight: 500;
}

/* ── Analytics ──────────────────────────── */
.analytics-section {
  margin-bottom: 2.5rem;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.metric-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
}

.metric-card__value {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.metric-card__label {
  font-size: 0.8rem;
  color: var(--text-tertiary, #64748b);
}

/* ── Quiz Form ──────────────────────────── */
.quiz-form {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem;
}

.form-row {
  margin-bottom: 1rem;
}

.form-row--inline {
  display: flex;
  gap: 1rem;
}

.form-row--inline > div {
  flex: 1;
}

.form-label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-secondary, #94a3b8);
  margin-bottom: 0.35rem;
  font-weight: 500;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary, #e2e8f0);
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.15s;
}

.form-input:focus,
.form-select:focus {
  border-color: #6366f1;
}

.form-input--sm {
  padding: 0.4rem 0.6rem;
  font-size: 0.85rem;
}

.form-select option {
  background: #1e1e2e;
  color: #e2e8f0;
}

/* ── Questions ──────────────────────────── */
.questions-section {
  margin-top: 1.5rem;
}

.questions-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.95rem;
  color: var(--text-primary, #e2e8f0);
  margin-bottom: 1rem;
}

.btn-add-q {
  font-size: 0.8rem;
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid rgba(99, 102, 241, 0.4);
  background: transparent;
  color: #818cf8;
  cursor: pointer;
}

.btn-add-q:hover {
  background: rgba(99, 102, 241, 0.1);
}

.question-block {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.question-block__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.question-block__num {
  font-size: 0.8rem;
  font-weight: 600;
  color: #818cf8;
}

.btn-remove {
  background: transparent;
  border: none;
  color: #f87171;
  font-size: 1.1rem;
  cursor: pointer;
  line-height: 1;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin: 0.75rem 0;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.option-row input[type="radio"] {
  accent-color: #6366f1;
}

/* ── Actions ───────────────────────────── */
.form-actions {
  margin-top: 1.5rem;
  text-align: center;
}

.btn-submit {
  padding: 0.7rem 2rem;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: #fff;
  border: none;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-submit:hover:not(:disabled) {
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35);
}

.submit-message {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: #34d399;
}

.submit-message--error {
  color: #f87171;
}
</style>
