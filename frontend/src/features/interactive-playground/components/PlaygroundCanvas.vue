<template>
  <canvas
    ref="canvasRef"
    :width="canvasWidth"
    :height="canvasHeight"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
    style="display: block; width: 100%; height: 100%; background: #0F172A; border-radius: 8px; cursor: crosshair;"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { usePlaygroundStore, type NodeDTO } from '../store/usePlaygroundStore';
import { GraphGeometryEngine, type Point } from '../engine/GraphGeometryEngine';
import { ForceDirectedEngine } from '../engine/ForceDirectedEngine';

const store = usePlaygroundStore();
const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasWidth = ref(800);
const canvasHeight = ref(500);

const physicsEngine = new ForceDirectedEngine();
let animFrameId = 0;

const dragState = ref<{
  nodeId: string | null;
  offsetX: number;
  offsetY: number;
  isDragging: boolean;
}>({ nodeId: null, offsetX: 0, offsetY: 0, isDragging: false });

const edgeDrawState = ref<{
  fromNodeId: string | null;
  mouseX: number;
  mouseY: number;
  snapTarget: NodeDTO | null;
}>({ fromNodeId: null, mouseX: 0, mouseY: 0, snapTarget: null });

const weightInputState = ref<{
  edgeId: string | null;
  x: number;
  y: number;
  value: string;
}>({ edgeId: null, x: 0, y: 0, value: '' });

const emit = defineEmits<{
  (e: 'weight-input', payload: { edgeId: string; x: number; y: number; currentWeight: number }): void;
}>();

function getMousePos(e: MouseEvent): Point {
  const canvas = canvasRef.value;
  if (!canvas) return { x: 0, y: 0 };
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height),
  };
}

function onMouseDown(e: MouseEvent) {
  const pos = getMousePos(e);
  const mode = store.mode;

  if (mode === 'SELECT') {
    const hitNode = GraphGeometryEngine.hitTestNode(pos, store.nodes);
    if (hitNode) {
      dragState.value = {
        nodeId: hitNode.id,
        offsetX: pos.x - hitNode.x,
        offsetY: pos.y - hitNode.y,
        isDragging: true,
      };
      store.selectNode(hitNode.id);
    } else {
      store.clearSelection();
    }
  } else if (mode === 'ADD_NODE') {
    const added = store.addNode(pos.x, pos.y);
    if (!added) {
      // Max nodes reached — could show toast
    }
  } else if (mode === 'ADD_EDGE') {
    const hitNode = GraphGeometryEngine.hitTestNode(pos, store.nodes);
    if (hitNode) {
      edgeDrawState.value = {
        fromNodeId: hitNode.id,
        mouseX: pos.x,
        mouseY: pos.y,
        snapTarget: null,
      };
    }
  } else if (mode === 'WEIGHT') {
    const hitEdge = GraphGeometryEngine.hitTestEdge(pos, store.edges, store.nodes);
    if (hitEdge) {
      const fromNode = store.nodes.find(n => n.id === hitEdge.from);
      const toNode = store.nodes.find(n => n.id === hitEdge.to);
      if (fromNode && toNode) {
        const mid = GraphGeometryEngine.edgeMidpoint(fromNode, toNode);
        const canvas = canvasRef.value;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const screenX = rect.left + mid.x * (rect.width / canvas.width);
          const screenY = rect.top + mid.y * (rect.height / canvas.height);
          emit('weight-input', { edgeId: hitEdge.id, x: screenX, y: screenY, currentWeight: hitEdge.weight });
        }
      }
      store.selectEdge(hitEdge.id);
    }
  } else if (mode === 'DELETE') {
    const hitNode = GraphGeometryEngine.hitTestNode(pos, store.nodes);
    if (hitNode) {
      store.deleteNode(hitNode.id);
      return;
    }
    const hitEdge = GraphGeometryEngine.hitTestEdge(pos, store.edges, store.nodes);
    if (hitEdge) {
      store.deleteEdge(hitEdge.id);
    }
  }
}

function onMouseMove(e: MouseEvent) {
  const pos = getMousePos(e);

  if (store.mode === 'SELECT' && dragState.value.isDragging && dragState.value.nodeId) {
    const newX = Math.max(20, Math.min(canvasWidth.value - 20, pos.x - dragState.value.offsetX));
    const newY = Math.max(20, Math.min(canvasHeight.value - 20, pos.y - dragState.value.offsetY));
    store.moveNode(dragState.value.nodeId, newX, newY);
  }

  if (store.mode === 'ADD_EDGE' && edgeDrawState.value.fromNodeId) {
    edgeDrawState.value.mouseX = pos.x;
    edgeDrawState.value.mouseY = pos.y;

    let snapTarget: NodeDTO | null = null;
    for (const node of store.nodes) {
      if (node.id === edgeDrawState.value.fromNodeId) continue;
      if (GraphGeometryEngine.isWithinSnapDistance(pos, node, 40)) {
        snapTarget = node;
        break;
      }
    }
    edgeDrawState.value.snapTarget = snapTarget;
  }
}

