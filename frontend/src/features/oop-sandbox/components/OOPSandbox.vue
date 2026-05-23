<template>
  <div class="oop-sandbox bg-[#0e1726]/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
    
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-slate-800 pb-4">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-purple-400">
          <polygon points="12 2 2 7 12 12 22 7 12 2"/>
          <polyline points="2 17 12 22 22 17"/>
          <polyline points="2 12 12 17 22 12"/>
        </svg>
        <span class="text-xs font-bold uppercase tracking-wider text-slate-300">OOP Sandbox & VTable Visualizer</span>
      </div>
      <div class="flex gap-1.5">
        <span class="text-[10px] font-bold uppercase tracking-wider bg-purple-950/40 text-purple-400 border border-purple-800/40 px-2 py-1 rounded-lg">
          Sprint 6
        </span>
      </div>
    </div>

    <!-- Class UML Cards -->
    <div class="flex flex-col gap-4">
      <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
        Sơ đồ lớp kế thừa (Class Hierarchy)
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Shape Base Class -->
        <div class="class-card bg-[#070b13]/80 border border-slate-700/50 rounded-xl overflow-hidden">
          <div class="class-header bg-gradient-to-r from-emerald-900/50 to-emerald-800/30 border-b border-emerald-700/30 px-4 py-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-emerald-400">Shape</span>
              <span class="text-[10px] font-mono text-slate-500">Base Class</span>
            </div>
          </div>
          <div class="p-4 space-y-3">
            <div class="space-y-1">
              <div class="text-[10px] font-bold uppercase text-slate-500">Fields</div>
              <div class="flex items-center gap-2 text-xs p-1 hover:bg-slate-800/30 rounded">
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-950/50 text-green-400 border border-green-800/30">public</span>
                <span class="text-slate-300">x: number</span>
              </div>
              <div class="flex items-center gap-2 text-xs p-1 hover:bg-slate-800/30 rounded">
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-950/50 text-green-400 border border-green-800/30">public</span>
                <span class="text-slate-300">y: number</span>
              </div>
              <div class="flex items-center gap-2 text-xs p-1 hover:bg-slate-800/30 rounded">
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-yellow-950/50 text-yellow-400 border border-yellow-800/30">protected</span>
                <span class="text-slate-300">color: string</span>
              </div>
            </div>
            <div class="h-px bg-slate-800"></div>
            <div class="space-y-1">
              <div class="text-[10px] font-bold uppercase text-slate-500">Methods</div>
              <button 
                class="w-full flex items-center gap-2 text-xs p-1.5 rounded transition-all text-left"
                :class="selectedMethod === 'Shape.area' ? 'bg-emerald-900/40 border border-emerald-700/40' : 'hover:bg-slate-800/50'"
                @click="selectMethod('Shape', 'area')"
              >
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-950/50 text-green-400 border border-green-800/30">public</span>
                <span class="text-slate-300">area(): number</span>
              </button>
              <button 
                class="w-full flex items-center gap-2 text-xs p-1.5 rounded transition-all text-left"
                :class="selectedMethod === 'Shape.draw' ? 'bg-emerald-900/40 border border-emerald-700/40' : 'hover:bg-slate-800/50'"
                @click="selectMethod('Shape', 'draw')"
              >
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-950/50 text-green-400 border border-green-800/30">public</span>
                <span class="text-slate-300">draw(): void</span>
                <span class="text-[10px] text-purple-400 ml-auto">virtual</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Circle Derived Class -->
        <div class="class-card bg-[#070b13]/80 border border-purple-700/30 rounded-xl overflow-hidden relative">
          <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500"></div>
          <div class="class-header bg-gradient-to-r from-purple-900/50 to-purple-800/30 border-b border-purple-700/30 px-4 py-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-purple-400">Circle</span>
              <span class="text-[10px] font-mono text-slate-500">extends Shape</span>
            </div>
          </div>
          <div class="p-4 space-y-3">
            <div class="space-y-1">
              <div class="text-[10px] font-bold uppercase text-slate-500">Fields</div>
              <button 
                class="w-full flex items-center gap-2 text-xs p-1 rounded transition-all text-left"
                :class="accessViolation?.memberName === 'radius' ? 'bg-red-900/40 border border-red-700/50 animate-pulse' : 'hover:bg-slate-800/30'"
                @click="tryAccessPrivate('radius')"
              >
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-950/50 text-red-400 border border-red-800/30">private</span>
                <span class="text-slate-300">radius: number</span>
                <svg v-if="accessViolation?.memberName === 'radius'" class="w-4 h-4 text-red-400 ml-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </button>
              <div class="flex items-center gap-2 text-xs p-1 hover:bg-slate-800/30 rounded">
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-950/50 text-red-400 border border-red-800/30">private</span>
                <span class="text-slate-300">pi: number = 3.14</span>
              </div>
            </div>
            <div class="h-px bg-slate-800"></div>
            <div class="space-y-1">
              <div class="text-[10px] font-bold uppercase text-slate-500">Methods (Override)</div>
              <button 
                class="w-full flex items-center gap-2 text-xs p-1.5 rounded transition-all text-left"
                :class="selectedMethod === 'Circle.area' ? 'bg-purple-900/40 border border-purple-700/40' : 'hover:bg-slate-800/50'"
                @click="selectMethod('Circle', 'area')"
              >
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-950/50 text-green-400 border border-green-800/30">public</span>
                <span class="text-slate-300">area(): number</span>
                <span class="text-[10px] text-purple-400 ml-auto">@Override</span>
              </button>
              <button 
                class="w-full flex items-center gap-2 text-xs p-1.5 rounded transition-all text-left"
                :class="selectedMethod === 'Circle.draw' ? 'bg-purple-900/40 border border-purple-700/40' : 'hover:bg-slate-800/50'"
                @click="selectMethod('Circle', 'draw')"
              >
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-950/50 text-green-400 border border-green-800/30">public</span>
                <span class="text-slate-300">draw(): void</span>
                <span class="text-[10px] text-purple-400 ml-auto">@Override</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Rectangle Derived Class -->
        <div class="class-card bg-[#070b13]/80 border border-cyan-700/30 rounded-xl overflow-hidden relative">
          <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
          <div class="class-header bg-gradient-to-r from-cyan-900/50 to-cyan-800/30 border-b border-cyan-700/30 px-4 py-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-cyan-400">Rectangle</span>
              <span class="text-[10px] font-mono text-slate-500">extends Shape</span>
            </div>
          </div>
          <div class="p-4 space-y-3">
            <div class="space-y-1">
              <div class="text-[10px] font-bold uppercase text-slate-500">Fields</div>
              <div class="flex items-center gap-2 text-xs p-1 hover:bg-slate-800/30 rounded">
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-950/50 text-red-400 border border-red-800/30">private</span>
                <span class="text-slate-300">width: number</span>
              </div>
              <div class="flex items-center gap-2 text-xs p-1 hover:bg-slate-800/30 rounded">
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-950/50 text-red-400 border border-red-800/30">private</span>
                <span class="text-slate-300">height: number</span>
              </div>
            </div>
            <div class="h-px bg-slate-800"></div>
            <div class="space-y-1">
              <div class="text-[10px] font-bold uppercase text-slate-500">Methods (Override)</div>
              <button 
                class="w-full flex items-center gap-2 text-xs p-1.5 rounded transition-all text-left"
                :class="selectedMethod === 'Rectangle.area' ? 'bg-cyan-900/40 border border-cyan-700/40' : 'hover:bg-slate-800/50'"
                @click="selectMethod('Rectangle', 'area')"
              >
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-950/50 text-green-400 border border-green-800/30">public</span>
                <span class="text-slate-300">area(): number</span>
                <span class="text-[10px] text-cyan-400 ml-auto">@Override</span>
              </button>
              <button 
                class="w-full flex items-center gap-2 text-xs p-1.5 rounded transition-all text-left"
                :class="selectedMethod === 'Rectangle.draw' ? 'bg-cyan-900/40 border border-cyan-700/40' : 'hover:bg-slate-800/50'"
                @click="selectMethod('Rectangle', 'draw')"
              >
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-950/50 text-green-400 border border-green-800/30">public</span>
                <span class="text-slate-300">draw(): void</span>
                <span class="text-[10px] text-cyan-400 ml-auto">@Override</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- VTable & Heap Visualization -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- VTable Dispatch Panel -->
      <div class="vtable-panel bg-[#070b13]/60 border border-slate-800 rounded-xl p-4">
        <div class="flex items-center justify-between mb-4">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <svg class="w-4 h-4 text-purple-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3v18h18"/>
              <path d="M18 17V9"/>
              <path d="M13 17V5"/>
              <path d="M8 17v-3"/>
            </svg>
            VTable Dispatch Map
          </div>
          <button 
            @click="instantiateObject"
            class="px-3 py-1.5 bg-purple-950/40 border border-purple-700/40 text-purple-400 text-[10px] font-bold rounded-lg hover:bg-purple-900/40 transition-all"
          >
            + new Circle()
          </button>
        </div>

        <!-- VTable Display -->
        <div class="space-y-2">
          <div 
            v-for="(entry, methodName) in vTableDisplay" 
            :key="methodName"
            class="flex items-center justify-between p-2 rounded border text-xs"
            :class="selectedMethod && selectedMethod.endsWith(methodName as string) ? 'bg-purple-900/30 border-purple-700/40' : 'bg-slate-900/50 border-slate-800'"
          >
            <div class="flex items-center gap-2">
              <span class="text-slate-400 font-mono">{{ methodName }}()</span>
              <span class="text-[10px] text-slate-500">→</span>
              <span 
                class="font-bold"
                :class="entry.resolvedClass === 'Circle' ? 'text-purple-400' : entry.resolvedClass === 'Rectangle' ? 'text-cyan-400' : 'text-emerald-400'"
              >
                {{ entry.resolvedClass }}
              </span>
            </div>
            <span 
              class="text-[9px] px-1.5 py-0.5 rounded"
              :class="entry.isOverridden ? 'bg-purple-950/50 text-purple-400' : 'bg-slate-800 text-slate-500'"
            >
              {{ entry.isOverridden ? 'overridden' : 'inherited' }}
            </span>
          </div>
        </div>

        <!-- Dispatch Animation -->
        <div v-if="dispatchResult" class="mt-4 p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
          <div class="text-[10px] font-bold uppercase text-slate-500 mb-2">Dynamic Dispatch Result</div>
          <div class="flex items-center gap-2 text-xs">
            <span class="text-slate-400">Call:</span>
            <span class="text-cyan-400 font-mono">shape.{{ dispatchResult.methodName }}()</span>
          </div>
          <div class="flex items-center gap-2 mt-1 text-xs">
            <span class="text-slate-400">Resolved to:</span>
            <span class="text-purple-400 font-bold">{{ dispatchResult.actualImplementation }}</span>
          </div>
          <div class="flex items-center gap-1 mt-2">
            <span class="text-[10px] text-slate-500">Path:</span>
            <span 
              v-for="(cls, idx) in dispatchResult.dispatchPath" 
              :key="idx"
              class="text-[10px] px-1.5 py-0.5 rounded"
              :class="cls === 'Shape' ? 'bg-emerald-950/50 text-emerald-400' : cls === 'Circle' ? 'bg-purple-950/50 text-purple-400' : 'bg-cyan-950/50 text-cyan-400'"
            >
              {{ cls }}
            </span>
          </div>
        </div>
      </div>

      <!-- Heap Instances Panel -->
      <div class="heap-panel bg-[#070b13]/60 border border-slate-800 rounded-xl p-4">
        <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-4">
          <svg class="w-4 h-4 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
          Heap Memory Allocator
        </div>

        <div v-if="heapInstances.length === 0" class="text-center py-8 text-slate-500 text-xs">
          Chưa có object nào trên Heap. Click "+ new Circle()" để khởi tạo.
        </div>

        <div v-else class="space-y-2">
          <div 
            v-for="instance in heapInstances" 
            :key="instance.address"
            class="p-3 bg-slate-900/50 border border-slate-800 rounded-lg"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono text-amber-400">{{ instance.address }}</span>
                <span 
                  class="text-xs font-bold"
                  :class="instance.className === 'Circle' ? 'text-purple-400' : instance.className === 'Rectangle' ? 'text-cyan-400' : 'text-emerald-400'"
                >
                  {{ instance.className }}
                </span>
              </div>
              <button 
                @click="removeInstance(instance.address)"
                class="text-[10px] text-rose-400 hover:text-rose-300 px-2 py-0.5 rounded hover:bg-rose-950/30 transition-all"
              >
                ×
              </button>
            </div>
            <div class="mt-2 flex flex-wrap gap-1">
              <span 
                v-for="[fieldName] in instance.fieldsData" 
                :key="fieldName"
                class="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400"
              >
                {{ fieldName }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Access Violation Alert -->
    <div 
      v-if="accessViolation"
      class="p-4 bg-red-950/30 border border-red-700/40 rounded-xl animate-pulse"
    >
      <div class="flex items-center gap-2 text-red-400">
        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" x2="12" y1="8" y2="12"/>
          <line x1="12" x2="12.01" y1="16" y2="16"/>
        </svg>
        <span class="text-sm font-bold">VI PHẠM ĐÓNG GÓI!</span>
      </div>
      <p class="text-xs text-red-300 mt-1">{{ accessViolation.message }}</p>
      <button 
        @click="accessViolation = null"
        class="mt-2 px-3 py-1 bg-red-900/50 text-red-300 text-[10px] font-bold rounded hover:bg-red-800/50 transition-all"
      >
        Đóng cảnh báo
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  OOPReflectionEngine,
  type HeapObjectInstance,
  type MethodDispatchResult,
  type AccessCheckResult,
} from '../OOPReflectionEngine';

