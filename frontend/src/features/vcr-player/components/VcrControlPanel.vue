<template>
  <div class="vcr-panel bg-[#0e1726]/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
    
    <!-- Custom Array Input & Compilation Controls -->
    <div class="flex flex-col md:flex-row gap-4 items-end">
      <div class="flex-1 w-full flex flex-col gap-2">
        <label for="array-input" class="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 text-cyan-400">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M7 8h10" />
            <path d="M7 12h10" />
            <path d="M7 16h6" />
          </svg>
          Mảng đầu vào (Ngăn cách bằng dấu phẩy)
        </label>
        <div class="relative">
          <input
            id="array-input"
            type="text"
            v-model="vcrStore.rawInputArray"
            placeholder="Ví dụ: 45, 12, 85, 32, 9, 60"
            class="w-full bg-[#070b13] border border-slate-700/80 hover:border-slate-600 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-slate-600 outline-none transition-all pr-24"
          />
          <button 
            @click="randomizeArray"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold px-2.5 py-1.5 bg-slate-800/90 hover:bg-slate-700/90 text-cyan-400 rounded-lg transition-all active:scale-95 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            Ngẫu nhiên
          </button>
        </div>
      </div>

      <button 
        @click="compileInput" 
        class="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-cyan-950/20 active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
          <path d="m18 16 4-4-4-4" />
          <path d="m6 8-4 4 4 4" />
          <path d="m14.5 4-5 16" />
        </svg>
        Biên dịch lại
      </button>
    </div>

    <!-- Error Prompting Box -->
    <div v-if="compilationError" class="p-3.5 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-400 flex items-start gap-2.5">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-4 h-4 shrink-0 mt-0.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      </svg>
      <div>
        <span class="font-bold">Lỗi Biên Dịch:</span> {{ compilationError }}
      </div>
    </div>

    <!-- Divider -->
    <div class="h-px bg-slate-800"></div>

    <!-- Scrubber Slider -->
    <div class="flex flex-col gap-2">
      <div class="flex justify-between items-center text-xs font-semibold text-slate-400">
        <span>Tiến trình các bước</span>
        <span class="font-mono text-cyan-400 bg-cyan-950/30 px-2 py-0.5 rounded-md">
          Bước {{ vcrStore.totalFrames > 0 ? vcrStore.currentFrameIndex + 1 : 0 }} / {{ vcrStore.totalFrames }}
        </span>
      </div>
      
      <div class="flex items-center gap-3">
        <input 
          type="range" 
          min="0" 
          :max="vcrStore.totalFrames > 0 ? vcrStore.totalFrames - 1 : 0" 
          :value="vcrStore.currentFrameIndex"
          @input="handleScrub"
          :disabled="vcrStore.totalFrames === 0"
          class="flex-1 accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
        />
      </div>
    </div>

    <!-- VCR Control Buttons & Meta Speed Controls -->
    <div class="flex flex-col lg:flex-row items-center justify-between gap-6">
      
      <!-- Primary Action Controls -->
      <div class="flex items-center gap-3">
        <!-- Step Previous -->
        <button 
          @click="vcrStore.stepPrev" 
          :disabled="vcrStore.totalFrames === 0 || vcrStore.isAtStart"
          class="flex items-center justify-center w-[42px] h-[42px] rounded-xl bg-[#0d1527] border border-[#1e293b] text-[#94a3b8] transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed [&:not(:disabled):hover]:text-[#38bdf8] [&:not(:disabled):hover]:border-[#0284c7] [&:not(:disabled):hover]:bg-[#0b1e36] [&:not(:disabled):hover]:shadow-[0_0_10px_rgba(6,182,212,0.25)] [&:not(:disabled):active]:scale-[0.93]"
          title="Lùi 1 bước"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
            <polygon points="19 20 9 12 19 4 19 20" />
            <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          </svg>
        </button>

        <!-- Play / Pause -->
        <button 
          @click="vcrStore.togglePlay" 
          :disabled="vcrStore.totalFrames === 0"
          class="flex items-center justify-center w-[52px] h-[52px] rounded-2xl border-none transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed disabled:shadow-none [&:not(:disabled):hover]:brightness-110 [&:not(:disabled):active]:scale-[0.92]"
          :class="vcrStore.isPlaying ? 'bg-gradient-to-br from-[#e11d48] to-[#be185d] shadow-[0_4px_14px_rgba(225,29,72,0.35)] [&:not(:disabled):hover]:shadow-[0_0_16px_rgba(225,29,72,0.55)]' : 'bg-gradient-to-br from-[#06b6d4] to-[#3b82f6] shadow-[0_4px_14px_rgba(6,182,212,0.35)] [&:not(:disabled):hover]:shadow-[0_0_16px_rgba(6,182,212,0.55)]'"
          :title="vcrStore.isPlaying ? 'Tạm dừng (Space)' : 'Chạy tự động (Space)'"
        >
          <template v-if="vcrStore.isPlaying">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-white">
              <rect x="4" y="4" width="4" height="16" rx="1" />
              <rect x="16" y="4" width="4" height="16" rx="1" />
            </svg>
          </template>
          <template v-else>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 translate-x-0.5 text-white">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </template>
        </button>

        <!-- Step Next -->
        <button 
          @click="vcrStore.stepNext" 
          :disabled="vcrStore.totalFrames === 0 || (!vcrStore.isLooping && vcrStore.isAtEnd)"
          class="flex items-center justify-center w-[42px] h-[42px] rounded-xl bg-[#0d1527] border border-[#1e293b] text-[#94a3b8] transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed [&:not(:disabled):hover]:text-[#38bdf8] [&:not(:disabled):hover]:border-[#0284c7] [&:not(:disabled):hover]:bg-[#0b1e36] [&:not(:disabled):hover]:shadow-[0_0_10px_rgba(6,182,212,0.25)] [&:not(:disabled):active]:scale-[0.93]"
          title="Tiến 1 bước"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
            <polygon points="5 4 15 12 5 20 5 4" />
            <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          </svg>
        </button>

        <!-- Reset -->
        <button 
          @click="vcrStore.reset" 
          :disabled="vcrStore.totalFrames === 0"
          class="flex items-center justify-center w-[42px] h-[42px] rounded-xl bg-[#0d1527] border border-[#1e293b] text-rose-400 transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed [&:not(:disabled):hover]:text-rose-300 [&:not(:disabled):hover]:border-rose-800/50 [&:not(:disabled):hover]:bg-rose-950/30 [&:not(:disabled):active]:scale-[0.93]"
          title="Khởi tạo lại trạng thái đầu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>

      <!-- Loop & Playback Speed configuration -->
      <div class="flex items-center flex-wrap gap-5">
        <!-- Loop Toggle Switch -->
        <div class="flex items-center gap-2">
          <button 
            @click="vcrStore.isLooping = !vcrStore.isLooping"
            class="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-[#070b13] border text-[13px] font-semibold cursor-pointer transition-all duration-200 hover:text-[#cbd5e1] hover:border-[#334155] active:scale-96"
            :class="vcrStore.isLooping ? 'text-[#10b981] border-[#059669] shadow-[0_0_8px_rgba(16,185,129,0.2)]' : 'text-[#64748b] border-[#1e293b]'"
            title="Tự động lặp lại khi hoàn tất"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
              <path d="m17 2 4 4-4 4" />
              <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
              <path d="m7 22-4-4 4-4" />
              <path d="M21 13v1a4 4 0 0 1-4 4H3" />
            </svg>
            <span>Tự lặp lại</span>
          </button>
        </div>

        <div class="h-6 w-px bg-slate-800 hidden sm:block"></div>

        <!-- Playback Speed Controls -->
        <div class="flex items-center gap-1.5 bg-[#070b13] p-1 rounded-xl border border-slate-800">
          <button 
            v-for="speed in speeds" 
            :key="speed"
            @click="vcrStore.playbackSpeed = speed"
            class="px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all duration-200 hover:text-[#94a3b8]"
            :class="vcrStore.playbackSpeed === speed ? 'text-[#22d3ee] bg-[#0c1c30]' : 'text-[#64748b]'"
          >
            {{ speed }}x
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useVcrStore } from '../store/useVcrStore';

