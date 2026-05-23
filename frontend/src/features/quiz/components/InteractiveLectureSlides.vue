<template>
  <div class="interactive-panel bg-[#0e1726]/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
    
    <!-- Tab Headers -->
    <div class="flex items-center justify-between border-b border-slate-800 pb-4">
      <div class="flex gap-2">
        <button 
          @click="activeTab = 'lecture'" 
          class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300"
          :class="activeTab === 'lecture' 
            ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]' 
            : 'text-slate-400 hover:text-slate-200 border border-transparent'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-4 h-4">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10" />
            <path d="M6 10h10" />
          </svg>
          <span>Lý Thuyết & Đồng Bộ</span>
        </button>
        <button 
          @click="activeTab = 'quiz'" 
          class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300"
          :class="activeTab === 'quiz' 
            ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
            : 'text-slate-400 hover:text-slate-200 border border-transparent'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-4 h-4">
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>Trắc Nghiệm Tương Tác</span>
        </button>
      </div>
      <div class="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 px-2 py-0.5 rounded-lg">
        Sprint 4 Active
      </div>
    </div>

    <!-- TAB 1: LECTURE SLIDES -->
    <div v-if="activeTab === 'lecture'" class="flex flex-col gap-5">
      <div class="p-5 bg-[#070b13]/60 border border-slate-800/60 rounded-xl flex flex-col gap-4 min-h-[160px] relative overflow-hidden">
        <!-- Glow accents -->
        <div class="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none"></div>
        
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-widest text-cyan-400 font-mono">
            Slide {{ currentSlideIndex + 1 }} / {{ slides.length }}
          </span>
          <span class="text-[11px] font-semibold text-slate-400 bg-[#0d1527] border border-slate-800 px-2.5 py-1 rounded-md">
            Đồng bộ bước giải thuật: #{{ activeSlide.triggerFrameIndex }}
          </span>
        </div>

        <h3 class="text-lg font-bold text-white tracking-tight leading-snug m-0">
          {{ activeSlide.title }}
        </h3>
        
        <p class="text-sm text-slate-300 leading-relaxed m-0 font-medium">
          {{ activeSlide.content }}
        </p>

        <div class="mt-2 flex items-center gap-2">
          <button 
            @click="syncSlideWithVisualizer" 
            class="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d1527] border border-cyan-800/40 hover:border-cyan-500/60 text-cyan-400 text-xs font-bold rounded-lg transition-all duration-200 active:scale-95 cursor-pointer"
            title="Đưa động họa visualizer về bước khớp với slide này"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span>💻 Xem minh họa bước này</span>
          </button>
        </div>
      </div>

      <!-- Slide Nav Controllers -->
      <div class="flex items-center justify-between gap-4">
        <button 
          @click="prevSlide" 
          :disabled="currentSlideIndex === 0"
          class="flex items-center gap-2 px-4 py-2.5 bg-[#0d1527] border border-[#1e293b] text-slate-400 hover:text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-slate-400 transition-all font-semibold text-xs active:scale-95 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>Slide Trước</span>
        </button>

        <!-- Slide Indicators -->
        <div class="flex gap-2">
          <span 
            v-for="(slide, idx) in slides" 
            :key="slide.slideId"
            @click="jumpToSlide(idx)"
            class="w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300"
            :class="idx === currentSlideIndex 
              ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,1)] scale-110' 
              : 'bg-slate-700 hover:bg-slate-500'"
          ></span>
        </div>

        <button 
          @click="nextSlide" 
          :disabled="currentSlideIndex === slides.length - 1"
          class="flex items-center gap-2 px-4 py-2.5 bg-[#0d1527] border border-[#1e293b] text-slate-400 hover:text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-slate-400 transition-all font-semibold text-xs active:scale-95 cursor-pointer"
        >
          <span>Slide Tiếp</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>

    <!-- TAB 2: INTERACTIVE QUIZ -->
    <div v-else class="flex flex-col gap-6">
      
      <!-- Multiple choice block -->
      <div class="flex flex-col gap-4">
        <h4 class="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 m-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-indigo-400">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" x2="12.01" y1="17" y2="17" />
          </svg>
          Câu hỏi trắc nghiệm lý thuyết dsa
        </h4>

        <div v-for="(q, qIdx) in quizQuestions" :key="q.id" class="p-4 bg-[#070b13]/50 border border-slate-800/80 rounded-xl flex flex-col gap-3">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wide">Câu hỏi {{ qIdx + 1 }}</div>
          <div class="text-sm font-bold text-white">{{ q.title }}</div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
            <label 
              v-for="opt in q.options" 
              :key="opt.key"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg border text-xs cursor-pointer transition-all duration-200"
              :class="userAnswers[q.id] === opt.key
                ? 'border-indigo-500/50 bg-indigo-500/10 text-white font-semibold' 
                : 'border-slate-800 bg-[#0c121e]/40 text-slate-300 hover:border-slate-700 hover:text-white'"
            >
              <input 
                type="radio" 
                :name="q.id" 
                v-model="userAnswers[q.id]" 
                :value="opt.key" 
                class="accent-indigo-500"
              />
              <span><strong>{{ opt.key }}.</strong> {{ opt.text }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px bg-slate-800"></div>

      <!-- Interactive Code Compliance Block -->
      <div class="flex flex-col gap-3">
        <div class="flex justify-between items-center">
          <h4 class="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 m-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-indigo-400">
              <path d="m18 16 4-4-4-4" />
              <path d="m6 8-4 4 4 4" />
              <path d="m14.5 4-5 16" />
            </svg>
            Thử thách viết mã (Code challenge)
          </h4>
          <span class="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
            Yêu cầu từ khóa: `temp`, `arr`
          </span>
        </div>
        <p class="text-xs text-slate-400 leading-normal m-0">
          Hãy hoàn thành hàm tráo đổi phần tử sử dụng biến tạm. Hệ thống sẽ biên dịch và kiểm duyệt compliance thời gian thực trong dưới 2ms.
        </p>

        <textarea
          v-model="studentCode"
          rows="4"
          placeholder="function swap(arr, i, j) { ... }"
          class="w-full bg-[#070b13] border border-slate-700/80 focus:border-indigo-500 rounded-xl p-3 text-xs font-mono text-white placeholder-slate-600 outline-none transition-all"
        ></textarea>

        <div class="flex items-center justify-between gap-3 flex-wrap">
          <button 
            @click="runCodeComplianceCheck" 
            class="px-4 py-2 bg-[#0d1527] border border-indigo-800/40 hover:border-indigo-500/60 text-indigo-400 text-xs font-bold rounded-lg transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-3.5 h-3.5">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>Kiểm duyệt cú pháp (Linter Check)</span>
          </button>
          
          <div v-if="complianceResult !== null" class="text-xs font-mono flex items-center gap-1.5">
            <template v-if="complianceResult">
              <span class="text-emerald-400 font-bold">🟢 Cú pháp hợp lệ (Compliant)</span>
              <span class="text-[10px] text-slate-500">(RAM &lt; 22MB, Latency &lt; 2ms)</span>
            </template>
            <template v-else>
              <span class="text-rose-400 font-bold">🔴 Thiếu từ khóa bắt buộc!</span>
            </template>
          </div>
        </div>
      </div>

      <!-- Submit Result Section -->
      <div class="mt-2 flex flex-col gap-4">
        <button 
          @click="submitAndGradeQuiz" 
          class="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/20 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-4 h-4">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>Nộp Bài Chấm Điểm</span>
        </button>

        <!-- Evaluation Results Showroom -->
        <div v-if="scoreResult !== null" class="p-4 rounded-xl border transition-all duration-300"
          :class="scoreResult.passed 
            ? 'bg-emerald-950/30 border-emerald-500/35 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
            : 'bg-amber-950/30 border-amber-500/35 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.1)]'"
        >
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm"
              :class="scoreResult.passed ? 'bg-emerald-500 text-black' : 'bg-amber-500 text-black'"
            >
              {{ scoreResult.passed ? '✓' : '!' }}
            </div>
            <div class="flex-1">
              <h5 class="text-sm font-bold m-0 flex items-center gap-1.5" :class="scoreResult.passed ? 'text-emerald-400' : 'text-amber-400'">
                Kết quả: {{ scoreResult.passed ? 'ĐẠT (PASSED)' : 'CHƯA ĐẠT (FAILED)' }}
              </h5>
              <p class="text-xs text-slate-300 mt-1 mb-0 leading-normal font-medium">
                Điểm số trắc nghiệm: <strong class="text-white">{{ scoreResult.totalScore }} / 30</strong>. 
                Kiểm duyệt mã nguồn: <strong class="text-white">{{ complianceResult ? 'Đạt' : 'Chưa Đạt' }}</strong>. 
                <span v-if="scoreResult.passed">Chúc mừng! Bạn đã nắm vững kiến thức sắp xếp nổi bọt.</span>
                <span v-else>Cần đạt tối thiểu 80% điểm số (24/30 điểm) và vượt qua kiểm duyệt linter để được tính là hoàn thành. Hãy xem lại slide lý thuyết!</span>
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useVcrStore } from '../../vcr-player/store/useVcrStore';
import { 
  LecturePlaybackCoordinator, 
  QuizEvaluationEngine, 
  type QuizQuestion, 
  type SlideEvent 
} from '../service/QuizEvaluationEngine';