// State
const heapInstances = ref<HeapObjectInstance[]>([]);
const selectedMethod = ref<string | null>(null);
const dispatchResult = ref<MethodDispatchResult | null>(null);
const accessViolation = ref<AccessCheckResult | null>(null);

// VTable display data
const vTableDisplay = computed(() => {
  const display: Record<string, { resolvedClass: string; isOverridden: boolean }> = {};
  
  // Build VTable for Circle
  const circleDef = OOPReflectionEngine.getClass('Circle');
  if (circleDef) {
    // Add Shape methods first (inherited)
    const shapeDef = OOPReflectionEngine.getClass('Shape');
    if (shapeDef) {
      shapeDef.members
        .filter(m => m.type === 'METHOD')
        .forEach(m => {
          display[m.name] = { resolvedClass: 'Shape', isOverridden: false };
        });
    }
    // Override with Circle methods
    circleDef.members
      .filter(m => m.type === 'METHOD')
      .forEach(m => {
        const inherited = display[m.name];
        display[m.name] = { 
          resolvedClass: 'Circle', 
          isOverridden: inherited !== undefined 
        };
      });
  }
  
  return display;
});

// Initialize classes
onMounted(() => {
  // Register base Shape class
  OOPReflectionEngine.registerClass({
    className: 'Shape',
    members: [
      { name: 'x', type: 'FIELD', accessModifier: 'PUBLIC' },
      { name: 'y', type: 'FIELD', accessModifier: 'PUBLIC' },
      { name: 'color', type: 'FIELD', accessModifier: 'PROTECTED' },
      { name: 'area', type: 'METHOD', accessModifier: 'PUBLIC' },
      { name: 'draw', type: 'METHOD', accessModifier: 'PUBLIC' },
    ],
  });

  // Register Circle class
  OOPReflectionEngine.registerClass({
    className: 'Circle',
    parentClass: 'Shape',
    members: [
      { name: 'radius', type: 'FIELD', accessModifier: 'PRIVATE' },
      { name: 'pi', type: 'FIELD', accessModifier: 'PRIVATE', value: 3.14 },
      { name: 'area', type: 'METHOD', accessModifier: 'PUBLIC', isOverridden: true },
      { name: 'draw', type: 'METHOD', accessModifier: 'PUBLIC', isOverridden: true },
    ],
  });

  // Register Rectangle class
  OOPReflectionEngine.registerClass({
    className: 'Rectangle',
    parentClass: 'Shape',
    members: [
      { name: 'width', type: 'FIELD', accessModifier: 'PRIVATE' },
      { name: 'height', type: 'FIELD', accessModifier: 'PRIVATE' },
      { name: 'area', type: 'METHOD', accessModifier: 'PUBLIC', isOverridden: true },
      { name: 'draw', type: 'METHOD', accessModifier: 'PUBLIC', isOverridden: true },
    ],
  });

  // Pre-instantiate a Circle
  instantiateObject();
});

