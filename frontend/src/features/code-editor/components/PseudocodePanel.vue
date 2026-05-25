<template>
  <div class="h-full flex flex-col bg-slate-900/50">
    <!-- Variables HUD -->
    <VariablesHud :activeLoopVars="activeLoopVars" />

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
import { computed } from "vue";
import { useVcrStore } from "../../vcr-player/store/useVcrStore";
import { highlightSyntax } from "../helpers/highlightHelper";
import { usePseudocodeScroller } from "../composables/usePseudocodeScroller";
import VariablesHud from "./VariablesHud.vue";

const vcrStore = useVcrStore();
const { viewport, lineRefs } = usePseudocodeScroller();

const codeLines = computed(() => vcrStore.code.split("\n"));

const activeLoopVars = computed(() => {
  if (!vcrStore.currentFrame) return [];
  const vars = vcrStore.currentFrame.canvasStateSnapshot.loopVariables;
  if (!vars) return [];
  return Object.entries(vars) as [string, any][];
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
    (f) => f.lineNumber === lineNum
  );
  if (targetFrameIndex !== -1) {
    vcrStore.jumpToFrame(targetFrameIndex);
  }
};
</script>
