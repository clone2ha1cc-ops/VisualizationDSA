<template>
  <div class="pseudocode-card bg-[#0e1726]/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col h-[400px]">
    
    <!-- Card Header -->
    <div class="flex items-center justify-between pb-4 border-b border-slate-800">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300">Bộ giải mã thuật toán</h3>
      </div>
      
      <!-- Current variable watch values HUD -->
      <div class="text-[11px] font-mono text-cyan-400 flex gap-3.5 items-center">
        <span class="text-slate-500">Giám sát:</span>
        <span v-if="activeLoopVars.length === 0" class="text-slate-600 font-sans italic">Trống</span>
        <span v-for="[vName, vVal] in activeLoopVars" :key="vName" class="bg-cyan-950/40 border border-cyan-900/40 px-2 py-0.5 rounded-md">
          {{ vName }} = <strong class="text-white">{{ vVal }}</strong>
        </span>
      </div>
    </div>

    <!-- Code Block Scroll Window -->
    <div class="code-viewport flex-1 overflow-y-auto mt-4 pr-1 scrollbar-thin" ref="viewport">
      <div class="code-container font-mono text-sm leading-6 flex flex-col min-w-full w-max">
        <div 
          v-for="(line, idx) in codeLines" 
          :key="idx"
          :ref="(el) => { if (el) lineRefs[idx + 1] = el as HTMLElement; }"
          class="code-line group flex items-stretch transition-all relative border-y border-transparent"
          :class="isLineActive(idx + 1) ? 'active-line' : ''"
        >
          <!-- Neon Left Border indicator on active line -->
          <div 
            class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500 transition-opacity duration-300"
            :class="isLineActive(idx + 1) ? 'opacity-100' : 'opacity-0'"
          ></div>

          <!-- Line number gutter -->
          <div 
            class="line-gutter select-none text-right pr-4 pl-3 text-xs w-11 border-r border-slate-800/60 font-semibold transition-colors shrink-0"
            :class="isLineActive(idx + 1) ? 'text-emerald-400 bg-emerald-950/20' : 'text-slate-600 group-hover:text-slate-400'"
          >
            {{ idx + 1 }}
          </div>

          <!-- Line text content -->
          <div 
            class="line-text pl-4 pr-4 py-0.5 whitespace-pre flex-1 transition-all"
            :class="isLineActive(idx + 1) ? 'text-white font-bold bg-emerald-950/15' : 'text-slate-300 group-hover:bg-slate-800/10 group-hover:text-white'"
            v-html="highlightSyntax(line)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useVcrStore } from '../../vcr-player/store/useVcrStore';

const vcrStore = useVcrStore();
const viewport = ref<HTMLDivElement | null>(null);
const lineRefs = ref<Record<number, HTMLElement>>({});

const codeLines = computed(() => vcrStore.code.split('\n'));

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

const highlightSyntax = (text: string): string => {
  if (!text) return '&nbsp;';
  let escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const keywords = ['let', 'var', 'const', 'for', 'while', 'if', 'else', 'return', 'function', 'class'];
  escaped = escaped.replace(new RegExp(`\\b(${keywords.join('|')})\\b`, 'g'), '<span class="text-purple-400 font-bold">$1</span>');

  const controls = ['compare', 'swap', 'highlight'];
  escaped = escaped.replace(new RegExp(`\\b(${controls.join('|')})\\b`, 'g'), '<span class="text-cyan-400 font-semibold">$1</span>');

  escaped = escaped.replace(/([{}()\[\]])/g, '<span class="text-slate-500 font-bold">$1</span>');
  escaped = escaped.replace(/\b(\d+)\b/g, '<span class="text-amber-400">$1</span>');
  escaped = escaped.replace(/(\/\/.*)/g, '<span class="text-slate-500 italic">$1</span>');

  return escaped;
};

watch(() => vcrStore.currentLineNumber, async (newLineNum) => {
  if (newLineNum <= 0) return;
  await nextTick();
  const activeEl = lineRefs.value[newLineNum];
  const viewportEl = viewport.value;
  if (activeEl && viewportEl) {
    const elTop = activeEl.offsetTop;
    const elHeight = activeEl.offsetHeight;
    const viewTop = viewportEl.scrollTop;
    const viewHeight = viewportEl.clientHeight;
    if (elTop < viewTop || (elTop + elHeight) > (viewTop + viewHeight)) {
      viewportEl.scrollTo({ top: elTop - viewHeight / 2 + elHeight / 2, behavior: 'smooth' });
    }
  }
}, { immediate: true });
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 9999px; }
.scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #334155; }

.active-line {
  box-shadow: inset 2px 0 0 0 #10b981;
  background-color: rgba(16, 185, 129, 0.05);
}
</style>
