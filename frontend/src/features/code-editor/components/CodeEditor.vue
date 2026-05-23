<template>
  <div
    class="code-editor-card bg-[#0e1726]/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col gap-5 h-full"
  >
    <!-- Presets Header Tabs -->
    <div
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800"
    >
      <div class="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          class="text-cyan-400"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
        <span class="text-xs font-bold uppercase tracking-wider text-slate-300"
          >Soạn thảo thuật toán</span
        >
      </div>

      <!-- Presets Pill selectors -->
      <div class="flex gap-2">
        <button
          v-for="(tpl, key) in PRESETS"
          :key="key"
          @click="loadPreset(key)"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95"
          :class="
            activePreset === key
              ? 'bg-cyan-950/40 text-cyan-400 border-cyan-800/80'
              : 'bg-[#070b13] text-slate-400 border-slate-800 hover:text-slate-200'
          "
        >
          {{ tpl.name }}
        </button>
      </div>
    </div>

    <!-- API Reference Hints -->
    <div
      class="bg-[#070b13] rounded-xl border border-slate-800/60 p-3.5 flex flex-col gap-2.5"
    >
      <div
        class="text-[11px] font-bold uppercase tracking-widest text-slate-500"
      >
        Các hàm tương tác trực quan:
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
        <div
          class="flex flex-col gap-0.5 bg-[#090f19] p-2 rounded-lg border border-slate-800/30"
        >
          <span class="text-amber-400 font-bold">compare(i, j)</span>
          <span class="text-slate-400 font-sans text-[11px]"
            >So sánh & nhấp nháy 2 phần tử</span
          >
        </div>
        <div
          class="flex flex-col gap-0.5 bg-[#090f19] p-2 rounded-lg border border-slate-800/30"
        >
          <span class="text-rose-400 font-bold">swap(i, j)</span>
          <span class="text-slate-400 font-sans text-[11px]"
            >Hoán vị trí hai phần tử</span
          >
        </div>
        <div
          class="flex flex-col gap-0.5 bg-[#090f19] p-2 rounded-lg border border-slate-800/30"
        >
          <span class="text-emerald-400 font-bold">highlight(i)</span>
          <span class="text-slate-400 font-sans text-[11px]"
            >Đánh dấu đã xếp xong</span
          >
        </div>
      </div>
    </div>

    <!-- Main Textarea Editor Area -->
    <div
      class="flex-1 relative flex flex-col min-h-0 bg-[#070b13] rounded-xl border border-slate-800 overflow-hidden"
    >
      <div ref="editorContainer" class="w-full h-full"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import loader from "@monaco-editor/loader";
import { useVcrStore } from "../../vcr-player/store/useVcrStore";
import { MonacoLineSyncerCoordinator } from "../../algorithm-sandbox/MonacoLineSyncerCoordinator";

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
    // Gọi compare để tô sáng 2 phần tử đang được so sánh
    compare(j, j + 1);
    
    if (array[j] > array[j + 1]) {
      // Gọi swap để tráo đổi vị trí của chúng
      swap(j, j + 1);
    }
  }
  // Đánh dấu phần tử cuối cùng của lượt này đã đứng đúng chỗ
  highlight(array.length - i - 1);
}
// Đánh dấu phần tử đầu tiên đã xếp xong
highlight(0);`,
  },
  selection: {
    name: "Sắp xếp chọn (Selection Sort)",
    code: `// Thuật toán Sắp xếp chọn
for (let i = 0; i < array.length - 1; i++) {
  let minIdx = i;
  for (let j = i + 1; j < array.length; j++) {
    compare(minIdx, j);
    if (array[j] < array[minIdx]) {
      minIdx = j;
    }
  }
  if (minIdx !== i) {
    swap(i, minIdx);
  }
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
    if (array[j] < array[j - 1]) {
      swap(j - 1, j);
      j--;
    } else {
      break;
    }
  }
  for (let k = 0; k <= i; k++) {
    highlight(k);
  }
}`,
  },
};

onMounted(async () => {
  // Khởi tạo và nạp Monaco Editor
  const monaco = await loader.init();

  if (!editorContainer.value) return;

  editorInstance = monaco.editor.create(editorContainer.value, {
    value: vcrStore.code,
    language: "javascript",
    theme: "vs-dark",
    automaticLayout: true,
    fontSize: 14,
    lineNumbers: "on",
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    cursorBlinking: "smooth",
    cursorSmoothCaretAnimation: "on",
    padding: { top: 12, bottom: 12 },
    fontFamily: "JetBrains Mono, Fira Code, monospace",
    scrollbar: {
      vertical: "visible",
      horizontal: "visible",
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
    },
  });

  // Đồng bộ thay đổi code từ Monaco Editor về Pinia Store
  editorInstance.onDidChangeModelContent(() => {
    vcrStore.code = editorInstance.getValue();
  });

  // Thiết lập Monaco Line Syncer Coordinator
  syncerCoordinator = new MonacoLineSyncerCoordinator(editorInstance, vcrStore);
});

onBeforeUnmount(() => {
  if (syncerCoordinator) {
    syncerCoordinator.destroy();
  }
  if (editorInstance) {
    editorInstance.dispose();
  }
});

const loadPreset = (key: "bubble" | "selection" | "insertion") => {
  activePreset.value = key;
  const newCode = PRESETS[key].code;
  vcrStore.code = newCode;

  if (editorInstance) {
    editorInstance.setValue(newCode);
  }

  vcrStore.compileAndLoad();
};
</script>
