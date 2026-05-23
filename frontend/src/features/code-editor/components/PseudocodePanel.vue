<template>
  <div class="h-full flex flex-col bg-slate-900/50">
    <!-- Variables HUD -->
    <div
      v-if="activeLoopVars.length > 0"
      class="px-4 py-2 bg-slate-800/50 border-b border-slate-700/30"
    >
      <div class="flex items-center gap-2 flex-wrap">
        <span
          class="text-[10px] uppercase tracking-wider text-slate-500 font-medium"
          >Variables:</span
        >
        <span
          v-for="[vName, vVal] in activeLoopVars"
          :key="vName"
          class="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-xs font-mono text-cyan-300"
        >
          {{ vName }} = {{ vVal }}
        </span>
      </div>
    </div>

    <!-- Code Lines -->
    <div class="flex-1 overflow-y-auto p-2" ref="viewport">
      <div class="font-mono text-sm leading-7">
        <div
          v-for="(line, idx) in codeLines"
          :key="idx"
          :ref="
            (el) => {
              if (el) lineRefs[idx + 1] = el as HTMLElement;
            }
          "
          @click="onLineClick(idx + 1)"
          class="group flex items-center rounded-md px-2 py-0.5 cursor-pointer select-none transition-all"
          :class="getLineClasses(idx + 1)"
        >
          <!-- Line number -->
          <span
            class="w-8 text-right pr-3 text-xs select-none"
            :class="isLineActive(idx + 1) ? 'text-cyan-400' : 'text-slate-600'"
          >
            {{ idx + 1 }}
          </span>

          <!-- Code content -->
          <span class="whitespace-pre" v-html="highlightSyntax(line)"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { useVcrStore } from "../../vcr-player/store/useVcrStore";

const vcrStore = useVcrStore();
const viewport = ref<HTMLDivElement | null>(null);
const lineRefs = ref<Record<number, HTMLElement>>({});

const codeLines = computed(() => vcrStore.code.split("\n"));

const activeLoopVars = computed(() => {
  if (!vcrStore.currentFrame) return [];
  const vars = vcrStore.currentFrame.canvasStateSnapshot.loopVariables;
  if (!vars) return [];
  return Object.entries(vars);
});

const isLineActive = (lineNum: number) => {
  if (!vcrStore.currentFrame) return false;
  return vcrStore.currentLineNumber === lineNum;
};

const isLineExecutable = (lineNum: number) => {
  return vcrStore.playbackFrames.some((f) => f.lineNumber === lineNum);
};

const getLineClasses = (lineNum: number): string => {
  if (isLineActive(lineNum)) {
    return "bg-cyan-500/10 text-cyan-100 border-l-2 border-cyan-400";
  }
  if (isLineExecutable(lineNum)) {
    return "text-slate-300 hover:bg-slate-800/50 hover:text-white";
  }
  return "text-slate-500/60";
};

const onLineClick = (lineNum: number) => {
  const targetFrameIndex = vcrStore.playbackFrames.findIndex(
    (f) => f.lineNumber === lineNum,
  );
  if (targetFrameIndex !== -1) {
    vcrStore.jumpToFrame(targetFrameIndex);
  }
};

// Simplified syntax highlighting with inline styles
const highlightSyntax = (text: string): string => {
  if (!text || text.trim() === "")
    return '<span class="text-slate-600">//</span>';

  let escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Keywords - blue
  const keywords = [
    "let",
    "var",
    "const",
    "for",
    "while",
    "if",
    "else",
    "return",
    "function",
    "class",
    "new",
  ];
  keywords.forEach((kw) => {
    escaped = escaped.replace(
      new RegExp(`\\b${kw}\\b`, "g"),
      `<span style="color: #60a5fa; font-weight: 500;">${kw}</span>`,
    );
  });

  // API functions - cyan
  const apiFuncs = ["compare", "swap", "highlight"];
  apiFuncs.forEach((fn) => {
    escaped = escaped.replace(
      new RegExp(`\\b${fn}\\b`, "g"),
      `<span style="color: #22d3ee; font-weight: 500;">${fn}</span>`,
    );
  });

  // Brackets - gray
  escaped = escaped.replace(
    /([{}()\[\]])/g,
    '<span style="color: #64748b;">$1</span>',
  );

  // Numbers - amber
  escaped = escaped.replace(
    /\b(\d+)\b/g,
    '<span style="color: #fbbf24;">$1</span>',
  );

  // Comments - gray italic
  escaped = escaped.replace(
    /(\/.*)/g,
    '<span style="color: #64748b; font-style: italic;">$1</span>',
  );

  return escaped;
};

// Auto-scroll to active line
watch(
  () => vcrStore.currentLineNumber,
  async (newLineNum) => {
    if (newLineNum <= 0) return;
    await nextTick();
    const activeEl = lineRefs.value[newLineNum];
    const viewportEl = viewport.value;
    if (activeEl && viewportEl) {
      const elTop = activeEl.offsetTop;
      const elHeight = activeEl.offsetHeight;
      const viewTop = viewportEl.scrollTop;
      const viewHeight = viewportEl.clientHeight;
      if (elTop < viewTop || elTop + elHeight > viewTop + viewHeight) {
        viewportEl.scrollTo({
          top: elTop - viewHeight / 2 + elHeight / 2,
          behavior: "smooth",
        });
      }
    }
  },
  { immediate: true },
);
</script>
