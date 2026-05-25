<template>
  <div class="design-patterns-workspace">
    <!-- Header -->
    <div class="workspace-header">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-cyan-400">
          <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
        </svg>
        <span class="text-xs font-bold uppercase tracking-wider text-slate-300">Design Patterns & SOLID Visualizer</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="header-badge badge-nodes">{{ store.nodeCount }} Nodes</span>
        <span class="header-badge badge-links">{{ store.linkCount }} Links</span>
      </div>
    </div>

    <!-- Scenario Tabs -->
    <div class="scenario-tabs">
      <button v-for="sid in scenarioIds" :key="sid"
        class="scenario-tab" :class="{ active: store.activePatternId === sid }"
        @click="store.initializeScenario(sid)">
        {{ SCENARIO_LABELS[sid] }}
      </button>
    </div>

    <!-- Main Content: Canvas + Control Panel -->
    <div class="workspace-body">
      <div class="canvas-area"><DesignPatternsCanvas /></div>
      <DesignPatternsControlPanel
        :active-pattern-id="store.activePatternId ?? ''"
        :scenario-title="store.activeScenarioTitle"
        :active-strategy-id="store.activeStrategyTargetId"
        :is-observer-notifying="store.isObserverNotifying"
        :is-d-i-p-enabled="store.isDIPEnabled"
        :coupling-index="store.couplingIndexMetric"
        :coupling-label="store.couplingLabel"
        @switch-strategy="store.switchStrategy"
        @notify="store.triggerObserverNotify()"
        @toggle-d-i-p="store.toggleDIP()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useDesignPatternsStore } from '../store/useDesignPatternsStore';
import { getAllScenarioIds, SCENARIO_LABELS } from '../scenarios/scenarioData';
import DesignPatternsCanvas from './DesignPatternsCanvas.vue';
import DesignPatternsControlPanel from './DesignPatternsControlPanel.vue';

const store = useDesignPatternsStore();
const scenarioIds = getAllScenarioIds();

onMounted(() => store.initializeScenario('strategy-pattern'));
onUnmounted(() => store.cleanup());
</script>

<style scoped>
.design-patterns-workspace { display: flex; flex-direction: column; gap: 12px; padding: 16px; background: rgba(14,23,38,0.7); backdrop-filter: blur(12px); border: 1px solid rgba(100,116,139,0.2); border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); height: 100%; overflow: hidden; }
.workspace-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.04); }
.header-badge { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; padding: 3px 8px; border-radius: 6px; }
.badge-nodes { background: rgba(6,182,212,0.1); color: #06b6d4; border: 1px solid rgba(6,182,212,0.2); }
.badge-links { background: rgba(245,158,11,0.1); color: #f59e0b; border: 1px solid rgba(245,158,11,0.2); }
.scenario-tabs { display: flex; gap: 6px; padding: 4px; background: rgba(15,23,42,0.5); border-radius: 10px; }
.scenario-tab { flex: 1; padding: 8px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .3px; color: #94a3b8; background: transparent; border: 1px solid transparent; cursor: pointer; transition: all .2s; }
.scenario-tab:hover { color: #e2e8f0; }
.scenario-tab.active { background: rgba(6,182,212,0.1); color: #06b6d4; border-color: rgba(6,182,212,0.25); }
.workspace-body { display: flex; gap: 12px; flex: 1; min-height: 0; overflow: hidden; }
.canvas-area { flex: 1; min-width: 0; }
</style>
