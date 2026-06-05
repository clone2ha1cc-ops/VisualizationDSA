<template>
  <div class="solid-workspace-panel">
    <!-- Header -->
    <div class="sandbox-header">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="icon-warning">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">
          SOLID Principles Visualizer — Phase 2
        </span>
      </div>
      <div class="flex gap-1.5">
        <span class="sprint-badge srp">Thermal SRP</span>
        <span class="sprint-badge lsp">Laser LSP</span>
        <span class="sprint-badge dip">Neon DIP</span>
      </div>
    </div>

    <!-- Backend Scenario Picker -->
    <div class="scenario-picker">
      <h4 class="control-title">Backend Scenarios (VCR)</h4>
      <div class="btn-group">
        <button
          v-for="scenario in solidScenarios"
          :key="scenario.id"
          class="ctrl-btn btn-scenario"
          :disabled="store.isVcrLoading"
          @click="store.loadVcrScenario(scenario.id)"
        >
          {{ scenario.label }}
        </button>
      </div>
    </div>

    <!-- VCR Explanation Banner -->
    <div
      v-if="store.isVcrMode && store.vcrCurrentFrame"
      class="scenario-banner"
    >
      <span class="banner-action">{{ store.vcrCurrentFrame.actionType }}</span>
      <span class="banner-text">{{ store.vcrCurrentFrame.explanation }}</span>
    </div>

    <!-- VCR Loading / Error -->
    <div v-if="store.isVcrLoading" class="api-status loading">Loading from backend...</div>
    <div v-if="store.vcrError" class="api-status error">{{ store.vcrError }}</div>

    <!-- VCR Playback Controls -->
    <div v-if="store.isVcrMode" class="vcr-controls">
      <h4 class="control-title">VCR Playback</h4>
      <div class="vcr-row">
        <div class="btn-group">
          <button class="ctrl-btn btn-vcr" :disabled="vcrCurrentIndex <= 0" @click="store.vcrPrev()">◀ Prev</button>
          <button class="ctrl-btn btn-vcr" :disabled="vcrCurrentIndex >= store.vcrTotalFrames - 1" @click="store.vcrNext()">Next ▶</button>
          <button class="ctrl-btn btn-vcr" @click="store.vcrReset()">⏮ Reset</button>
        </div>
        <div class="frame-indicator">Frame {{ vcrCurrentIndex + 1 }} / {{ store.vcrTotalFrames }}</div>
        <button class="ctrl-btn btn-exit-vcr" @click="store.exitVcrMode()">Exit VCR → Sandbox</button>
      </div>
    </div>

    <!-- Lesson Selector Tabs (hidden in VCR mode) -->
    <div v-if="!store.isVcrMode" class="flex gap-2">
      <button
        v-for="lesson in lessons"
        :key="lesson.id"
        class="lesson-tab-btn"
        :class="{ 'active': store.activeLesson === lesson.id }"
        @click="store.setLesson(lesson.id)"
      >
        {{ lesson.label }}
      </button>
    </div>

    <!-- Active Lesson Panel (hidden in VCR mode) -->
    <div v-if="!store.isVcrMode" class="flex-1">
      <!-- SRP Lesson -->
      <SRPLessonPanel
        v-if="store.activeLesson === 'SRP'"
        :class-nodes="store.classNodes"
        :has-overheated="store.hasOverheatedNodes"
        :is-split="store.isSRPSplit"
        :diagnostic-result="store.lastDiagnosticResult"
        @split="onSRPSplit"
      />

      <!-- LSP Lesson -->
      <LSPLessonPanel
        v-else-if="store.activeLesson === 'LSP'"
        :lsp-phase="store.lspPhase"
        :diagnostic-result="store.lastDiagnosticResult"
        @run-violation="store.executeLSPSubstitution(true)"
        @run-valid="store.executeLSPSubstitution(false)"
      />

      <!-- DIP Lesson -->
      <DIPLessonPanel
        v-else-if="store.activeLesson === 'DIP'"
        :is-violating="store.dipState.isViolatingDIP"
        :has-interface="store.dipState.hasInterfaceInserted"
        :diagnostic-result="store.lastDiagnosticResult"
        @insert-interface="store.insertDIPInterface()"
        @reset-d-i-p="store.resetDIP()"
      />

      <!-- Placeholder for OCP/ISP -->
      <div
        v-else
        class="placeholder-panel"
      >
        <span class="text-xs text-text-disabled font-bold uppercase tracking-wider">
          {{ store.activeLessonLabel }} — Coming Soon
        </span>
      </div>
    </div>

    <!-- Footer Controls -->
    <div class="footer-controls">
      <div class="flex items-center gap-2">
        <span class="status-dot" />
        <span class="text-[10px] text-text-muted font-medium">
          Bài học: {{ store.activeLessonLabel }}
        </span>
        <span class="text-[10px] text-text-disabled">|</span>
        <span class="text-[10px] text-text-muted font-medium">
          Nodes: {{ store.totalNodes }}
        </span>
      </div>
      <button
        class="reset-btn"
        @click="store.resetAll()"
      >
        Reset All
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { useSOLIDVisualizerStore } from '../store/useSOLIDVisualizerStore';
import type { SOLIDPrinciple } from '../types/solid-visualization.types';
import SRPLessonPanel from './SRPLessonPanel.vue';
import LSPLessonPanel from './LSPLessonPanel.vue';
import DIPLessonPanel from './DIPLessonPanel.vue';

