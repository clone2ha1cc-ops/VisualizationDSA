<template>
  <div class="h-full flex flex-col p-4 gap-4">
    <!-- Array Input -->
    <div class="space-y-2">
      <label
        class="text-[10px] uppercase tracking-wider text-slate-500 font-medium"
      >
        Input Array
      </label>
      <div class="flex gap-2">
        <div class="flex-1 relative">
          <input
            v-model="vcrStore.rawInputArray"
            type="text"
            placeholder="45, 12, 85, 32, 9, 60"
            class="w-full bg-slate-950 border border-slate-700/50 rounded-lg px-3 py-2 text-sm font-mono text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none transition-colors"
          />
        </div>
        <button
          @click="randomizeArray"
          class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
        >
          Random
        </button>
        <button
          @click="compileInput"
          class="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium transition-colors"
        >
          Run
        </button>
      </div>
    </div>

    <!-- Error -->
    <div
      v-if="compilationError"
      class="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-300"
    >
      {{ compilationError }}
    </div>

    <!-- Progress -->
    <div class="space-y-2">
      <div class="flex items-center justify-between text-xs">
        <span class="text-slate-500">Progress</span>
        <span class="font-mono text-cyan-400"
          >{{ vcrStore.currentFrameIndex + 1 }} /
          {{ vcrStore.totalFrames }}</span
        >
      </div>
      <input
        type="range"
        min="0"
        :max="Math.max(0, vcrStore.totalFrames - 1)"
        :value="vcrStore.currentFrameIndex"
        @input="handleScrub"
        :disabled="vcrStore.totalFrames === 0"
        class="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-cyan-500 disabled:opacity-40"
      />
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-center gap-2 pt-2">
      <button
        @click="vcrStore.stepPrev"
        :disabled="vcrStore.totalFrames === 0 || vcrStore.isAtStart"
        class="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </svg>
      </button>

      <button
        @click="vcrStore.togglePlay"
        :disabled="vcrStore.totalFrames === 0"
        class="w-12 h-12 flex items-center justify-center rounded-xl text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        :class="
          vcrStore.isPlaying
            ? 'bg-rose-500 hover:bg-rose-400'
            : 'bg-cyan-500 hover:bg-cyan-400'
        "
      >
        <svg
          v-if="vcrStore.isPlaying"
          class="w-6 h-6"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        </svg>
        <svg
          v-else
          class="w-6 h-6 ml-0.5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>

      <button
        @click="vcrStore.stepNext"
        :disabled="
          vcrStore.totalFrames === 0 ||
          (!vcrStore.isLooping && vcrStore.isAtEnd)
        "
        class="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </svg>
      </button>

      <button
        @click="vcrStore.reset"
        :disabled="vcrStore.totalFrames === 0"
        class="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          stroke-width="2"
        >
          <path
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>

    <!-- Speed -->
    <div class="flex items-center justify-center gap-2 pt-1">
      <span class="text-[10px] text-slate-500">Speed</span>
      <div class="flex gap-1">
        <button
          v-for="speed in [0.5, 1, 2, 4]"
          :key="speed"
          @click="vcrStore.playbackSpeed = speed"
          class="px-2 py-1 text-[10px] rounded transition-colors"
          :class="
            vcrStore.playbackSpeed === speed
              ? 'bg-cyan-500/20 text-cyan-400'
              : 'text-slate-500 hover:text-slate-300'
          "
        >
          {{ speed }}x
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useVcrStore } from "../store/useVcrStore";

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
    compilationError.value = res.error || "Lỗi không xác định khi biên dịch";
  }
};

// Randomize array list helper
const randomizeArray = () => {
  const length = Math.floor(Math.random() * 5) + 6; // 6 to 10 items
  const arr = Array.from({ length }, () => Math.floor(Math.random() * 90) + 10);
  vcrStore.rawInputArray = arr.join(", ");
  compileInput();
};

// Global Hotkeys Listener (Space to Play/Pause, Arrow keys to step)
const handleGlobalKeydown = (e: KeyboardEvent) => {
  if (
    document.activeElement?.tagName === "INPUT" ||
    document.activeElement?.tagName === "TEXTAREA"
  ) {
    return;
  }
  if (e.code === "Space") {
    e.preventDefault();
    vcrStore.togglePlay();
  } else if (e.code === "ArrowRight") {
    e.preventDefault();
    vcrStore.stepNext();
  } else if (e.code === "ArrowLeft") {
    e.preventDefault();
    vcrStore.stepPrev();
  }
};

onMounted(() => window.addEventListener("keydown", handleGlobalKeydown));
onBeforeUnmount(() =>
  window.removeEventListener("keydown", handleGlobalKeydown),
);
</script>
