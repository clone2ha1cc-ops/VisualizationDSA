<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between text-xs text-slate-400">
      <span class="font-medium">Nhấp đúp chuột để thêm đỉnh. Click 2 đỉnh liên tiếp để nối cạnh.</span>
      <button
        @click="clearPlayground"
        class="text-[10px] font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 bg-rose-950/20 border border-rose-900/40 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
      >
        Xoá hết
      </button>
    </div>

    <!-- Canvas Container -->
    <div class="relative w-full h-[250px] bg-[#070b13] rounded-xl border border-slate-800 overflow-hidden" ref="canvasContainer">
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_0.5px,transparent_0.5px),linear-gradient(to_bottom,#1e293b_0.5px,transparent_0.5px)] bg-[size:2rem_2rem] opacity-10 pointer-events-none"></div>

      <canvas
        ref="playgroundCanvas"
        class="w-full h-full block"
        :class="isDraggingVertex ? 'cursor-grabbing' : draggedVertexId ? 'cursor-grab' : 'cursor-crosshair'"
        @dblclick="onCanvasDoubleClick"
        @mousedown="onCanvasMouseDown"
        @mousemove="onCanvasMouseMove"
        @mouseup="onCanvasMouseUp"
        @mouseleave="onCanvasMouseUp"
      ></canvas>

      <svg v-if="draggingEdge" class="absolute inset-0 pointer-events-none w-full h-full">
        <path
          :d="getBezierPath(draggingEdge.x1, draggingEdge.y1, draggingEdge.x2, draggingEdge.y2)"
          stroke="rgba(6, 182, 212, 0.7)"
          stroke-width="3"
          stroke-dasharray="4"
          class="animate-[dash_1s_linear_infinite]"
          fill="none"
        />
      </svg>
    </div>

    <!-- HUD Details -->
    <div class="flex flex-col gap-3 bg-[#070b13]/55 border border-slate-800/80 p-3 rounded-xl">
      <div class="flex justify-between items-center">
        <div class="text-[11px] font-mono flex gap-3 text-slate-400">
          <span>Đỉnh (Vertices): <strong class="text-white">{{ vertices.length }}</strong></span>
          <span>Cạnh (Edges): <strong class="text-white">{{ edges.length }}</strong></span>
        </div>
        <button
          @click="toggleAutoLayout"
          class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
          :class="isAutoLayout ? 'text-emerald-400 bg-emerald-950/30 border border-emerald-800/40' : 'text-cyan-400 bg-cyan-950/20 border border-cyan-800/30 hover:bg-cyan-950/40'"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="isAutoLayout ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'"></span>
          {{ isAutoLayout ? "Auto Layout: ON" : "Auto Layout: OFF" }}
        </button>
      </div>

      <div v-if="selectedVertexId && !isDraggingVertex" class="text-[11px] font-bold text-amber-500 animate-pulse flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,1)]"></span>
        <span>Đang chọn đỉnh: {{ selectedVertexId }} (Click đỉnh khác để nối cạnh, hoặc kéo để di chuyển)</span>
      </div>
      <div v-else-if="isDraggingVertex" class="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
        <span>Đang kéo đỉnh: {{ draggedVertexId }}</span>
      </div>
      <div v-else class="text-[10px] text-slate-500 font-medium">
        Double-click: Tạo đỉnh | Click: Chọn/Nối | Kéo: Di chuyển
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, watch } from 'vue';
import { useGraphPlayground } from '../composables/useGraphPlayground';

const props = defineProps<{
  graphInputText: string;
  parsedGraphNodes: Array<{ id: string }>;
  parsedGraphEdges: Array<{ sourceId: string; targetId: string; weight: number }>;
}>();

const emit = defineEmits<{
  (e: 'update:graphInputText', val: string): void;
  (e: 'validateGraph'): void;
}>();

const playgroundCanvas = ref<HTMLCanvasElement | null>(null);
const canvasContainer = ref<HTMLDivElement | null>(null);

const { graphInputText, parsedGraphNodes, parsedGraphEdges } = toRefs(props);

const graphInputTextRef = ref(props.graphInputText);
watch(() => props.graphInputText, (newVal) => {
  graphInputTextRef.value = newVal;
});
watch(graphInputTextRef, (newVal) => {
  emit('update:graphInputText', newVal);
});

const {
  vertices,
  edges,
  selectedVertexId,
  draggingEdge,
  isDraggingVertex,
  draggedVertexId,
  isAutoLayout,
  syncTextToPlayground,
  clearPlayground,
  resizeCanvas,
  onCanvasDoubleClick,
  onCanvasMouseDown,
  onCanvasMouseMove,
  onCanvasMouseUp,
  toggleAutoLayout,
  getBezierPath,
} = useGraphPlayground(
  playgroundCanvas,
  canvasContainer,
  graphInputTextRef,
  parsedGraphNodes,
  parsedGraphEdges,
  () => emit('validateGraph')
);

defineExpose({
  resizeCanvas,
  syncTextToPlayground,
});
</script>

<style scoped>
@keyframes dash {
  to {
    stroke-dashoffset: -40;
  }
}
</style>
