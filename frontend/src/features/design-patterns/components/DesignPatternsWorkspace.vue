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

    <!-- Backend Scenario Picker (VCR) -->
    <div class="vcr-picker">
      <h4 class="vcr-title">Backend Scenarios (VCR)</h4>
      <div class="vcr-btn-group">
        <button v-for="scenario in backendScenarios" :key="scenario.id"
          class="vcr-btn vcr-btn-scenario" :disabled="store.isVcrLoading"
          @click="store.loadVcrScenario(scenario.id)">
          {{ scenario.label }}
        </button>
      </div>
    </div>

    <!-- VCR Explanation Banner -->
    <div v-if="store.isVcrMode && store.vcrCurrentFrame" class="vcr-banner">
      <span class="vcr-banner-action">{{ store.vcrCurrentFrame.actionType }}</span>
      <span class="vcr-banner-text">{{ store.vcrCurrentFrame.explanation }}</span>
    </div>

    <!-- VCR Loading / Error -->
    <div v-if="store.isVcrLoading" class="vcr-api-status vcr-loading">Loading from backend...</div>
    <div v-if="store.vcrError" class="vcr-api-status vcr-error">{{ store.vcrError }}</div>

    <!-- VCR Playback Controls -->
    <div v-if="store.isVcrMode" class="vcr-playback">
      <h4 class="vcr-title">VCR Playback</h4>
      <div class="vcr-row">
        <div class="vcr-btn-group">
          <button class="vcr-btn vcr-btn-nav" :disabled="vcrCurrentIndex <= 0" @click="store.vcrPrev()">◀ Prev</button>
          <button class="vcr-btn vcr-btn-nav" :disabled="vcrCurrentIndex >= store.vcrTotalFrames - 1" @click="store.vcrNext()">Next ▶</button>
          <button class="vcr-btn vcr-btn-nav" @click="store.vcrReset()">⏮ Reset</button>
        </div>
        <div class="vcr-frame-indicator">Frame {{ vcrCurrentIndex + 1 }} / {{ store.vcrTotalFrames }}</div>
        <button class="vcr-btn vcr-btn-exit" @click="store.exitVcrMode()">Exit VCR → Sandbox</button>
      </div>
    </div>

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

const store = useDesignPatternsStore();
const scenarioIds = getAllScenarioIds();
const vcrCurrentIndex = computed(() => store.vcrCurrentIndex);

interface BackendScenario { id: string; label: string; }
const backendScenarios: BackendScenario[] = [
  { id: 'strategy-pattern', label: 'Strategy Pattern' },
  { id: 'observer-pattern', label: 'Observer Pattern' },
  { id: 'singleton-pattern', label: 'Singleton Pattern' },
];

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

/* === VCR Scenario Picker === */
.vcr-picker { background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px; padding: 12px 16px; backdrop-filter: blur(8px); }
.vcr-title { color: #a78bfa; font-size: 12px; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px; }
.vcr-btn-group { display: flex; gap: 8px; flex-wrap: wrap; }
.vcr-btn { padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #94a3b8; }
.vcr-btn:hover:not(:disabled) { background: rgba(255,255,255,0.1); }
.vcr-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.vcr-btn-scenario { color: #a78bfa; border-color: rgba(167, 139, 250, 0.3); }

/* === VCR Playback Controls === */
.vcr-playback { background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(167, 139, 250, 0.3); border-radius: 12px; padding: 12px 16px; backdrop-filter: blur(8px); }
.vcr-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.vcr-btn-nav { color: #c4b5fd; border-color: rgba(196, 181, 253, 0.3); }
.vcr-frame-indicator { font-size: 12px; color: #a78bfa; font-weight: 600; padding: 4px 10px; background: rgba(139, 92, 246, 0.1); border-radius: 6px; }
.vcr-btn-exit { color: #f97316; border-color: rgba(249, 115, 22, 0.3); margin-left: auto; }

/* === Explanation Banner === */
.vcr-banner { background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 10px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; }
.vcr-banner-action { font-size: 11px; font-weight: 700; color: #a78bfa; background: rgba(139, 92, 246, 0.2); padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
.vcr-banner-text { font-size: 13px; color: #cbd5e1; }

/* === API Status === */
.vcr-api-status { text-align: center; padding: 8px; border-radius: 8px; font-size: 12px; font-weight: 600; }
.vcr-loading { color: #06b6d4; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.2); }
.vcr-error { color: #ef4444; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); }
</style>
