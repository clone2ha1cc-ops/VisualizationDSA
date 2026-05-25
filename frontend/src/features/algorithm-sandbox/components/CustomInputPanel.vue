<template>
  <div class="custom-input-panel bg-[#0e1726]/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-slate-800 pb-4">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-amber-500">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
        <span class="text-xs font-bold uppercase tracking-wider text-slate-300">Dữ liệu tùy biến & Sân chơi</span>
      </div>
      <div class="flex gap-1.5">
        <button
          @click="activeTab = 'input'"
          class="px-3 py-1 rounded-lg text-[11px] font-bold uppercase transition-all duration-300 cursor-pointer"
          :class="activeTab === 'input' ? 'text-amber-400 bg-amber-950/40 border border-amber-800/40 shadow-[0_0_8px_rgba(245,158,11,0.15)]' : 'text-slate-400 hover:text-slate-200 border border-transparent'"
        >
          Nạp Dữ Liệu
        </button>
        <button
          @click="activeTab = 'playground'"
          class="px-3 py-1 rounded-lg text-[11px] font-bold uppercase transition-all duration-300 cursor-pointer"
          :class="activeTab === 'playground' ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 shadow-[0_0_8px_rgba(6,182,212,0.15)]' : 'text-slate-400 hover:text-slate-200 border border-transparent'"
        >
          Đồ thị Playground
        </button>
      </div>
    </div>

    <!-- TAB 1: TEXT DATA INPUT -->
    <TextDataInput
      v-if="activeTab === 'input'"
      v-model:arrayInputText="arrayInputText"
      v-model:graphInputText="graphInputText"
      :arrayError="arrayError"
      :graphError="graphError"
      :parsedArray="parsedArray"
      :parsedGraphNodes="parsedGraphNodes"
      :parsedGraphEdges="parsedGraphEdges"
      @loadArray="loadArrayToVisualizer"
    />

    <!-- TAB 2: INTERACTIVE CANVAS PLAYGROUND -->
    <GraphPlayground
      v-else
      ref="playgroundRef"
      v-model:graphInputText="graphInputText"
      :parsedGraphNodes="parsedGraphNodes"
      :parsedGraphEdges="parsedGraphEdges"
      @validateGraph="validateGraph"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useVcrStore } from "../../vcr-player/store/useVcrStore";
import { useInputValidation } from "../composables/useInputValidation";
import TextDataInput from "./TextDataInput.vue";
import GraphPlayground from "./GraphPlayground.vue";

const vcrStore = useVcrStore();
const activeTab = ref<"input" | "playground">("input");
const playgroundRef = ref<InstanceType<typeof GraphPlayground> | null>(null);

const {
  arrayInputText,
  parsedArray,
  arrayError,
  graphInputText,
  parsedGraphNodes,
  parsedGraphEdges,
  graphError,
  validateArray,
  validateGraph,
} = useInputValidation();

onMounted(() => {
  arrayInputText.value = vcrStore.rawInputArray;
  validateArray();
  validateGraph();
});

watch(arrayInputText, () => validateArray());
watch(graphInputText, () => validateGraph());

const loadArrayToVisualizer = () => {
  validateArray();
  if (!arrayError.value) {
    vcrStore.rawInputArray = arrayInputText.value;
    vcrStore.compileAndLoad();
  }
};

watch(activeTab, (newTab) => {
  if (newTab === "playground") {
    setTimeout(() => {
      playgroundRef.value?.resizeCanvas();
      playgroundRef.value?.syncTextToPlayground();
    }, 50);
  }
});
</script>