const store = useSOLIDVisualizerStore();
const vcrCurrentIndex = computed(() => store.vcrCurrentIndex);

interface ScenarioEntry { id: string; label: string; }
const solidScenarios: ScenarioEntry[] = [
  { id: 'srp', label: 'SRP — God Class' },
  { id: 'ocp', label: 'OCP — Open/Closed' },
  { id: 'lsp', label: 'LSP — Substitution' },
];

interface LessonTab {
  id: SOLIDPrinciple;
  label: string;
}

const lessons: LessonTab[] = [
  { id: 'SRP', label: 'SRP' },
  { id: 'OCP', label: 'OCP' },
  { id: 'LSP', label: 'LSP' },
  { id: 'ISP', label: 'ISP' },
  { id: 'DIP', label: 'DIP' },
];

onMounted(() => {
  store.initializeDemoData();
});

onUnmounted(() => {
  store.destroyStore();
});

function onSRPSplit(nodeId: string): void {
  store.triggerSRPSplit(nodeId);
}
</script>

<style scoped>
.solid-workspace-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background-color: color-mix(in srgb, var(--vis-panel-bg) 70%, transparent);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid color-mix(in srgb, var(--color-border-subtle) 80%, transparent);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  position: relative;
}

.sandbox-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-b: 1px solid var(--color-border-subtle);
  padding-bottom: 16px;
}

.icon-warning {
  color: var(--color-accent-yellow);
}

.sprint-badge {
  font-size: 10px;
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
}

.sprint-badge.srp {
  background-color: var(--color-accent-red-dim);
  color: var(--color-accent-red);
  border-color: color-mix(in srgb, var(--color-accent-red) 40%, transparent);
}

.sprint-badge.lsp {
  background-color: var(--color-accent-yellow-dim);
  color: var(--color-accent-yellow);
  border-color: color-mix(in srgb, var(--color-accent-yellow) 40%, transparent);
}

.sprint-badge.dip {
  background-color: var(--color-accent-green-dim);
  color: var(--color-accent-green);
  border-color: color-mix(in srgb, var(--color-accent-green) 40%, transparent);
}

.lesson-tab-btn {
  padding: 8px 16px;
  border-radius: var(--radius-xl);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: var(--transition-smooth);
  background-color: color-mix(in srgb, var(--color-bg-secondary) 40%, transparent);
  color: var(--color-text-muted);
  border: 1px solid color-mix(in srgb, var(--color-border-subtle) 40%, transparent);
}

.lesson-tab-btn:hover {
  color: var(--color-text-secondary);
  border-color: var(--color-border-default);
}

.lesson-tab-btn.active {
  background-color: var(--color-bg-active);
  color: var(--color-text-primary);
  border-color: var(--color-border-strong);
}

.placeholder-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 160px;
  background-color: color-mix(in srgb, var(--color-bg-secondary) 30%, transparent);
  border-radius: var(--radius-xl);
  border: 1px solid color-mix(in srgb, var(--color-border-subtle) 40%, transparent);
}

.footer-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-t: 1px solid var(--color-border-subtle);
  padding-top: 16px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background-color: var(--color-accent-primary);
}

.reset-btn {
  padding: 8px 16px;
  border-radius: var(--radius-xl);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: color-mix(in srgb, var(--color-bg-surface) 40%, transparent);
  color: var(--color-text-secondary);
  border: 1px solid color-mix(in srgb, var(--color-border-default) 40%, transparent);
  cursor: pointer;
  transition: var(--transition-smooth);
}

.reset-btn:hover {
  background-color: color-mix(in srgb, var(--color-bg-active) 60%, transparent);
  color: var(--color-text-primary);
}

/* === VCR Scenario Picker === */
.scenario-picker { background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px; padding: 16px; backdrop-filter: blur(8px); }
.scenario-picker .control-title { color: #a78bfa; font-size: 13px; font-weight: 600; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; }
.btn-group { display: flex; gap: 8px; flex-wrap: wrap; }
.ctrl-btn { padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #94a3b8; }
.ctrl-btn:hover:not(:disabled) { background: rgba(255,255,255,0.1); }
.ctrl-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-scenario { color: #a78bfa; border-color: rgba(167, 139, 250, 0.3); }

/* === VCR Playback Controls === */
.vcr-controls { background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(167, 139, 250, 0.3); border-radius: 12px; padding: 16px; backdrop-filter: blur(8px); }
.vcr-controls .control-title { color: #a78bfa; font-size: 13px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px; }
.vcr-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.btn-vcr { color: #c4b5fd; border-color: rgba(196, 181, 253, 0.3); }
.frame-indicator { font-size: 12px; color: #a78bfa; font-weight: 600; padding: 4px 10px; background: rgba(139, 92, 246, 0.1); border-radius: 6px; }
.btn-exit-vcr { color: #f97316; border-color: rgba(249, 115, 22, 0.3); margin-left: auto; }

/* === Explanation Banner === */
.scenario-banner { background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 10px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; }
.banner-action { font-size: 11px; font-weight: 700; color: #a78bfa; background: rgba(139, 92, 246, 0.2); padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
.banner-text { font-size: 13px; color: #cbd5e1; }

/* === API Status === */
.api-status { text-align: center; padding: 8px; border-radius: 8px; font-size: 12px; font-weight: 600; }
.api-status.loading { color: #06b6d4; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.2); }
.api-status.error { color: #ef4444; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); }
</style>
