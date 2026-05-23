<template>
  <div
    class="custom-input-panel bg-[#0e1726]/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col gap-5"
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between border-b border-slate-800 pb-4"
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
          class="text-amber-500"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
        <span class="text-xs font-bold uppercase tracking-wider text-slate-300"
          >Dữ liệu tùy biến & Sân chơi</span
        >
      </div>
      <div class="flex gap-1.5">
        <button
          @click="activeTab = 'input'"
          class="px-3 py-1 rounded-lg text-[11px] font-bold uppercase transition-all duration-300"
          :class="
            activeTab === 'input'
              ? 'text-amber-400 bg-amber-950/40 border border-amber-800/40 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          "
        >
          Nạp Dữ Liệu
        </button>
        <button
          @click="activeTab = 'playground'"
          class="px-3 py-1 rounded-lg text-[11px] font-bold uppercase transition-all duration-300"
          :class="
            activeTab === 'playground'
              ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          "
        >
          Đồ thị Playground
        </button>
      </div>
    </div>

    <!-- TAB 1: TEXT DATA INPUT -->
    <div v-if="activeTab === 'input'" class="flex flex-col gap-4">
      <!-- Input Array Section -->
      <div class="flex flex-col gap-2">
        <label
          class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between"
        >
          <span>Mảng Số Tự Chọn (Array Input)</span>
          <span class="text-[10px] text-slate-500 font-normal"
            >Tối đa 20 phần tử, cách nhau bằng dấu phẩy</span
          >
        </label>
        <div class="flex gap-2">
          <input
            type="text"
            v-model="arrayInputText"
            @input="onArrayInput"
            placeholder="Ví dụ: 12, 5, 8, 20"
            class="flex-1 bg-[#070b13] border border-slate-700/80 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs font-mono text-white outline-none transition-all"
          />
          <button
            @click="loadArrayToVisualizer"
            :disabled="!!arrayError"
            class="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold text-xs rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
          >
            <span>Nạp Mảng</span>
          </button>
        </div>
        <div v-if="arrayError" class="text-[11px] font-mono text-rose-400 mt-1">
          ⚠️ {{ arrayError }}
        </div>
        <div
          v-else-if="parsedArray.length > 0"
          class="text-[11px] font-mono text-emerald-400 mt-1 flex items-center gap-1.5"
        >
          <span>🟢 Mảng hợp lệ:</span>
          <span
            class="bg-[#070b13] px-2 py-0.5 rounded border border-slate-800 text-slate-200"
          >
            [ {{ parsedArray.join(", ") }} ]
          </span>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px bg-slate-800"></div>

      <!-- Graph Adjacency List Section -->
      <div class="flex flex-col gap-2">
        <label
          class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between"
        >
          <span>Đường nối Đồ thị (Adjacency List)</span>
          <span class="text-[10px] text-slate-500 font-normal"
            >Định dạng: Source-Target:Weight</span
          >
        </label>
        <textarea
          v-model="graphInputText"
          @input="onGraphInput"
          placeholder="Ví dụ: A-B:10, B-C:20, A-C:50"
          rows="2"
          class="w-full bg-[#070b13] border border-slate-700/80 focus:border-cyan-500 rounded-xl p-3 text-xs font-mono text-white placeholder-slate-600 outline-none transition-all resize-none"
        ></textarea>
        <div v-if="graphError" class="text-[11px] font-mono text-rose-400 mt-1">
          ⚠️ {{ graphError }}
        </div>
        <div
          v-else-if="parsedGraphNodes.length > 0"
          class="text-[11px] font-mono text-cyan-400 mt-1"
        >
          🟢 Đồ thị hợp lệ: <strong>{{ parsedGraphNodes.length }}</strong> đỉnh,
          <strong>{{ parsedGraphEdges.length }}</strong> liên kết.
        </div>
      </div>
    </div>

    <!-- TAB 2: INTERACTIVE CANVAS PLAYGROUND -->
    <div v-else class="flex flex-col gap-4">
      <div class="flex items-center justify-between text-xs text-slate-400">
        <span class="font-medium"
          >Nhấp đúp chuột để thêm đỉnh. Click 2 đỉnh liên tiếp để nối
          cạnh.</span
        >
        <button
          @click="clearPlayground"
          class="text-[10px] font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 bg-rose-950/20 border border-rose-900/40 px-2.5 py-1 rounded-lg transition-all"
        >
          Xoá hết
        </button>
      </div>

      <!-- Playground Canvas Container -->
      <div
        class="relative w-full h-[250px] bg-[#070b13] rounded-xl border border-slate-800 overflow-hidden"
        ref="canvasContainer"
      >
        <!-- Background Grid -->
        <div
          class="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_0.5px,transparent_0.5px),linear-gradient(to_bottom,#1e293b_0.5px,transparent_0.5px)] bg-[size:2rem_2rem] opacity-10 pointer-events-none"
        ></div>

        <canvas
          ref="playgroundCanvas"
          class="w-full h-full block"
          :class="
            isDraggingVertex
              ? 'cursor-grabbing'
              : draggedVertexId
                ? 'cursor-grab'
                : 'cursor-crosshair'
          "
          @dblclick="onCanvasDoubleClick"
          @mousedown="onCanvasMouseDown"
          @mousemove="onCanvasMouseMove"
          @mouseup="onCanvasMouseUp"
          @mouseleave="onCanvasMouseUp"
        ></canvas>

        <!-- Bezier feedback overlay (glowing SVG) -->
        <svg
          v-if="draggingEdge"
          class="absolute inset-0 pointer-events-none w-full h-full"
        >
          <path
            :d="
              getBezierPath(
                draggingEdge.x1,
                draggingEdge.y1,
                draggingEdge.x2,
                draggingEdge.y2,
              )
            "
            stroke="rgba(6, 182, 212, 0.7)"
            stroke-width="3"
            stroke-dasharray="4"
            class="animate-[dash_1s_linear_infinite]"
            fill="none"
          />
        </svg>
      </div>

      <!-- Graph details HUD -->
      <!-- Graph details HUD + Controls -->
      <div
        class="flex flex-col gap-3 bg-[#070b13]/55 border border-slate-800/80 p-3 rounded-xl"
      >
        <div class="flex justify-between items-center">
          <div class="text-[11px] font-mono flex gap-3 text-slate-400">
            <span
              >Đỉnh (Vertices):
              <strong class="text-white">{{ vertices.length }}</strong></span
            >
            <span
              >Cạnh (Edges):
              <strong class="text-white">{{ edges.length }}</strong></span
            >
          </div>
          <button
            @click="toggleAutoLayout"
            class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
            :class="
              isAutoLayout
                ? 'text-emerald-400 bg-emerald-950/30 border border-emerald-800/40'
                : 'text-cyan-400 bg-cyan-950/20 border border-cyan-800/30 hover:bg-cyan-950/40'
            "
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              :class="
                isAutoLayout ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'
              "
            ></span>
            {{ isAutoLayout ? "Auto Layout: ON" : "Auto Layout: OFF" }}
          </button>
        </div>

        <div
          v-if="selectedVertexId && !isDraggingVertex"
          class="text-[11px] font-bold text-amber-500 animate-pulse flex items-center gap-1"
        >
          <span
            class="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,1)]"
          ></span>
          <span
            >Đang chọn đỉnh: {{ selectedVertexId }} (Click đỉnh khác để nối
            cạnh, hoặc kéo để di chuyển)</span
          >
        </div>
        <div
          v-else-if="isDraggingVertex"
          class="text-[11px] font-bold text-cyan-400 flex items-center gap-1"
        >
          <span
            class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"
          ></span>
          <span>Đang kéo đỉnh: {{ draggedVertexId }}</span>
        </div>
        <div v-else class="text-[10px] text-slate-500 font-medium">
          Double-click: Tạo đỉnh | Click: Chọn/Nối | Kéo: Di chuyển
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useVcrStore } from "../../vcr-player/store/useVcrStore";
import {
  CustomInputParser,
  InteractivePlaygroundEngine,
  type Vertex,
} from "../CustomInputParser";
import {
  ForceDirectedLayout,
  type GraphNode,
  type GraphEdge,
} from "../ForceDirectedLayout";

