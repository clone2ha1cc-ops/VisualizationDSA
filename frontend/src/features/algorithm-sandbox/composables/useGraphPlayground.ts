import { ref, onMounted, onBeforeUnmount, watch, type Ref } from "vue";
import {
  InteractivePlaygroundEngine,
  type Vertex,
} from "../CustomInputParser";
import {
  ForceDirectedLayout,
  type GraphNode,
  type GraphEdge,
} from "../ForceDirectedLayout";

export function useGraphPlayground(
  playgroundCanvas: Ref<HTMLCanvasElement | null>,
  canvasContainer: Ref<HTMLDivElement | null>,
  graphInputText: Ref<string>,
  parsedGraphNodes: Ref<Array<{ id: string }>>,
  parsedGraphEdges: Ref<Array<{ sourceId: string; targetId: string; weight: number }>>,
  validateGraph: () => void
) {
  const vertices = ref<Vertex[]>([]);
  const edges = ref<Array<{ sourceId: string; targetId: string; weight: number }>>([]);
  const selectedVertexId = ref<string | null>(null);

  const draggingEdge = ref<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);

  const isDraggingVertex = ref(false);
  const draggedVertexId = ref<string | null>(null);
  const dragOffset = ref({ x: 0, y: 0 });

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

  function syncTextToPlayground() {
    if (!playgroundEngine) return;
    playgroundEngine.clear();

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
      playgroundEngine?.handleDoubleClick(x, y);
    });

    edges.value = parsedGraphEdges.value.map((e) => ({
      sourceId: e.sourceId,
      targetId: e.targetId,
      weight: e.weight,
    }));
  }

  function syncPlaygroundToText() {
    if (vertices.value.length === 0) {
      graphInputText.value = "";
      validateGraph();
      return;
    }

    const tokens = edges.value.map(
      (e) => `${e.sourceId}-${e.targetId}:${e.weight}`
    );
    graphInputText.value = tokens.join(", ");
    validateGraph();
  }

  function clearPlayground() {
    playgroundEngine?.clear();
    edges.value = [];
    selectedVertexId.value = null;
    draggingEdge.value = null;
    syncPlaygroundToText();
  }

  function resizeCanvas() {
    const c = playgroundCanvas.value;
    const containerEl = canvasContainer.value;
    if (!c || !containerEl) return;
    c.width = containerEl.clientWidth;
    c.height = containerEl.clientHeight;
  }

  function onCanvasDoubleClick(e: MouseEvent) {
    const c = playgroundCanvas.value;
    if (!c || !playgroundEngine) return;
    const rect = c.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    playgroundEngine.handleDoubleClick(x, y);
    syncPlaygroundToText();
  }

  function findVertexAt(x: number, y: number): Vertex | null {
    return vertices.value.find((v) => Math.hypot(v.x - x, v.y - y) < 22) || null;
  }

  function onCanvasMouseDown(e: MouseEvent) {
    const c = playgroundCanvas.value;
    if (!c || !playgroundEngine) return;
    const rect = c.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedVertex = findVertexAt(x, y);
    if (clickedVertex) {
      if (selectedVertexId.value === clickedVertex.id) {
        isDraggingVertex.value = true;
        draggedVertexId.value = clickedVertex.id;
        dragOffset.value = {
          x: x - clickedVertex.x,
          y: y - clickedVertex.y,
        };
        if (isAutoLayout.value) {
          stopLayoutLoop();
        }
        return;
      }

      if (selectedVertexId.value === null) {
        selectedVertexId.value = clickedVertex.id;
        playgroundEngine.selectVertex(clickedVertex.id);
      } else if (selectedVertexId.value === clickedVertex.id) {
        selectedVertexId.value = null;
        playgroundEngine.selectVertex("");
      } else {
        const source = selectedVertexId.value;
        const target = clickedVertex.id;

        const exists = edges.value.some(
          (edge) =>
            (edge.sourceId === source && edge.targetId === target) ||
            (edge.sourceId === target && edge.targetId === source)
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
  }

  function onCanvasMouseMove(e: MouseEvent) {
    const c = playgroundCanvas.value;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDraggingVertex.value && draggedVertexId.value) {
      const vertex = vertices.value.find((v) => v.id === draggedVertexId.value);
      if (vertex) {
        vertex.x = x - dragOffset.value.x;
        vertex.y = y - dragOffset.value.y;
        vertex.x = Math.max(20, Math.min(c.width - 20, vertex.x));
        vertex.y = Math.max(20, Math.min(c.height - 20, vertex.y));
      }
      return;
    }

    if (selectedVertexId.value) {
      const startVertex = vertices.value.find(
        (v) => v.id === selectedVertexId.value
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
  }

  function onCanvasMouseUp() {
    draggingEdge.value = null;

    if (isDraggingVertex.value) {
      isDraggingVertex.value = false;
      draggedVertexId.value = null;
      syncPlaygroundToText();

      if (isAutoLayout.value) {
        startLayoutLoop();
      }
    }
  }

  function toggleAutoLayout() {
    isAutoLayout.value = !isAutoLayout.value;
    isAutoLayout.value ? startLayoutLoop() : stopLayoutLoop();
  }

  function startLayoutLoop() {
    if (layoutAnimationId !== null) return;

    const runLayout = () => {
      if (vertices.value.length < 2 || edges.value.length === 0) {
        layoutAnimationId = requestAnimationFrame(runLayout);
        return;
      }

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

      forceLayout.computePhysicsStep(nodes, graphEdges);

      nodes.forEach((node, idx) => {
        if (vertices.value[idx]) {
          vertices.value[idx].x = node.x;
          vertices.value[idx].y = node.y;
        }
      });

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
  }

  function stopLayoutLoop() {
    if (layoutAnimationId !== null) {
      cancelAnimationFrame(layoutAnimationId);
      layoutAnimationId = null;
    }
  }

  function getBezierPath(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): string {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2 - 20;
    return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  }

  function startPlaygroundLoop() {
    const renderLoop = () => {
      drawPlayground();
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();
  }

  function drawPlayground() {
    const c = playgroundCanvas.value;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, c.width, c.height);

    edges.value.forEach((edge) => {
      const v1 = vertices.value.find((v) => v.id === edge.sourceId);
      const v2 = vertices.value.find((v) => v.id === edge.targetId);
      if (!v1 || !v2) return;

      ctx.beginPath();
      ctx.moveTo(v1.x, v1.y);
      ctx.quadraticCurveTo((v1.x + v2.x) / 2, (v1.y + v2.y) / 2 - 15, v2.x, v2.y);
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#06b6d4";
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

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

    vertices.value.forEach((v) => {
      const isSelected = selectedVertexId.value === v.id;

      if (isSelected) {
        ctx.beginPath();
        ctx.arc(v.x, v.y, 25, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(v.x, v.y, 18, 0, 2 * Math.PI);
      ctx.fillStyle = isSelected ? "#78350f" : "#0e1726";
      ctx.fill();
      ctx.strokeStyle = isSelected ? "#f59e0b" : "#334155";
      ctx.lineWidth = 2;
      if (isSelected) {
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 10;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = isSelected ? "#ffffff" : "#e2e8f0";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(v.id, v.x, v.y);
    });
  }

  onMounted(() => {
    playgroundEngine = new InteractivePlaygroundEngine((newVertices) => {
      vertices.value = newVertices;
    });
    syncTextToPlayground();
    startPlaygroundLoop();
  });

  onBeforeUnmount(() => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }
    stopLayoutLoop();
  });

  return {
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
  };
}
