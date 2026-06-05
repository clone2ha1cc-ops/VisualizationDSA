<template>
  <div class="design-patterns-workspace">
    <!-- Header -->
    <div class="workspace-header">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-accent">
          <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
        </svg>
        <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">Design Patterns & SOLID Visualizer</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="header-badge badge-nodes">{{ store.nodeCount }} Nodes</span>
        <span class="header-badge badge-links">{{ store.linkCount }} Links</span>
      </div>
    </div>

    <!-- Backend Scenario Picker -->
    <ConceptScenarioPicker
      :scenarios="backendScenarios"
      :loading="store.isVcrLoading"
      label="Backend Scenarios (VCR)"
      @select="store.loadVcrScenario($event)"
    />

    <!-- VCR Explanation Banner -->
    <VcrExplanationBanner
      v-if="store.isVcrMode && store.vcrCurrentFrame"
      :action-type="store.vcrCurrentFrame.actionType"
      :explanation="store.vcrCurrentFrame.explanation"
      :frame-key="vcrCurrentIndex"
    />

    <!-- VCR Loading / Error -->
    <div v-if="store.isVcrLoading" class="vcr-api-status vcr-loading">Loading from backend...</div>
    <div v-if="store.vcrError" class="vcr-api-status vcr-error">{{ store.vcrError }}</div>

    <!-- VCR Playback Controls -->
    <VcrControls
      v-if="store.isVcrMode"
      :current-index="vcrCurrentIndex"
      :total-frames="store.vcrTotalFrames"
      @prev="store.vcrPrev()"
      @next="store.vcrNext()"
      @reset="store.vcrReset()"
      @exit="store.exitVcrMode()"
    />

    <!-- Scenario Tabs (hidden in VCR mode) -->
    <div v-if="!store.isVcrMode" class="scenario-tabs">
      <button v-for="sid in scenarioIds" :key="sid"
        class="scenario-tab" :class="{ active: store.activePatternId === sid }"
        @click="store.initializeScenario(sid)">
        {{ SCENARIO_LABELS[sid] }}
      </button>
    </div>

    <!-- Main Content: Canvas + Control Panel (hidden in VCR mode) -->
    <div v-if="!store.isVcrMode" class="workspace-body">
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
import { onMounted, onUnmounted, computed } from 'vue';
import { useDesignPatternsStore } from '../store/useDesignPatternsStore';
import { getAllScenarioIds, SCENARIO_LABELS } from '../scenarios/scenarioData';
import DesignPatternsCanvas from './DesignPatternsCanvas.vue';
import DesignPatternsControlPanel from './DesignPatternsControlPanel.vue';
import VcrControls from '../../../components/VcrControls.vue';
import VcrExplanationBanner from '../../../components/VcrExplanationBanner.vue';
import ConceptScenarioPicker from '../../../components/ConceptScenarioPicker.vue';

const store = useDesignPatternsStore();
const scenarioIds = getAllScenarioIds();
const vcrCurrentIndex = computed(() => store.vcrCurrentIndex);

const backendScenarios = [
  { id: 'strategy-pattern', label: 'Strategy Pattern' },
  { id: 'observer-pattern', label: 'Observer Pattern' },
  { id: 'singleton-pattern', label: 'Singleton Pattern' },
];

onMounted(() => store.initializeScenario('strategy-pattern'));
onUnmounted(() => store.cleanup());
</script>

<style scoped>
.design-patterns-workspace { display: flex; flex-direction: column; gap: 12px; padding: 16px; background: var(--glass-bg); backdrop-filter: var(--glass-blur-light); border: 1px solid rgba(100,116,139,0.2); border-radius: 16px; box-shadow: var(--shadow-elevated); width: 100%; height: 100%; overflow: hidden; }
.workspace-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid var(--glass-border); }
.header-badge { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; padding: 3px 8px; border-radius: 6px; }
.badge-nodes { background: rgba(6,182,212,0.1); color: #06b6d4; border: 1px solid rgba(6,182,212,0.2); }
.badge-links { background: rgba(245,158,11,0.1); color: #f59e0b; border: 1px solid rgba(245,158,11,0.2); }
.scenario-tabs { display: flex; gap: 6px; padding: 4px; background: var(--glass-bg-card); border-radius: 10px; }
.scenario-tab { flex: 1; padding: 8px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .3px; color: #94a3b8; background: transparent; border: 1px solid transparent; cursor: pointer; transition: all var(--duration-normal); }
.scenario-tab:hover { color: #e2e8f0; }
.scenario-tab.active { background: rgba(6,182,212,0.1); color: #06b6d4; border-color: rgba(6,182,212,0.25); }
.workspace-body { display: flex; gap: 12px; flex: 1; min-height: 0; overflow: hidden; }
.canvas-area { flex: 1; min-width: 0; }

/* === API Status === */
.vcr-api-status { text-align: center; padding: 8px; border-radius: 8px; font-size: 12px; font-weight: 600; }
.vcr-loading { color: #06b6d4; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.2); }
.vcr-error { color: #ef4444; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); }
</style>