const vcrStore = useVcrStore();

const activeTab = ref<"input" | "playground">("input");

// Tab 1 state
const arrayInputText = ref<string>("45, 12, 85, 32, 9, 60");
const parsedArray = ref<number[]>([]);
const arrayError = ref<string | null>(null);

const graphInputText = ref<string>("A-B:10, B-C:20, A-C:50");
const parsedGraphNodes = ref<Array<{ id: string }>>([]);
const parsedGraphEdges = ref<
  Array<{ sourceId: string; targetId: string; weight: number }>
>([]);
const graphError = ref<string | null>(null);

// Tab 2 playground state
const playgroundCanvas = ref<HTMLCanvasElement | null>(null);
const canvasContainer = ref<HTMLDivElement | null>(null);
const vertices = ref<Vertex[]>([]);
const edges = ref<
  Array<{ sourceId: string; targetId: string; weight: number }>
>([]);
const selectedVertexId = ref<string | null>(null);

// Mouse drag state for line drawing
const draggingEdge = ref<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
} | null>(null);

// Drag & drop state for vertices
const isDraggingVertex = ref(false);
const draggedVertexId = ref<string | null>(null);
const dragOffset = ref({ x: 0, y: 0 });

// Force-directed layout
const forceLayout = new ForceDirectedLayout({
  kRepulsion: 500,
  kAttraction: 0.08,
  idealLength: 100,
  damping: 0.9,
});
const isAutoLayout = ref(false);
let layoutAnimationId: number | null = null;

