<template>
  <div class="code-editor-card bg-[#0e1726]/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col gap-5 h-full">
    <CodeEditorPresetTabs
      :presets="PRESETS"
      :active-preset="activePreset"
      @select="loadPreset"
    />
    <CodeEditorApiHints />
    <div class="flex-1 relative flex flex-col min-h-0 bg-[#070b13] rounded-xl border border-slate-800 overflow-hidden">
      <div ref="editorContainer" class="w-full h-full"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import loader from "@monaco-editor/loader";
import { useVcrStore } from "../../vcr-player/store/useVcrStore";
import { MonacoLineSyncerCoordinator } from "../../algorithm-sandbox/MonacoLineSyncerCoordinator";
import CodeEditorPresetTabs from "./CodeEditorPresetTabs.vue";
import CodeEditorApiHints from "./CodeEditorApiHints.vue";

const vcrStore = useVcrStore();
const editorContainer = ref<HTMLDivElement | null>(null);
let editorInstance: any = null;
let syncerCoordinator: MonacoLineSyncerCoordinator | null = null;

const activePreset = ref<"bubble" | "selection" | "insertion">("bubble");

const PRESETS = {
  bubble: {
    name: "Sắp xếp nổi bọt (Bubble Sort)",
    code: `// Thuật toán Sắp xếp nổi bọt
for (let i = 0; i < array.length - 1; i++) {
  for (let j = 0; j < array.length - i - 1; j++) {
    compare(j, j + 1);
    if (array[j] > array[j + 1]) {
      swap(j, j + 1);
    }
  }
  highlight(array.length - i - 1);
}
highlight(0);`,
  },
  selection: {
    name: "Sắp xếp chọn (Selection Sort)",
    code: `// Thuật toán Sắp xếp chọn
for (let i = 0; i < array.length - 1; i++) {
  let minIdx = i;
  for (let j = i + 1; j < array.length; j++) {
    compare(minIdx, j);
    if (array[j] < array[minIdx]) { minIdx = j; }
  }
  if (minIdx !== i) { swap(i, minIdx); }
  highlight(i);
}
highlight(array.length - 1);`,
  },
  insertion: {
    name: "Sắp xếp chèn (Insertion Sort)",
    code: `// Thuật toán Sắp xếp chèn
highlight(0);
for (let i = 1; i < array.length; i++) {
  let j = i;
  while (j > 0) {
    compare(j - 1, j);
    if (array[j] < array[j - 1]) { swap(j - 1, j); j--; }
    else { break; }
  }
  for (let k = 0; k <= i; k++) { highlight(k); }
}`,
  },
};

onMounted(async () => {
  const monaco = await loader.init();
  if (!editorContainer.value) return;
  editorInstance = monaco.editor.create(editorContainer.value, {
    value: vcrStore.code, language: "javascript", theme: "vs-dark",
    automaticLayout: true, fontSize: 14, lineNumbers: "on",
    minimap: { enabled: false }, scrollBeyondLastLine: false,
    cursorBlinking: "smooth", cursorSmoothCaretAnimation: "on",
    padding: { top: 12, bottom: 12 },
    fontFamily: "JetBrains Mono, Fira Code, monospace",
    scrollbar: { vertical: "visible", horizontal: "visible", verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
  });
  editorInstance.onDidChangeModelContent(() => { vcrStore.code = editorInstance.getValue(); });
  syncerCoordinator = new MonacoLineSyncerCoordinator(editorInstance, vcrStore);
});

onBeforeUnmount(() => {
  syncerCoordinator?.destroy();
  editorInstance?.dispose();
});

function loadPreset(key: "bubble" | "selection" | "insertion"): void {
  activePreset.value = key;
  const newCode = PRESETS[key].code;
  vcrStore.code = newCode;
  editorInstance?.setValue(newCode);
  vcrStore.compileAndLoad();
}
</script>