const vcrStore = useVcrStore();

const activeTab = ref<'lecture' | 'quiz'>('lecture');
const currentSlideIndex = ref<number>(0);

// Slide database
const slides = ref<Array<{ slideId: string; title: string; content: string; triggerFrameIndex: number }>>([
  {
    slideId: 'slide-1',
    title: 'Khởi tạo Mảng & Vòng lặp Ngoài (i-loop)',
    content: 'Tại bước này, thuật toán chuẩn bị duyệt qua mảng đầu vào. Biến chạy i đại diện cho số lượt sắp xếp ngoài. Sau mỗi lượt, một phần tử lớn nhất sẽ nổi bọt về phía cuối mảng.',
    triggerFrameIndex: 0
  },
  {
    slideId: 'slide-2',
    title: 'Duyệt So sánh Lân cận (j-loop)',
    content: 'Chúng ta so sánh hai phần tử liên tiếp là arr[j] và arr[j+1]. Nếu phần tử đứng trước lớn hơn phần tử đứng sau, ta sẽ chuẩn bị thực hiện phép tráo đổi giá trị để đưa giá trị lớn hơn về phía sau.',
    triggerFrameIndex: 3
  },
  {
    slideId: 'slide-3',
    title: 'Thao tác Tráo đổi (Swap) sử dụng biến tạm Temp',
    content: 'Để tráo đổi hai phần tử, ta cần lưu giá trị của arr[j] vào một biến tạm temp để tránh bị ghi đè. Phép gán arr[j] = arr[j+1] được thực thi, sau đó arr[j+1] nhận giá trị từ temp.',
    triggerFrameIndex: 8
  },
  {
    slideId: 'slide-4',
    title: 'Đóng băng Vị trí Đã Sắp Xếp (Highlight Done)',
    content: 'Kết thúc mỗi chu kỳ của vòng lặp i, phần tử lớn nhất trong mảng chưa được sắp xếp sẽ đạt tới vị trí cuối cùng thích hợp của nó. Ta đánh dấu trạng thái của phần tử này là HOÀN TẤT (Highlight).',
    triggerFrameIndex: 15
  }
]);