let playgroundEngine: InteractivePlaygroundEngine | null = null;
let animationFrameId: number | null = null;

// Initialize parsed values from store
onMounted(() => {
  arrayInputText.value = vcrStore.rawInputArray;
  validateArray();
  validateGraph();

  playgroundEngine = new InteractivePlaygroundEngine((newVertices) => {
    vertices.value = newVertices;
  });

  // Load initial graph vertices & edges from text
  syncTextToPlayground();

  // Run render loop for playground
  startPlaygroundLoop();
});

onBeforeUnmount(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
  cleanupLayout();
});

// Watch tab switch to resize canvas correctly
watch(activeTab, (newTab) => {
  if (newTab === "playground") {
    setTimeout(() => {
      resizeCanvas();
      syncTextToPlayground();
    }, 50);
  }
});

// ─── VALIDATION ──────────────────────────────────────────────────────────────
const validateArray = () => {
  try {
    arrayError.value = null;
    parsedArray.value = CustomInputParser.parseNumberArray(
      arrayInputText.value,
    );
  } catch (err: any) {
    arrayError.value = err.message;
    parsedArray.value = [];
  }
};

const validateGraph = () => {
  try {
    graphError.value = null;
    const graph = CustomInputParser.parseAdjacencyList(graphInputText.value);
    parsedGraphNodes.value = graph.nodes;
    parsedGraphEdges.value = graph.edges;
  } catch (err: any) {
    graphError.value = err.message;
    parsedGraphNodes.value = [];
    parsedGraphEdges.value = [];
  }
};

const onArrayInput = () => {
  validateArray();
};

const onGraphInput = () => {
  validateGraph();
  syncTextToPlayground();
};

const loadArrayToVisualizer = () => {
  validateArray();
  if (!arrayError.value) {
    vcrStore.rawInputArray = arrayInputText.value;
    vcrStore.compileAndLoad();
  }
};

// ─── PLAYGROUND SYNC & OPERATIONS ──────────────────────────────────────────
const syncTextToPlayground = () => {
  if (graphError.value || !playgroundEngine) return;

  // Clear and reconstruct engine vertices
  playgroundEngine.clear();

  // Arrange vertices in a circle by default
  const numNodes = parsedGraphNodes.value.length;
  if (numNodes === 0) {
    edges.value = [];
    return;
  }

  const cx = 150;
  const cy = 125;
  const radius = 80;

  parsedGraphNodes.value.forEach((_, idx) => {
    const angle = (idx * 2 * Math.PI) / numNodes;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    // Directly push to engine to rebuild
    playgroundEngine?.handleDoubleClick(x, y);
  });

  edges.value = parsedGraphEdges.value.map((e) => ({
    sourceId: e.sourceId,
    targetId: e.targetId,
    weight: e.weight,
  }));
};

const syncPlaygroundToText = () => {
  if (vertices.value.length === 0) {
    graphInputText.value = "";
    validateGraph();
    return;
  }

  // Construct adjacency list string
  const tokens = edges.value.map(
    (e) => `${e.sourceId}-${e.targetId}:${e.weight}`,
  );
  graphInputText.value = tokens.join(", ");
  validateGraph();
};

const clearPlayground = () => {
  playgroundEngine?.clear();
  edges.value = [];
  selectedVertexId.value = null;
  draggingEdge.value = null;
  syncPlaygroundToText();
};