// Actions
function instantiateObject() {
  try {
    const instance = OOPReflectionEngine.instantiateObject('Circle');
    heapInstances.value.push(instance);
  } catch (e) {
    console.error('Failed to instantiate:', e);
  }
}

function removeInstance(address: string) {
  heapInstances.value = heapInstances.value.filter(i => i.address !== address);
}

function selectMethod(className: string, methodName: string) {
  selectedMethod.value = `${className}.${methodName}`;
  
  // Simulate VTable dispatch
  const instance = heapInstances.value.find(i => i.className === 'Circle');
  if (instance) {
    const result = OOPReflectionEngine.dispatchMethod(instance, methodName);
    if (result) {
      dispatchResult.value = result;
    }
  }
}

function tryAccessPrivate(memberName: string) {
  // Simulate trying to access private member from outside
  const result = OOPReflectionEngine.checkAccess('Circle', memberName, 'ExternalClass');
  if (!result.allowed) {
    accessViolation.value = result;
    // Auto-clear after 3 seconds
    setTimeout(() => {
      accessViolation.value = null;
    }, 3000);
  }
}
</script>

<style scoped>
.class-card {
  transition: all 0.3s ease;
}
.class-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.vtable-panel,
.heap-panel {
  transition: all 0.3s ease;
}
</style>
