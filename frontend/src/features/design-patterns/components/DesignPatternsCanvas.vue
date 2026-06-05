<template>
  <div ref="canvasContainer" class="design-patterns-canvas">
    <DesignPatternsConnectionsLayer
      :links="store.links"
      :path-cache="store.pathCache"
      :active-pattern-id="store.activePatternId"
      :is-observer-notifying="store.isObserverNotifying"
      :is-d-i-p-enabled="store.isDIPEnabled"
      :width="canvasWidth"
      :height="canvasHeight"
    />

    <ClassNodeCard
      v-for="node in store.nodes"
      :key="node.id"
      :node="node"
      :is-active-strategy="isNodeActiveStrategy(node.id)"
      :is-observer-pulse="isNodeObserverPulse(node.id)"
      @drag="onNodeDrag"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useDesignPatternsStore } from '../store/useDesignPatternsStore';
import ClassNodeCard from './ClassNodeCard.vue';
import DesignPatternsConnectionsLayer from './DesignPatternsConnectionsLayer.vue';

const store = useDesignPatternsStore();
const canvasContainer = ref<HTMLDivElement | null>(null);
const canvasWidth  = ref(600);
const canvasHeight = ref(500);
let resizeObserver: ResizeObserver | null = null;

function updateSize() {
  if (!canvasContainer.value) return;
  const w = canvasContainer.value.clientWidth;
  const h = canvasContainer.value.clientHeight;
  if (w > 0) canvasWidth.value = w;
  if (h > 0) canvasHeight.value = h;
}

function isNodeActiveStrategy(nodeId: string): boolean {
  return store.activePatternId === 'strategy-pattern' && nodeId === store.activeStrategyTargetId;
}

function isNodeObserverPulse(nodeId: string): boolean {
  if (store.activePatternId !== 'observer-pattern' || !store.isObserverNotifying) return false;
  return nodeId === 'ObsA' || nodeId === 'ObsB' || nodeId === 'ObsC';
}

function onNodeDrag(nodeId: string, x: number, y: number): void {
  if (!canvasContainer.value) return;
  const rect = canvasContainer.value.getBoundingClientRect();
  store.handleNodeDrag(nodeId, x - rect.left, y - rect.top, canvasWidth.value, canvasHeight.value);
}

onMounted(() => {
  updateSize();
  if (canvasContainer.value) {
    resizeObserver = new ResizeObserver(() => updateSize());
    resizeObserver.observe(canvasContainer.value);
  }
  store.recalculatePaths();
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});
</script>

<style scoped>
.design-patterns-canvas { position: relative; width: 100%; height: 100%; min-height: 400px; background: rgba(7, 11, 19, 0.6); border: 1px solid rgba(255, 255, 255, 0.04); border-radius: 16px; overflow: hidden; }
</style>