const activeSlide = computed(() => slides.value[currentSlideIndex.value]);

// Quiz configurations
const quizQuestions = ref([
  {
    id: 'q1',
    title: 'Độ phức tạp thời gian trung bình (Average-case) của thuật toán sắp xếp nổi bọt (Bubble Sort) là gì?',
    options: [
      { key: 'A', text: 'O(N log N)' },
      { key: 'B', text: 'O(N)' },
      { key: 'C', text: 'O(N^2)' },
      { key: 'D', text: 'O(1)' }
    ],
    correctAnswer: 'C',
    maxScore: 10
  },
  {
    id: 'q2',
    title: 'Thuật toán sắp xếp nổi bọt (Bubble Sort) có tính chất ổn định (Stable) hay không?',
    options: [
      { key: 'A', text: 'Có, là thuật toán ổn định' },
      { key: 'B', text: 'Không, không phải thuật toán ổn định' },
      { key: 'C', text: 'Tùy thuộc vào cách cài đặt vòng lặp ngược' },
      { key: 'D', text: 'Chỉ ổn định với các mảng có độ dài dưới 10' }
    ],
    correctAnswer: 'A',
    maxScore: 10
  },
  {
    id: 'q3',
    title: 'Tại sao phép so sánh và tráo đổi trong Bubble Sort chỉ diễn ra giữa hai phần tử kề nhau?',
    options: [
      { key: 'A', text: 'Vì cấu trúc phần cứng máy tính chỉ hỗ trợ so sánh lân cận' },
      { key: 'B', text: 'Để đảm bảo tính chất nổi bọt tuyến tính và bảo toàn độ phức tạp không gian O(1)' },
      { key: 'C', text: 'Để thuật toán chạy nhanh hơn Quick Sort' },
      { key: 'D', text: 'Không có lý do cụ thể, chỉ là do quy ước của tác giả' }
    ],
    correctAnswer: 'B',
    maxScore: 10
  }
]);

