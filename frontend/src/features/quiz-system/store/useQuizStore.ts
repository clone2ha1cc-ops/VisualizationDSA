import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useLectureStore } from '../../e-lecture/store/useLectureStore';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import { QuizVerificationEngine } from '../engine/QuizVerificationEngine';
import { QuizStatsManager } from '../engine/QuizStatsManager';
import type { QuizQuestion, QuizCheckpoint, CanvasNodeDTO } from '../types/quiz.types';
import { submitQuizAttempt } from '../service/quizApi';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { resetActiveQuestionState, verifyAndRecordOption } from './quizStoreHelpers';

/**
 * useQuizStore — Pinia Store điều khiển trạng thái trắc nghiệm tương tác.
 * Quản lý checkpoint detection, câu hỏi MC/TF/Canvas, chấm điểm,
 * khóa bài giảng E-Lecture và đồng bộ thống kê localStorage.
 * ✅ A1 FIX: Sau mỗi session, kết quả được sync lên server nếu user đã đăng nhập.
 */
export const useQuizStore = defineStore('quizSystem', () => {
  const lectureStore = useLectureStore();
  const animStore = useAnimationStore();

  // STATE
  const activeQuestion        = ref<QuizQuestion | null>(null);
  const selectedAnswerIndex   = ref<number | null>(null);
  const isSubmitted           = ref(false);
  const isCorrect             = ref(false);
  const feedbackExplanation   = ref('');
  const matchedNodeId         = ref<string | null>(null);
  const isCanvasTargetMode    = ref(false);
  const checkpoints           = ref<QuizCheckpoint[]>([]);
  const completedCheckpointIndexes = ref<number[]>([]);
  const sessionCorrect        = ref(0);
  const sessionTotal          = ref(0);

  // GETTERS
  const isLectureLockedByQuiz    = computed(() => activeQuestion.value !== null);
  const isQuizActive             = computed(() => activeQuestion.value !== null);
  const sessionAccuracy          = computed(() =>
    sessionTotal.value === 0 ? 0 : Math.round((sessionCorrect.value / sessionTotal.value) * 100)
  );
  const allCheckpointsCompleted  = computed(() =>
    checkpoints.value.length > 0 &&
    checkpoints.value.every(cp => completedCheckpointIndexes.value.includes(cp.frameIndex))
  );

  // ACTIONS
  function loadCheckpoints(quizCheckpoints: QuizCheckpoint[]): void {
    checkpoints.value = quizCheckpoints;
    completedCheckpointIndexes.value = [];
    sessionCorrect.value = 0;
    sessionTotal.value   = 0;
  }

  function checkFrameForQuiz(frameIndex: number): void {
    if (activeQuestion.value !== null) return;
    if (completedCheckpointIndexes.value.includes(frameIndex)) return;
    const checkpoint = checkpoints.value.find(cp => cp.frameIndex === frameIndex);
    if (checkpoint) triggerCheckpointQuestion(checkpoint.question, frameIndex);
  }

  function triggerCheckpointQuestion(question: QuizQuestion, frameIndex: number): void {
    activeQuestion.value      = question;
    selectedAnswerIndex.value = null;
    isSubmitted.value         = false;
    isCorrect.value           = false;
    feedbackExplanation.value = '';
    matchedNodeId.value       = null;
    isCanvasTargetMode.value  = question.type === 'CANVAS_TARGET';
    lectureStore.lockLectureInteraction();
    if (!completedCheckpointIndexes.value.includes(frameIndex)) {
      completedCheckpointIndexes.value.push(frameIndex);
    }
  }

  function submitOptionAnswer(index: number): void {
    if (!activeQuestion.value || isSubmitted.value) return;
    selectedAnswerIndex.value = index;
    isSubmitted.value = true;
    const result = verifyAndRecordOption(index, activeQuestion.value, sessionCorrect, sessionTotal);
    isCorrect.value           = result.isCorrect;
    feedbackExplanation.value = result.explanation;
  }

  function handleCanvasClickAnswer(clickX: number, clickY: number, nodes: CanvasNodeDTO[]): void {
    if (!activeQuestion.value || isSubmitted.value) return;
    if (activeQuestion.value.type !== 'CANVAS_TARGET') return;
    const result = QuizVerificationEngine.verifyCanvasClickAnswer(clickX, clickY, nodes, activeQuestion.value);
    if (!result.matchedNodeId) return;
    isSubmitted.value         = true;
    isCorrect.value           = result.isCorrect;
    feedbackExplanation.value = result.explanation;
    matchedNodeId.value       = result.matchedNodeId ?? null;
    isCanvasTargetMode.value  = false;
    sessionTotal.value++;
    if (result.isCorrect) sessionCorrect.value++;
    QuizStatsManager.saveAttempt(result.isCorrect, activeQuestion.value.id);
  }

  function dismissQuestionAndContinue(): void {
    resetActiveQuestionState(activeQuestion, selectedAnswerIndex, isSubmitted, isCorrect, feedbackExplanation, matchedNodeId, isCanvasTargetMode);
    lectureStore.unlockLectureInteraction();
  }

  function resetQuizStore(): void {
    resetActiveQuestionState(activeQuestion, selectedAnswerIndex, isSubmitted, isCorrect, feedbackExplanation, matchedNodeId, isCanvasTargetMode);
    checkpoints.value                = [];
    completedCheckpointIndexes.value = [];
    sessionCorrect.value             = 0;
    sessionTotal.value               = 0;
  }

  /**
   * ✅ A1 FIX: Sync kết quả quiz session hiện tại lên server.
   * Gọi sau khi allCheckpointsCompleted = true (hết bài giảng).
   * Silent fail nếu offline hoặc chưa đăng nhập.
   */
  async function syncSessionToServer(quizId: string): Promise<void> {
    if (sessionTotal.value === 0) return;
    const authStore = useAuthStore();
    const token     = authStore.getAccessToken(); // ✅ dùng public method
    const passed    = sessionTotal.value > 0 ? sessionCorrect.value / sessionTotal.value >= 0.6 : false;
    await submitQuizAttempt({ quizId, score: sessionCorrect.value, maxScore: sessionTotal.value, passed }, token);
  }

  return {
    activeQuestion, selectedAnswerIndex, isSubmitted, isCorrect, feedbackExplanation,
    matchedNodeId, isCanvasTargetMode, checkpoints, completedCheckpointIndexes,
    sessionCorrect, sessionTotal,
    isLectureLockedByQuiz, isQuizActive, sessionAccuracy, allCheckpointsCompleted,
    loadCheckpoints, checkFrameForQuiz, triggerCheckpointQuestion,
    submitOptionAnswer, handleCanvasClickAnswer, dismissQuestionAndContinue,
    resetQuizStore, syncSessionToServer, // ✅ A1 FIX
  };
});
