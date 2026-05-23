import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface NodeDTO {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
}

export interface EdgeDTO {
  id: string;
  from: string;
  to: string;
  weight: number;
}

export type PlaygroundMode = 'SELECT' | 'ADD_NODE' | 'ADD_EDGE' | 'WEIGHT' | 'DELETE';

const MAX_NODES = 30;

export const usePlaygroundStore = defineStore('playground', () => {
  const mode = ref<PlaygroundMode>('SELECT');
  const nodes = ref<NodeDTO[]>([]);
  const edges = ref<EdgeDTO[]>([]);
  const selectedNodeId = ref<string | null>(null);
  const selectedEdgeId = ref<string | null>(null);
  const isPhysicsEnabled = ref(true);

  const canAddNode = computed(() => nodes.value.length < MAX_NODES);
  const nodeCount = computed(() => nodes.value.length);
  const edgeCount = computed(() => edges.value.length);

  function setMode(newMode: PlaygroundMode) {
    mode.value = newMode;
    clearSelection();
  }

  function addNode(x: number, y: number): NodeDTO | null {
    if (!canAddNode.value) return null;

    const label = String.fromCharCode(65 + (nodes.value.length % 26));
    const id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    const node: NodeDTO = { id, label, x, y, radius: 20 };
    nodes.value.push(node);
    return node;
  }

  function addEdge(fromId: string, toId: string): EdgeDTO | null {
    if (fromId === toId) return null;

    const exists = edges.value.some(
      e => (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId)
    );
    if (exists) return null;

    const id = `edge_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const edge: EdgeDTO = { id, from: fromId, to: toId, weight: 1 };
    edges.value.push(edge);
    return edge;
  }

  function updateEdgeWeight(edgeId: string, newWeight: number) {
    const edge = edges.value.find(e => e.id === edgeId);
    if (edge && newWeight > 0 && newWeight <= 999) {
      edge.weight = newWeight;
    }
  }

  function moveNode(nodeId: string, x: number, y: number) {
    const node = nodes.value.find(n => n.id === nodeId);
    if (node) {
      node.x = x;
      node.y = y;
    }
  }

  function deleteNode(nodeId: string) {
    nodes.value = nodes.value.filter(n => n.id !== nodeId);
    edges.value = edges.value.filter(e => e.from !== nodeId && e.to !== nodeId);
    if (selectedNodeId.value === nodeId) selectedNodeId.value = null;
  }

  function deleteEdge(edgeId: string) {
    edges.value = edges.value.filter(e => e.id !== edgeId);
    if (selectedEdgeId.value === edgeId) selectedEdgeId.value = null;
  }

  function clearAll() {
    nodes.value = [];
    edges.value = [];
    clearSelection();
  }

  function clearSelection() {
    selectedNodeId.value = null;
    selectedEdgeId.value = null;
  }

  function selectNode(nodeId: string | null) {
    selectedNodeId.value = nodeId;
    selectedEdgeId.value = null;
  }

  function selectEdge(edgeId: string | null) {
    selectedEdgeId.value = edgeId;
    selectedNodeId.value = null;
  }

  function togglePhysics() {
    isPhysicsEnabled.value = !isPhysicsEnabled.value;
  }

  return {
    mode,
    nodes,
    edges,
    selectedNodeId,
    selectedEdgeId,
    isPhysicsEnabled,
    canAddNode,
    nodeCount,
    edgeCount,
    setMode,
    addNode,
    addEdge,
    updateEdgeWeight,
    moveNode,
    deleteNode,
    deleteEdge,
    clearAll,
    clearSelection,
    selectNode,
    selectEdge,
    togglePhysics,
  };
});
