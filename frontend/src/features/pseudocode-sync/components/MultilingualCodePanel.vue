<template>
  <div class="code-panel-card">
    <!-- Language Selector Tabs -->
    <div class="language-selector-tabs" v-if="availableLanguages.length > 0">
      <button
        v-for="lang in availableLanguages"
        :key="lang"
        @click="pseudocodeStore.changeLanguage(lang)"
        class="language-tab-btn"
        :class="{ 'active-tab': pseudocodeStore.selectedLanguage === lang }"
      >
        {{ languageLabels[lang] }}
      </button>
    </div>

    <!-- Code Lines Viewport -->
    <div class="code-lines-viewport" ref="viewport" @keydown="onKeyDown" tabindex="0">
      <div
        v-for="line in activeCodeLines"
        :key="line.lineNumber"
        :ref="(el) => { if (el) lineRefs[line.lineNumber] = el as HTMLElement }"
        @click="onLineClick(line)"
        class="code-line-row"
        :class="{
          'active-executing-line': line.lineNumber === activePhysicalLine,
          'executable-line': isLineExecutable(line.logicalId) && line.lineNumber !== activePhysicalLine,
          'non-executable-line': !isLineExecutable(line.logicalId) && line.logicalId === 'NO_ACTION',
        }"
      >
        <!-- Line Number -->
        <span class="line-number-gutter">{{ line.lineNumber }}</span>

        <!-- Code Text -->
        <span class="code-text" v-html="highlightSyntax(line.text)"></span>

        <!-- Occurrence Badge -->
        <span
          v-if="isLineExecutable(line.logicalId) && line.logicalId !== 'NO_ACTION' && getOccurrenceTotal(line.logicalId) > 1"
          class="occurrence-badge"
        >
          {{ getOccurrenceCurrent(line.logicalId) }}/{{ getOccurrenceTotal(line.logicalId) }}
        </span>
      </div>

      <p v-if="activeCodeLines.length === 0" class="empty-placeholder">
        Chưa có mã nguồn. Hãy chọn thuật toán và nhấn Visualize.
      </p>
    </div>

    <!-- Watch Panel (inline below code lines) -->
    <VariableWatchPanel />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { usePseudocodeStore } from '../store/usePseudocodeStore';
import VariableWatchPanel from './VariableWatchPanel.vue';
import type { CodeLine, SupportedLanguage } from '../types/pseudocode.types';

const pseudocodeStore = usePseudocodeStore();
const viewport = ref<HTMLDivElement | null>(null);
const lineRefs = ref<Record<number, HTMLElement>>({});

const languageLabels: Record<SupportedLanguage, string> = {
  cpp: 'C++',
  java: 'Java',
  python: 'Python',
  javascript: 'JavaScript',
};

const availableLanguages = computed(() => pseudocodeStore.availableLanguages);
const activeCodeLines = computed(() => pseudocodeStore.activeCodeLines);
const activePhysicalLine = computed(() => pseudocodeStore.activePhysicalLineNumber);

function isLineExecutable(logicalId: string): boolean {
  return logicalId !== 'NO_ACTION';
}

function getOccurrenceTotal(logicalId: string): number {
  return pseudocodeStore.getOccurrenceInfo(logicalId).total;
}

function getOccurrenceCurrent(logicalId: string): number {
  return pseudocodeStore.getOccurrenceInfo(logicalId).current;
}

function onLineClick(line: CodeLine): void {
  if (line.logicalId === 'NO_ACTION') return;
  pseudocodeStore.snapToNextOccurrence(line.logicalId);
}

function onKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Tab') {
    event.preventDefault();
    pseudocodeStore.cycleLanguage();
  }
}

function highlightSyntax(text: string): string {
  if (!text || text.trim() === '') return '<span class="text-slate-600">//</span>';

  let escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const keywords = [
    'void', 'int', 'for', 'if', 'else', 'return', 'function', 'let', 'const', 'var',
    'def', 'in', 'range', 'len', 'class', 'new', 'while', 'public', 'private',
  ];
  keywords.forEach((kw) => {
    escaped = escaped.replace(
      new RegExp(`\\b${kw}\\b`, 'g'),
      `<span style="color: #60a5fa; font-weight: 500;">${kw}</span>`,
    );
  });

  const apiFuncs = ['swap', 'bubble_sort', 'bubbleSort', 'print', 'println'];
  apiFuncs.forEach((fn) => {
    escaped = escaped.replace(
      new RegExp(`\\b${fn}\\b`, 'g'),
      `<span style="color: #22d3ee; font-weight: 500;">${fn}</span>`,
    );
  });

  escaped = escaped.replace(
    /([{}()\[\]:;])/g,
    '<span style="color: #64748b;">$1</span>',
  );

  escaped = escaped.replace(
    /\b(\d+)\b/g,
    '<span style="color: #fbbf24;">$1</span>',
  );

  escaped = escaped.replace(
    /(\/\/.*|#.*)/g,
    '<span style="color: #64748b; font-style: italic;">$1</span>',
  );

  return escaped;
}

watch(
  () => pseudocodeStore.activePhysicalLineNumber,
  async (newLineNum) => {
    if (!newLineNum || newLineNum <= 0) return;
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
          behavior: 'smooth',
        });
      }
    }
  },
);
</script>

<style scoped>
.code-panel-card {
  display: flex;
  flex-direction: column;
  background: rgba(30, 41, 59, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  height: 100%;
}

.language-selector-tabs {
  display: flex;
  background: rgba(15, 23, 42, 0.6);
  padding: 4px;
  border-radius: 14px;
  margin: 10px 12px 0;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.language-tab-btn {
  flex: 1;
  padding: 6px 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.language-tab-btn.active-tab {
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
}

.code-lines-viewport {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
  background: rgba(15, 23, 42, 0.2);
  outline: none;
}

.code-line-row {
  display: flex;
  align-items: flex-start;
  padding: 4px 14px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #94a3b8;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.code-line-row:hover {
  background: rgba(255, 255, 255, 0.02);
  color: #e2e8f0;
}

.code-line-row.non-executable-line {
  cursor: default;
  color: #475569;
}

.code-line-row.executable-line {
  color: #94a3b8;
}

.code-line-row.executable-line:hover {
  background: rgba(255, 255, 255, 0.04);
  color: #e2e8f0;
}

.line-number-gutter {
  width: 24px;
  text-align: right;
  margin-right: 12px;
  color: #475569;
  user-select: none;
  font-size: 10px;
  flex-shrink: 0;
}

.code-text {
  white-space: pre;
  flex: 1;
}

.code-line-row.active-executing-line {
  background: rgba(16, 185, 129, 0.12);
  color: #34d399;
  border-left-color: #10b981;
  font-weight: 500;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

.code-line-row.active-executing-line .line-number-gutter {
  color: #10b981;
}

.occurrence-badge {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: #64748b;
  background: rgba(30, 41, 59, 0.6);
  padding: 1px 5px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.empty-placeholder {
  color: #64748b;
  font-style: italic;
  padding: 16px;
  font-size: 12px;
}
</style>
