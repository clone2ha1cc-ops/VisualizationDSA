<template>
  <svg class="svg-connections-layer" :viewBox="`0 0 ${width} ${height}`">
    <defs>
      <marker id="arrow-inheritance" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">
        <polygon points="0 0, 12 4, 0 8" fill="none" stroke="#10B981" stroke-width="1.5" />
      </marker>
      <marker id="arrow-realization" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">
        <polygon points="0 0, 12 4, 0 8" fill="none" stroke="#06B6D4" stroke-width="1.5" />
      </marker>
      <marker id="arrow-dependency" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#F59E0B" />
      </marker>
      <marker id="arrow-association" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#e2e8f0" />
      </marker>
    </defs>
    <path
      v-for="link in links"
      :key="link.id"
      :d="pathCache.get(link.id) || ''"
      :class="[
        'bezier-path',
        `relation-${link.type}`,
        { 'observer-pulse': isObserverNotifying && activePatternId === 'observer-pattern' && link.sourceId === 'Subject' },
        { 'dip-coupled-thick': activePatternId === 'solid-dip' && !isDIPEnabled },
        { 'dip-decoupled-thin': activePatternId === 'solid-dip' && isDIPEnabled },
      ]"
      :marker-end="getMarkerEnd(link.type)"
      fill="none"
    />
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  links: { id: string; type: string; sourceId: string }[];
  pathCache: Map<string, string>;
  activePatternId: string;
  isObserverNotifying: boolean;
  isDIPEnabled: boolean;
  width: number;
  height: number;
}>();

function getMarkerEnd(type: string): string {
  const map: Record<string, string> = {
    inheritance: 'url(#arrow-inheritance)', realization: 'url(#arrow-realization)',
    dependency: 'url(#arrow-dependency)', association: 'url(#arrow-association)',
  };
  return map[type] ?? '';
}
</script>

<style scoped>
.svg-connections-layer { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; }
.bezier-path { stroke: rgba(255, 255, 255, 0.15); stroke-width: 2; transition: d 0.3s ease, stroke 0.3s ease, stroke-width 0.3s ease; }
.relation-inheritance { stroke: #10B981; filter: drop-shadow(0 0 4px rgba(16, 185, 129, 0.4)); }
.relation-realization  { stroke: #06B6D4; stroke-dasharray: 6, 4; filter: drop-shadow(0 0 4px rgba(6, 182, 212, 0.4)); }
.relation-dependency   { stroke: #F59E0B; stroke-dasharray: 4, 4; filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.4)); }
.relation-association  { stroke: #e2e8f0; filter: drop-shadow(0 0 3px rgba(226, 232, 240, 0.3)); }
@keyframes stroke-pulse-flow { to { stroke-dashoffset: -30; } }
.observer-pulse { stroke: #06B6D4 !important; stroke-dasharray: 8, 4 !important; stroke-width: 3 !important; animation: stroke-pulse-flow 1.2s infinite linear; filter: drop-shadow(0 0 6px #06B6D4) !important; }
.dip-coupled-thick  { stroke: #F43F5E !important; stroke-width: 4 !important; stroke-dasharray: none !important; filter: drop-shadow(0 0 8px rgba(244, 63, 94, 0.4)) !important; }
.dip-decoupled-thin { stroke: #06B6D4 !important; stroke-width: 2 !important; stroke-dasharray: 6, 4 !important; filter: drop-shadow(0 0 4px rgba(6, 182, 212, 0.4)) !important; }
</style>
