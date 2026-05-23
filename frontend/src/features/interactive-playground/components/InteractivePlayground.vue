<template>
  <div class="playground-container">
    <!-- Status bar -->
    <div class="playground-status-bar">
      <div class="status-left">
        <span class="status-label">Nodes: {{ store.nodeCount }}</span>
        <span class="status-divider">|</span>
        <span class="status-label">Edges: {{ store.edgeCount }}</span>
        <span class="status-divider">|</span>
        <span class="status-label mode-badge">{{ modeLabel }}</span>
      </div>
      <div class="status-right">
        <button
          class="action-btn export-btn"
          title="Xuất đồ thị (JSON)"
          @click="exportGraph"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export
        </button>
        <label class="action-btn import-btn" title="Nhập đồ thị (JSON)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Import
          <input
            ref="fileInputRef"
            type="file"
            accept=".json"
            style="display: none;"
            @change="importGraph"
          />
        </label>
        <button
          class="action-btn run-btn"
          title="Chạy thuật toán (xuất JSON payload)"
          @click="runAlgorithm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Run
        </button>
      </div>
    </div>

    <!-- Canvas area with toolbar overlay -->
    <div class="playground-canvas-area" ref="canvasAreaRef">
      <PlaygroundCanvas @weight-input="onWeightInput" />
      <FloatingToolbar />

      <!-- Weight input popover -->
      <div
        v-if="weightPopover.visible"
        class="weight-popover"
        :style="{ left: weightPopover.x + 'px', top: weightPopover.y + 'px' }"
      >
        <input
          ref="weightInputRef"
          type="number"
          min="1"
          max="999"
          :value="weightPopover.value"
          class="weight-input"
          @keydown.enter="submitWeight"
          @blur="submitWeight"
          @keydown.escape="cancelWeight"
        />
      </div>
    </div>

    <!-- JSON output panel -->
    <div v-if="jsonOutput" class="json-output-panel">
      <div class="json-header">
        <span class="json-title">Adjacency List Payload</span>
        <button class="json-close" @click="jsonOutput = null">&times;</button>
      </div>
      <pre class="json-body">{{ jsonOutput }}</pre>
    </div>

    <!-- Toast message -->
    <div v-if="toast.visible" class="playground-toast" :class="toast.type">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { usePlaygroundStore } from '../store/usePlaygroundStore';
import { GraphParser } from '../services/GraphParser';
import PlaygroundCanvas from './PlaygroundCanvas.vue';
import FloatingToolbar from './FloatingToolbar.vue';

const store = usePlaygroundStore();
const fileInputRef = ref<HTMLInputElement | null>(null);
const weightInputRef = ref<HTMLInputElement | null>(null);
const canvasAreaRef = ref<HTMLElement | null>(null);

const jsonOutput = ref<string | null>(null);

const weightPopover = ref({
  visible: false,
  edgeId: '',
  x: 0,
  y: 0,
  value: 1,
});

const toast = ref({
  visible: false,
  message: '',
  type: 'info' as 'info' | 'error' | 'success',
});

let toastTimer: ReturnType<typeof setTimeout> | null = null;

const modeLabel = computed(() => {
  const labels: Record<string, string> = {
    SELECT: 'Di chuyển',
    ADD_NODE: 'Thêm đỉnh',
    ADD_EDGE: 'Thêm cạnh',
    WEIGHT: 'Trọng số',
    DELETE: 'Xóa',
  };
  return labels[store.mode] || store.mode;
});

function showToast(message: string, type: 'info' | 'error' | 'success' = 'info') {
  if (toastTimer) clearTimeout(toastTimer);
  toast.value = { visible: true, message, type };
  toastTimer = setTimeout(() => {
    toast.value.visible = false;
  }, 3000);
}

function onWeightInput(payload: { edgeId: string; x: number; y: number; currentWeight: number }) {
  const area = canvasAreaRef.value;
  if (!area) return;
  const areaRect = area.getBoundingClientRect();

  weightPopover.value = {
    visible: true,
    edgeId: payload.edgeId,
    x: payload.x - areaRect.left,
    y: payload.y - areaRect.top - 20,
    value: payload.currentWeight,
  };

  nextTick(() => {
    weightInputRef.value?.focus();
    weightInputRef.value?.select();
  });
}