const userAnswers = ref<Record<string, string>>({
  q1: '',
  q2: '',
  q3: ''
});

const studentCode = ref<string>(
`function swap(arr, i, j) {
  let temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}`
);

const complianceResult = ref<boolean | null>(null);
const scoreResult = ref<{ totalScore: number; passed: boolean } | null>(null);

// Slide deck coordinator
const slideEvents: SlideEvent[] = slides.value.map(s => ({
  slideId: s.slideId,
  triggerFrameIndex: s.triggerFrameIndex,
  highlightSourceLine: s.triggerFrameIndex
}));

const coordinator = new LecturePlaybackCoordinator(slideEvents, (ev) => {
  const index = slides.value.findIndex(s => s.slideId === ev.slideId);
  if (index !== -1) {
    currentSlideIndex.value = index;
  }
});

// Navigation actions
const prevSlide = () => {
  coordinator.prevSlide();
  autoSyncWithVisualizer();
};

const nextSlide = () => {
  coordinator.nextSlide();
  autoSyncWithVisualizer();
};

const jumpToSlide = (idx: number) => {
  if (idx >= 0 && idx < slides.value.length) {
    currentSlideIndex.value = idx;
    // Đồng bộ ngược lại vào class coordinator
    const event = slideEvents[idx];
    autoSyncWithVisualizer();
  }
};

const autoSyncWithVisualizer = () => {
  // Tự động nhảy bước tương thích trên visualizer
  const frameIndex = activeSlide.value.triggerFrameIndex;
  if (vcrStore.playbackFrames.length > 0) {
    // Đảm bảo không nhảy quá số khung hình tối đa hiện có
    const targetIdx = Math.min(frameIndex, vcrStore.playbackFrames.length - 1);
    vcrStore.jumpToFrame(targetIdx);
  }
};

const syncSlideWithVisualizer = () => {
  // Khi người dùng bấm nút xem minh họa thủ công
  if (vcrStore.playbackFrames.length === 0) {
    vcrStore.compileAndLoad();
  }
  autoSyncWithVisualizer();
};

// Quiz evaluation actions
const runCodeComplianceCheck = () => {
  // Chạy kiểm soát compliance linter bắt buộc của Sprint 4
  const isCompliant = QuizEvaluationEngine.verifyCodeCompliance(studentCode.value, ['temp', 'arr']);
  complianceResult.value = isCompliant;
  return isCompliant;
};

const submitAndGradeQuiz = () => {
  // 1. Chấm điểm trắc nghiệm
  const questions: QuizQuestion[] = quizQuestions.value.map(q => ({
    id: q.id,
    correctAnswer: q.correctAnswer,
    maxScore: q.maxScore
  }));
  
  const scoreEval = QuizEvaluationEngine.calculateQuizScore(userAnswers.value, questions);
  
  // 2. Kiểm thử linter
  const codeCompliant = runCodeComplianceCheck();

  // Đạt (Passed) nếu điểm >= 80% (tức là 24/30 điểm trở lên) VÀ mã nguồn compliant
  const passed = scoreEval.passed && codeCompliant;

  scoreResult.value = {
    totalScore: scoreEval.totalScore,
    passed
  };
};
</script>

<style scoped>
/* Neon glow aesthetics & responsive styling if applicable */
textarea {
  resize: vertical;
}
</style>