function onMouseUp(_e: MouseEvent) {
  if (store.mode === 'ADD_EDGE' && edgeDrawState.value.fromNodeId) {
    if (edgeDrawState.value.snapTarget) {
      store.addEdge(edgeDrawState.value.fromNodeId, edgeDrawState.value.snapTarget.id);
    }
    edgeDrawState.value = { fromNodeId: null, mouseX: 0, mouseY: 0, snapTarget: null };
  }

  dragState.value = { nodeId: null, offsetX: 0, offsetY: 0, isDragging: false };
}

function draw() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw edges
  for (const edge of store.edges) {
    const fromNode = store.nodes.find(n => n.id === edge.from);
    const toNode = store.nodes.find(n => n.id === edge.to);
    if (!fromNode || !toNode) continue;

    const isSelected = store.selectedEdgeId === edge.id;
    const arrow = GraphGeometryEngine.calculateArrowPlacement(
      fromNode, toNode, fromNode.radius, toNode.radius
    );

    // Edge line
    ctx.beginPath();
    ctx.moveTo(arrow.start.x, arrow.start.y);
    ctx.lineTo(arrow.end.x, arrow.end.y);
    ctx.strokeStyle = isSelected ? '#10B981' : '#64748B';
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.stroke();

    // Arrowhead
    const headLen = 12;
    ctx.beginPath();
    ctx.moveTo(arrow.end.x, arrow.end.y);
    ctx.lineTo(
      arrow.end.x - headLen * Math.cos(arrow.angle - Math.PI / 6),
      arrow.end.y - headLen * Math.sin(arrow.angle - Math.PI / 6)
    );
    ctx.lineTo(
      arrow.end.x - headLen * Math.cos(arrow.angle + Math.PI / 6),
      arrow.end.y - headLen * Math.sin(arrow.angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = isSelected ? '#10B981' : '#64748B';
    ctx.fill();

    // Weight label
    const mid = GraphGeometryEngine.edgeMidpoint(fromNode, toNode);
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = '#FBBF24';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const labelBgW = ctx.measureText(String(edge.weight)).width + 10;
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(mid.x - labelBgW / 2, mid.y - 9, labelBgW, 18);
    ctx.fillStyle = '#FBBF24';
    ctx.fillText(String(edge.weight), mid.x, mid.y);
  }

  // Draw rubber-band line for edge creation
  if (edgeDrawState.value.fromNodeId) {
    const fromNode = store.nodes.find(n => n.id === edgeDrawState.value.fromNodeId);
    if (fromNode) {
      const targetX = edgeDrawState.value.snapTarget
        ? edgeDrawState.value.snapTarget.x
        : edgeDrawState.value.mouseX;
      const targetY = edgeDrawState.value.snapTarget
        ? edgeDrawState.value.snapTarget.y
        : edgeDrawState.value.mouseY;

      ctx.beginPath();
      ctx.setLineDash([6, 4]);
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(targetX, targetY);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Draw nodes
  for (const node of store.nodes) {
    const isSelected = store.selectedNodeId === node.id;
    const isSnapTarget = edgeDrawState.value.snapTarget?.id === node.id;

    // Glow effect for snap target
    if (isSnapTarget) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.fill();
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fillStyle = isSelected ? '#0EA5E9' : '#334155';
    ctx.fill();
    ctx.strokeStyle = isSelected ? '#38BDF8' : '#64748B';
    ctx.lineWidth = isSelected ? 3 : 2;
    if (isSelected) ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Node label
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillStyle = '#F8FAFC';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, node.x, node.y);
  }
}

function renderLoop() {
  // Physics step
  if (store.isPhysicsEnabled && store.nodes.length > 1 && store.edges.length > 0) {
    const dragId = dragState.value.isDragging ? dragState.value.nodeId : null;
    const energy = physicsEngine.tick(store.nodes, store.edges, canvasWidth.value, canvasHeight.value, dragId);
    if (physicsEngine.isStable(energy) && !dragState.value.isDragging) {
      // Physics stabilized — still render but skip physics next frame
    }
  }

  draw();
  animFrameId = requestAnimationFrame(renderLoop);
}

function resizeCanvas() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const parent = canvas.parentElement;
  if (!parent) return;
  canvasWidth.value = parent.clientWidth;
  canvasHeight.value = parent.clientHeight;
}

onMounted(() => {
  nextTick(() => {
    resizeCanvas();
    renderLoop();
  });
  window.addEventListener('resize', resizeCanvas);
});

onUnmounted(() => {
  cancelAnimationFrame(animFrameId);
  window.removeEventListener('resize', resizeCanvas);
});

watch(() => store.nodes.length, () => {
  physicsEngine.reset();
});
</script>