const vcrStore = useVcrStore();
const compilationError = ref<string | null>(null);
const speeds = [0.5, 1, 2, 4];

// Handle manual scrub tracking from slide inputs
const handleScrub = (e: Event) => {
  const target = e.target as HTMLInputElement;
  vcrStore.jumpToFrame(parseInt(target.value, 10));
};

// Fire standard custom input compiles
const compileInput = () => {
  compilationError.value = null;
  const res = vcrStore.compileAndLoad();
  if (!res.success) {
    compilationError.value = res.error || 'Lỗi không xác định khi biên dịch';
  }
};

// Randomize array list helper
const randomizeArray = () => {
  const length = Math.floor(Math.random() * 5) + 6; // 6 to 10 items
  const arr = Array.from({ length }, () => Math.floor(Math.random() * 90) + 10);
  vcrStore.rawInputArray = arr.join(', ');
  compileInput();
};

// Global Hotkeys Listener (Space to Play/Pause, Arrow keys to step)
const handleGlobalKeydown = (e: KeyboardEvent) => {
  if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
    return;
  }
  if (e.code === 'Space') {
    e.preventDefault();
    vcrStore.togglePlay();
  } else if (e.code === 'ArrowRight') {
    e.preventDefault();
    vcrStore.stepNext();
  } else if (e.code === 'ArrowLeft') {
    e.preventDefault();
    vcrStore.stepPrev();
  }
};

onMounted(() => window.addEventListener('keydown', handleGlobalKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', handleGlobalKeydown));
</script>
