<template>
  <div class="state-inspector bg-[#0e1726]/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
    
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-slate-800 pb-4">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-indigo-400">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        <span class="text-xs font-bold uppercase tracking-wider text-slate-300">State Inspector: Stack-Heap & DSL</span>
      </div>
      <div class="flex gap-1.5">
        <span class="text-[10px] font-bold uppercase tracking-wider bg-indigo-950/40 text-indigo-400 border border-indigo-800/40 px-2 py-1 rounded-lg">
          Sprint 10
        </span>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 p-1 bg-slate-900/50 rounded-lg">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        class="flex-1 px-3 py-2 rounded-md text-[11px] font-bold uppercase transition-all"
        :class="activeTab === tab.id ? 'bg-indigo-900/50 text-indigo-400 border border-indigo-700/40' : 'text-slate-400 hover:text-slate-200'"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- Tab 1: 3D Stack-Heap Visualization -->
    <div v-if="activeTab === 'visualization'" class="space-y-4">
      <div class="flex gap-2 mb-4">
        <button 
          v-for="scenario in scenarios" 
          :key="scenario"
          @click="runScenario(scenario)"
          class="px-3 py-1.5 bg-indigo-950/40 border border-indigo-700/40 text-indigo-400 text-[10px] font-bold rounded-lg hover:bg-indigo-900/40 transition-all"
        >
          {{ scenario }}
        </button>
        <button 
          @click="resetVisualization"
          class="px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-bold rounded-lg hover:bg-slate-700 transition-all"
        >
          Reset
        </button>
      </div>

      <!-- Stack-Heap Canvas -->
      <div class="relative h-[300px] bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800">
        <!-- SVG Layer for Pointers -->
        <svg class="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <marker id="arrowhead-indigo" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1"/>
            </marker>
          </defs>
          <path
            v-for="(ptr, idx) in pointerPaths" 
            :key="idx"
            :d="ptr.path"
            stroke="#6366f1"
            stroke-width="2"
            fill="none"
            stroke-dasharray="5,3"
            marker-end="url(#arrowhead-indigo)"
            class="opacity-70"
          />
        </svg>

        <!-- Stack Frames -->
        <div class="absolute left-4 top-4 flex flex-col gap-2">
          <div class="text-[10px] font-bold uppercase text-slate-500 mb-1">Call Stack</div>
          <div 
            v-for="(frame, idx) in stackFrames" 
            :key="frame.id"
            class="w-40 p-3 rounded-lg border transition-all"
            :class="idx === stackFrames.length - 1 ? 'bg-indigo-900/40 border-indigo-700/50' : 'bg-slate-800/50 border-slate-700/30'"
            :style="{ transform: `translateZ(${frame.position.z}px)` }"
          >
            <div class="text-xs font-bold text-indigo-400">{{ frame.functionName }}</div>
            <div class="text-[9px] text-slate-500">Frame #{{ frame.depth }}</div>
            <div v-if="frame.localVars.length > 0" class="mt-2 space-y-1">
              <div 
                v-for="v in frame.localVars" 
                :key="v.name"
                class="text-[9px] flex items-center gap-1"
              >
                <span class="text-slate-400">{{ v.name }}:</span>
                <span :class="v.isPointer ? 'text-indigo-400' : 'text-emerald-400'">{{ v.value }}</span>
                <span v-if="v.isPointer" class="text-[8px] text-indigo-500">(ptr)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Heap Nodes -->
        <div class="absolute right-4 top-4 flex flex-col gap-2">
          <div class="text-[10px] font-bold uppercase text-slate-500 mb-1">Heap Memory</div>
          <div 
            v-for="node in heapNodes" 
            :key="node.id"
            class="w-36 p-2 rounded-lg border bg-amber-900/30 border-amber-700/40"
          >
            <div class="text-xs font-bold text-amber-400">{{ node.type }}</div>
            <div class="text-[9px] text-slate-500">{{ node.size }} bytes</div>
            <div v-if="node.references > 0" class="text-[9px] text-amber-500">
              {{ node.references }} reference(s)
            </div>
          </div>
        </div>
      </div>

      <!-- Memory Stats -->
      <div class="grid grid-cols-3 gap-3">
        <div class="p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-center">
          <div class="text-lg font-bold text-indigo-400">{{ stackFrames.length }}</div>
          <div class="text-[9px] text-slate-500 uppercase">Stack Frames</div>
        </div>
        <div class="p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-center">
          <div class="text-lg font-bold text-amber-400">{{ heapNodes.length }}</div>
          <div class="text-[9px] text-slate-500 uppercase">Heap Objects</div>
        </div>
        <div class="p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-center">
          <div class="text-lg font-bold text-emerald-400">{{ pointerPaths.length }}</div>
          <div class="text-[9px] text-slate-500 uppercase">Active Pointers</div>
        </div>
      </div>
    </div>

    <!-- Tab 2: DSL Compiler -->
    <div v-if="activeTab === 'dsl'" class="space-y-4">
      <div class="flex gap-2 mb-2">
        <button 
          v-for="(script, name) in sampleScripts" 
          :key="name"
          @click="loadScript(script)"
          class="px-3 py-1.5 bg-indigo-950/40 border border-indigo-700/40 text-indigo-400 text-[10px] font-bold rounded-lg hover:bg-indigo-900/40 transition-all"
        >
          {{ name }}
        </button>
      </div>

      <!-- DSL Editor -->
      <textarea 
        v-model="dslScript"
        rows="6"
        class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 resize-none"
        placeholder="# DSL Commands:
# CALL functionName
# ALLOC nodeId size type
# PUSH frameId varName value
# LINK frameId.varName -> heapId
# FREE heapId
# RETURN value
# POP frameId"
      />

      <div class="flex gap-2">
        <button 
          @click="compileDSL"
          class="px-4 py-2 bg-emerald-950/40 border border-emerald-700/40 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-900/40 transition-all"
        >
          Compile DSL
        </button>
        <button 
          @click="stepDSL"
          :disabled="!dslResult?.success || currentStep >= (dslResult.frames?.length || 0)"
          class="px-4 py-2 bg-indigo-950/40 border border-indigo-700/40 text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-900/40 transition-all disabled:opacity-50"
        >
          Step {{ currentStep + 1 }}/{{ dslResult?.frames?.length || 0 }}
        </button>
        <button 
          @click="resetDSL"
          class="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold rounded-lg hover:bg-slate-700 transition-all"
        >
          Reset
        </button>
      </div>

      <!-- DSL Result -->
      <div v-if="dslResult" class="space-y-3">
        <div 
          class="p-3 rounded-lg border"
          :class="dslResult.success ? 'bg-emerald-950/30 border-emerald-800/40' : 'bg-red-950/30 border-red-800/40'"
        >
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ dslResult.success ? '✅' : '❌' }}</span>
            <span class="text-sm font-bold" :class="dslResult.success ? 'text-emerald-400' : 'text-red-400'">
              {{ dslResult.success ? 'Compiled Successfully' : 'Compilation Failed' }}
            </span>
            <span v-if="dslResult.success" class="text-[10px] text-slate-400 ml-auto">
              {{ dslResult.commandCount }} commands • {{ dslResult.executionTimeMs.toFixed(2) }}ms
            </span>
          </div>
          <div v-if="dslResult.error" class="text-xs text-red-300 mt-2">
            {{ dslResult.error }}
          </div>
        </div>

        <!-- Current Frame Description -->
        <div v-if="currentFrame" class="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-lg">
          <div class="text-[10px] font-bold uppercase text-indigo-400 mb-1">Current Step</div>
          <div class="text-xs text-slate-300">{{ currentFrame.description }}</div>
          <div class="text-[9px] text-slate-500 mt-1 font-mono">{{ currentFrame.command.raw }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  CallStackEngine,
  type StackFrame3D,
  type HeapNode3D,
} from '../CallStackEngine';
import {
  DSLEngine,
  type DSLCompileResult,
  type DSLAnimationFrame,
} from '../DSLEngine';

// Tabs
const tabs = [
  { id: 'visualization', name: '3D Stack-Heap' },
  { id: 'dsl', name: 'DSL Compiler' },
];
const activeTab = ref('visualization');

// ============================================
// VISUALIZATION TAB
// ============================================
const scenarios = ['Simple Call', 'Linked List', 'Complex'];
const stackFrames = ref<StackFrame3D[]>([]);
const heapNodes = ref<HeapNode3D[]>([]);
const pointerPaths = ref<Array<{ path: string }>>([]);

function runScenario(scenario: string): void {
  switch (scenario) {
    case 'Simple Call':
      CallStackEngine.runSampleScenario('function-call');
      break;
    case 'Linked List':
      CallStackEngine.runSampleScenario('linked-list');
      break;
    case 'Complex':
      CallStackEngine.runSampleScenario('complex');
      break;
  }
  updateVisualization();
}

function resetVisualization(): void {
  CallStackEngine.reset();
  updateVisualization();
}

function updateVisualization(): void {
  const state = CallStackEngine.getCurrentState();
  stackFrames.value = state.stackFrames;
  heapNodes.value = state.heapNodes;
  pointerPaths.value = CallStackEngine.getAllPointerPaths();
}

// ============================================
// DSL TAB
// ============================================
const dslScript = ref(`# Simple function call example
CALL main
CALL calculate a 10 b 20
ALLOC result 16 Result
PUSH frame-2 sum 30
LINK frame-2.ptr -> result
RETURN result
POP frame-2
POP frame-1`);

const sampleScripts = DSLEngine.getSampleScripts();
const dslResult = ref<DSLCompileResult | null>(null);
const currentStep = ref(0);
const currentFrame = ref<DSLAnimationFrame | null>(null);

function loadScript(script: string): void {
  dslScript.value = script;
}

function compileDSL(): void {
  dslResult.value = DSLEngine.compile(dslScript.value);
  currentStep.value = 0;
  if (dslResult.value.success && dslResult.value.frames) {
    currentFrame.value = dslResult.value.frames[0];
  }
}

function stepDSL(): void {
  if (!dslResult.value?.success || !dslResult.value.frames) return;
  
  if (currentStep.value < dslResult.value.frames.length - 1) {
    currentStep.value++;
    currentFrame.value = dslResult.value.frames[currentStep.value];
  }
}

function resetDSL(): void {
  currentStep.value = 0;
  currentFrame.value = null;
}

// Init
onMounted(() => {
  runScenario('Simple Call');
});
</script>

<style scoped>
.state-inspector {
  transition: all 0.3s ease;
}
</style>