// ─── CANVAS MOUSE HANDLERS ───────────────────────────────────────────────────
const resizeCanvas = () => {
  const c = playgroundCanvas.value;
  const containerEl = canvasContainer.value;
  if (!c || !containerEl) return;
  c.width = containerEl.clientWidth;
  c.height = containerEl.clientHeight;
};

const onCanvasDoubleClick = (e: MouseEvent) => {
  const c = playgroundCanvas.value;
  if (!c || !playgroundEngine) return;
  const rect = c.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  playgroundEngine.handleDoubleClick(x, y);
  syncPlaygroundToText();
};

const findVertexAt = (x: number, y: number): Vertex | null => {
  return vertices.value.find((v) => Math.hypot(v.x - x, v.y - y) < 22) || null;
};

const onCanvasMouseDown = (e: MouseEvent) => {
  const c = playgroundCanvas.value;
  if (!c || !playgroundEngine) return;
  const rect = c.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const clickedVertex = findVertexAt(x, y);
  if (clickedVertex) {
    // Bắt đầu kéo thả nếu đã chọn đỉnh này trước đó
    if (selectedVertexId.value === clickedVertex.id) {
      isDraggingVertex.value = true;
      draggedVertexId.value = clickedVertex.id;
      dragOffset.value = {
        x: x - clickedVertex.x,
        y: y - clickedVertex.y,
      };
      // Tạm dừng auto layout khi đang kéo
      if (isAutoLayout.value) {
        stopLayoutLoop();
      }
      return;
    }

    if (selectedVertexId.value === null) {
      // Select first vertex
      selectedVertexId.value = clickedVertex.id;
      playgroundEngine.selectVertex(clickedVertex.id);
    } else if (selectedVertexId.value === clickedVertex.id) {
      // Deselect
      selectedVertexId.value = null;
      playgroundEngine.selectVertex("");
    } else {
      // Connect first vertex to this second vertex
      const source = selectedVertexId.value;
      const target = clickedVertex.id;

      // Prevent duplicates
      const exists = edges.value.some(
        (edge) =>
          (edge.sourceId === source && edge.targetId === target) ||
          (edge.sourceId === target && edge.targetId === source),
      );

      if (!exists) {
        edges.value.push({ sourceId: source, targetId: target, weight: 10 });
        syncPlaygroundToText();
      }

      selectedVertexId.value = null;
      playgroundEngine.selectVertex("");
    }
  } else {
    selectedVertexId.value = null;
    playgroundEngine.selectVertex("");
  }
};

const onCanvasMouseMove = (e: MouseEvent) => {
  const c = playgroundCanvas.value;
  if (!c) return;
  const rect = c.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Xử lý kéo thả vertex
  if (isDraggingVertex.value && draggedVertexId.value) {
    const vertex = vertices.value.find((v) => v.id === draggedVertexId.value);
    if (vertex) {
      vertex.x = x - dragOffset.value.x;
      vertex.y = y - dragOffset.value.y;
      // Giới hạn trong bounds của canvas
      vertex.x = Math.max(20, Math.min(c.width - 20, vertex.x));
      vertex.y = Math.max(20, Math.min(c.height - 20, vertex.y));
    }
    return;
  }

  // Xử lý vẽ edge preview khi đã chọn vertex
  if (selectedVertexId.value) {
    const startVertex = vertices.value.find(
      (v) => v.id === selectedVertexId.value,
    );
    if (startVertex) {
      draggingEdge.value = {
        x1: startVertex.x,
        y1: startVertex.y,
        x2: x,
        y2: y,
      };
    }
  }
};

const onCanvasMouseUp = () => {
  draggingEdge.value = null;

  // Kết thúc kéo thả
  if (isDraggingVertex.value) {
    isDraggingVertex.value = false;
    draggedVertexId.value = null;
    syncPlaygroundToText();

    // Khởi động lại auto layout nếu đang bật
    if (isAutoLayout.value) {
      startLayoutLoop();
    }
  }
};

// ─── FORCE-DIRECTED LAYOUT ───────────────────────────────────────────────────
const toggleAutoLayout = () => {
  isAutoLayout.value = !isAutoLayout.value;
  if (isAutoLayout.value) {
    startLayoutLoop();
  } else {
    stopLayoutLoop();
  }
};