function submitWeight() {
  const val = Number(weightInputRef.value?.value);
  if (val > 0 && val <= 999 && weightPopover.value.edgeId) {
    store.updateEdgeWeight(weightPopover.value.edgeId, val);
  }
  weightPopover.value.visible = false;
}

function cancelWeight() {
  weightPopover.value.visible = false;
}

function exportGraph() {
  if (store.nodes.length === 0) {
    showToast('Không có đồ thị nào để xuất.', 'error');
    return;
  }
  const json = GraphParser.exportToJSON(store.nodes, store.edges);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `graph-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast('Đã xuất đồ thị thành công!', 'success');
}

function importGraph(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    const result = GraphParser.importFromJSON(content);
    if (result) {
      store.clearAll();
      result.nodes.forEach(n => {
        store.nodes.push(n);
      });
      result.edges.forEach(e => {
        store.edges.push(e);
      });
      showToast(`Đã nhập ${result.nodes.length} đỉnh, ${result.edges.length} cạnh.`, 'success');
    } else {
      showToast('File JSON không hợp lệ.', 'error');
    }
    input.value = '';
  };
  reader.readAsText(file);
}

function runAlgorithm() {
  if (store.nodes.length === 0) {
    showToast('Hãy vẽ đồ thị trước khi chạy thuật toán.', 'error');
    return;
  }

  const isolated = GraphParser.findIsolatedNodes(store.nodes, store.edges);
  if (isolated.length > 0) {
    showToast(`Đỉnh cô lập: ${isolated.join(', ')}. Hãy nối hoặc xóa chúng.`, 'error');
    return;
  }

  const payload = GraphParser.toAdjacencyList(store.nodes, store.edges);
  jsonOutput.value = JSON.stringify(payload, null, 2);
  showToast('Đã xuất payload thành công!', 'success');
}

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer);
});
</script>

<style scoped>
.playground-container {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #0F172A;
  border-radius: 12px;
  overflow: hidden;
}

.playground-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.status-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
  font-size: 12px;
  color: #94A3B8;
  font-family: 'Inter', sans-serif;
}

.status-divider {
  color: #334155;
  font-size: 12px;
}

.mode-badge {
  padding: 2px 10px;
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.15);
  color: #10B981;
  font-weight: 600;
}

.status-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(30, 41, 59, 0.6);
  color: #CBD5E1;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
  font-family: 'Inter', sans-serif;
}

.action-btn:hover {
  background: rgba(51, 65, 85, 0.8);
  color: #F8FAFC;
}

.run-btn {
  background: rgba(16, 185, 129, 0.15);
  color: #10B981;
  border-color: rgba(16, 185, 129, 0.3);
}

.run-btn:hover {
  background: rgba(16, 185, 129, 0.3);
}

.playground-canvas-area {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.weight-popover {
  position: absolute;
  z-index: 1010;
  transform: translate(-50%, -100%);
}

.weight-input {
  width: 60px;
  padding: 4px 8px;
  border-radius: 8px;
  border: 2px solid #10B981;
  background: #1E293B;
  color: #FBBF24;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  outline: none;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
  font-family: 'Inter', monospace;
}

.weight-input:focus {
  border-color: #34D399;
}

.json-output-panel {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 360px;
  max-height: 280px;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  z-index: 1020;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.json-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(30, 41, 59, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.json-title {
  font-size: 11px;
  font-weight: 600;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.json-close {
  background: none;
  border: none;
  color: #64748B;
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
}

.json-close:hover {
  color: #F8FAFC;
}

.json-body {
  padding: 12px;
  margin: 0;
  font-size: 11px;
  color: #10B981;
  font-family: 'Fira Code', 'Cascadia Code', monospace;
  overflow: auto;
  max-height: 230px;
  line-height: 1.5;
}

.playground-toast {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 20px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  z-index: 2000;
  animation: toast-in 0.3s ease-out;
  font-family: 'Inter', sans-serif;
}

.playground-toast.info {
  background: rgba(14, 165, 233, 0.9);
  color: white;
}

.playground-toast.error {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.playground-toast.success {
  background: rgba(16, 185, 129, 0.9);
  color: white;
}

@keyframes toast-in {
  from { opacity: 0; transform: translateX(-50%) translateY(10px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
</style>
