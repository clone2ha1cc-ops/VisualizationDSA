/**
 * useDesignPatternsStore — Pinia Setup Store
 *
 * Manages UML diagram state: nodes, links, active scenario,
 * DIP toggle, Observer notify pulse, Strategy runtime swap,
 * and coupling index metric.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UMLNode, UMLLink, PatternScenarioId } from '../types/design-patterns.types';
import { DesignPatternVisualizerEngine } from '../engine/DesignPatternVisualizerEngine';
import { getScenario } from '../scenarios/scenarioData';
import { applyDIPEnabled, applyDIPDisabled, rebuildEngine } from './dipHelpers';

export const useDesignPatternsStore = defineStore('designPatterns', () => {
  // STATE
  const nodes = ref<UMLNode[]>([]);
  const links = ref<UMLLink[]>([]);
  const activePatternId       = ref<PatternScenarioId>('strategy-pattern');
  const activeScenarioTitle   = ref('');
  const isDIPEnabled          = ref(false);
  const isObserverNotifying   = ref(false);
  const activeStrategyTargetId = ref<string>('Bubble');
  const pathCache             = ref<Map<string, string>>(new Map());

  let visualizerEngine: DesignPatternVisualizerEngine | null = null;

  // GETTERS
  const couplingIndexMetric = computed(() => {
    if (activePatternId.value === 'solid-dip') return isDIPEnabled.value ? 20 : 85;
    return 35;
  });

  const couplingLabel = computed(() => {
    const idx = couplingIndexMetric.value;
    if (idx >= 70) return 'RẤT CHẶT';
    if (idx >= 40) return 'TRUNG BÌNH';
    return 'LỎNG LẺO';
  });

  const nodeCount = computed(() => nodes.value.length);
  const linkCount = computed(() => links.value.length);

  // ACTIONS
  function recalculatePaths(): void {
    if (!visualizerEngine) return;
    pathCache.value = visualizerEngine.calculateAllPaths();
  }

  function initializeScenario(patternId: PatternScenarioId): void {
    const scenario = getScenario(patternId);
    if (!scenario) return;
    activePatternId.value     = patternId;
    activeScenarioTitle.value = scenario.title;
    isObserverNotifying.value = false;
    isDIPEnabled.value        = false;
    nodes.value = scenario.nodes.map(n => ({ ...n }));
    links.value = scenario.links.map(l => ({ ...l }));
    if (patternId === 'strategy-pattern') activeStrategyTargetId.value = 'Bubble';
    visualizerEngine = new DesignPatternVisualizerEngine(nodes.value, links.value);
    recalculatePaths();
  }

  function handleNodeDrag(nodeId: string, x: number, y: number, canvasWidth = 900, canvasHeight = 600): void {
    if (!visualizerEngine) return;
    visualizerEngine.updateNodePosition(nodeId, x, y, canvasWidth, canvasHeight);
    const node = nodes.value.find(n => n.id === nodeId);
    if (node) { const updated = visualizerEngine.getNodeById(nodeId); if (updated) { node.x = updated.x; node.y = updated.y; } }
    recalculatePaths();
  }

  function switchStrategy(targetId: string): void {
    if (!visualizerEngine || activePatternId.value !== 'strategy-pattern') return;
    activeStrategyTargetId.value = targetId;
    visualizerEngine.swapStrategyTarget('ClientToStrategy', targetId);
    const link = links.value.find(l => l.id === 'ClientToStrategy');
    if (link) link.targetId = targetId;
    recalculatePaths();
  }

  function triggerObserverNotify(): void {
    if (activePatternId.value !== 'observer-pattern') return;
    isObserverNotifying.value = true;
    setTimeout(() => { isObserverNotifying.value = false; }, 2000);
  }

  function toggleDIP(): void {
    if (activePatternId.value !== 'solid-dip') return;
    isDIPEnabled.value = !isDIPEnabled.value;
    if (isDIPEnabled.value) applyDIPEnabled(nodes, links);
    else applyDIPDisabled(nodes, links);
    visualizerEngine = rebuildEngine(nodes, links);
    recalculatePaths();
  }

  function cleanup(): void {
    visualizerEngine = null;
    nodes.value = [];
    links.value = [];
    pathCache.value = new Map();
    isObserverNotifying.value = false;
    isDIPEnabled.value = false;
  }

  return {
    nodes, links, activePatternId, activeScenarioTitle, isDIPEnabled, isObserverNotifying,
    activeStrategyTargetId, pathCache,
    couplingIndexMetric, couplingLabel, nodeCount, linkCount,
    initializeScenario, handleNodeDrag, switchStrategy, triggerObserverNotify, toggleDIP,
    recalculatePaths, cleanup,
  };
});