const startLayoutLoop = () => {
  if (layoutAnimationId !== null) return;

  const runLayout = () => {
    if (vertices.value.length < 2 || edges.value.length === 0) {
      layoutAnimationId = requestAnimationFrame(runLayout);
      return;
    }

    // Chuyển đổi vertices/edges sang GraphNode/GraphEdge
    const nodes: GraphNode[] = vertices.value.map((v) => ({
      id: v.id,
      x: v.x,
      y: v.y,
      fx: 0,
      fy: 0,
    }));

    const graphEdges: GraphEdge[] = edges.value.map((e) => ({
      sourceId: e.sourceId,
      targetId: e.targetId,
      weight: e.weight,
    }));

    // Tính toán bước vật lý
    forceLayout.computePhysicsStep(nodes, graphEdges);

    // Cập nhật vị trí vertices
    nodes.forEach((node, idx) => {
      if (vertices.value[idx]) {
        vertices.value[idx].x = node.x;
        vertices.value[idx].y = node.y;
      }
    });

    // Giới hạn trong bounds
    const c = playgroundCanvas.value;
    if (c) {
      vertices.value.forEach((v) => {
        v.x = Math.max(20, Math.min(c.width - 20, v.x));
        v.y = Math.max(20, Math.min(c.height - 20, v.y));
      });
    }

    layoutAnimationId = requestAnimationFrame(runLayout);
  };

  runLayout();
};

const stopLayoutLoop = () => {
  if (layoutAnimationId !== null) {
    cancelAnimationFrame(layoutAnimationId);
    layoutAnimationId = null;
  }
};

// Cleanup layout loop on unmount
const cleanupLayout = () => {
  stopLayoutLoop();
};

const getBezierPath = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string => {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - 20; // curve offset
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
};

// ─── PLAYGROUND RENDER LOOP ──────────────────────────────────────────────────
const startPlaygroundLoop = () => {
  const renderLoop = () => {
    drawPlayground();
    animationFrameId = requestAnimationFrame(renderLoop);
  };
  renderLoop();
};

const drawPlayground = () => {
  const c = playgroundCanvas.value;
  if (!c) return;
  const ctx = c.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, c.width, c.height);

  // 1. Draw static/established edges
  edges.value.forEach((edge) => {
    const v1 = vertices.value.find((v) => v.id === edge.sourceId);
    const v2 = vertices.value.find((v) => v.id === edge.targetId);
    if (!v1 || !v2) return;

    // Draw connection line
    ctx.beginPath();
    ctx.moveTo(v1.x, v1.y);
    ctx.quadraticCurveTo((v1.x + v2.x) / 2, (v1.y + v2.y) / 2 - 15, v2.x, v2.y);
    ctx.strokeStyle = "#06b6d4"; // Cyan neon edge
    ctx.lineWidth = 2;
    ctx.shadowColor = "#06b6d4";
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0; // reset shadow

    // Draw weight label
    const mx = (v1.x + v2.x) / 2;
    const my = (v1.y + v2.y) / 2 - 15;
    ctx.fillStyle = "#06b6d4";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#070b13";
    ctx.fillRect(mx - 8, my - 6, 16, 12);
    ctx.strokeStyle = "#06b6d4";
    ctx.strokeRect(mx - 8, my - 6, 16, 12);
    ctx.fillStyle = "#f8fafc";
    ctx.fillText(String(edge.weight), mx, my);
  });

  // 2. Draw vertices
  vertices.value.forEach((v) => {
    const isSelected = selectedVertexId.value === v.id;

    // Outer glow for selected
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(v.x, v.y, 25, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(245, 158, 11, 0.4)"; // Amber laser lock glow
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Main Circle body
    ctx.beginPath();
    ctx.arc(v.x, v.y, 18, 0, 2 * Math.PI);
    ctx.fillStyle = isSelected ? "#78350f" : "#0e1726"; // amber bg for selected
    ctx.fill();
    ctx.strokeStyle = isSelected ? "#f59e0b" : "#334155"; // Neon Amber border vs Slate border
    ctx.lineWidth = 2;
    if (isSelected) {
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 10;
    }
    ctx.stroke();
    ctx.shadowBlur = 0; // reset

    // Label Text
    ctx.fillStyle = isSelected ? "#ffffff" : "#e2e8f0";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(v.id, v.x, v.y);
  });
};
</script>

<style scoped>
@keyframes dash {
  to {
    stroke-dashoffset: -40;
  }
}
</style>
