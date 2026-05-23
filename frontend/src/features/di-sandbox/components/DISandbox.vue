<template>
  <div class="di-sandbox bg-[#0e1726]/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
    
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-slate-800 pb-4">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-cyan-400">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
          <path d="m12 15-3-3a22 22 0 0 1 2-3.93A9.88 9.88 0 0 1 12 11c.96 0 2.68.37 4.12-1.91a22 22 0 0 1 2 3.93l-3 3"/>
          <path d="M9 12H4.5a2.5 2.5 0 0 1 0-5H9"/>
          <path d="M15 12h4.5a2.5 2.5 0 0 0 0-5H15"/>
        </svg>
        <span class="text-xs font-bold uppercase tracking-wider text-slate-300">DI Container & IoC Visualizer</span>
      </div>
      <div class="flex gap-1.5">
        <span class="text-[10px] font-bold uppercase tracking-wider bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 px-2 py-1 rounded-lg">
          Sprint 8
        </span>
      </div>
    </div>

    <!-- IoC Concept Explanation -->
    <div class="p-4 bg-[#070b13]/60 border border-slate-800 rounded-xl">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-lg bg-cyan-950/50 border border-cyan-800/30 flex items-center justify-center">
          <svg class="w-5 h-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5 5 4 4 0 0 1-5-5 10 10 0 0 0 10-10z"/>
          </svg>
        </div>
        <div>
          <div class="text-sm font-bold text-slate-200">Inversion of Control (IoC)</div>
          <div class="text-xs text-slate-400 mt-1">
            Thay vì class tự tạo dependencies, Container sẽ tiêm (inject) chúng vào. 
            Visualize cách dependencies được resolve và quản lý vòng đời.
          </div>
        </div>
      </div>
    </div>

    <!-- Service Registration Panel -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Registered Services -->
      <div class="bg-[#070b13]/60 border border-slate-800 rounded-xl p-4">
        <div class="flex items-center justify-between mb-4">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 7V4h3M4 17v3h3M20 7V4h-3M20 17v3h-3M9 9h6v6H9z"/>
            </svg>
            Registered Services
          </div>
          <button 
            @click="registerSampleServices"
            class="px-3 py-1.5 bg-emerald-950/40 border border-emerald-700/40 text-emerald-400 text-[10px] font-bold rounded-lg hover:bg-emerald-900/40 transition-all"
          >
            Load Sample
          </button>
        </div>

        <div class="space-y-2 max-h-[200px] overflow-y-auto">
          <div 
            v-for="reg in registrations" 
            :key="reg.interfaceName"
            class="p-3 bg-slate-900/50 border rounded-lg transition-all cursor-pointer"
            :class="selectedService === reg.interfaceName ? 'border-cyan-700/50 bg-cyan-900/20' : 'border-slate-800 hover:border-slate-700'"
            @click="selectService(reg.interfaceName)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span 
                  class="w-2 h-2 rounded-full"
                  :class="reg.lifetime === 'SINGLETON' ? 'bg-amber-400' : 'bg-blue-400'"
                />
                <span class="text-xs font-mono text-cyan-400">{{ reg.interfaceName }}</span>
              </div>
              <span 
                class="text-[9px] px-1.5 py-0.5 rounded font-bold"
                :class="reg.lifetime === 'SINGLETON' ? 'bg-amber-950/50 text-amber-400' : 'bg-blue-950/50 text-blue-400'"
              >
                {{ reg.lifetime }}
              </span>
            </div>
            <div class="text-[10px] text-slate-500 mt-1">
              → {{ reg.implementationName }}
            </div>
            <div v-if="reg.dependencies.length > 0" class="flex flex-wrap gap-1 mt-2">
              <span 
                v-for="dep in reg.dependencies" 
                :key="dep"
                class="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400"
              >
                {{ dep }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Dependency Graph Visualization -->
      <div class="bg-[#070b13]/60 border border-slate-800 rounded-xl p-4">
        <div class="flex items-center justify-between mb-4">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <svg class="w-4 h-4 text-purple-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="5" r="3"/>
              <line x1="12" x2="12" y1="8" y2="14"/>
              <circle cx="6" cy="19" r="3"/>
              <line x1="6" x2="6" y1="16" y2="13"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="18" x2="18" y1="16" y2="13"/>
              <line x1="6.5" x2="11.5" y1="16.5" y2="13.5"/>
              <line x1="17.5" x2="12.5" y1="16.5" y2="13.5"/>
            </svg>
            Dependency Graph
          </div>
          <button 
            @click="checkCycles"
            class="px-3 py-1.5 bg-purple-950/40 border border-purple-700/40 text-purple-400 text-[10px] font-bold rounded-lg hover:bg-purple-900/40 transition-all"
          >
            Check Cycles
          </button>
        </div>

        <div class="relative h-[200px] bg-slate-900/50 rounded-lg overflow-hidden">
          <!-- Dependency Lines (SVG) -->
          <svg class="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#64748b"/>
              </marker>
            </defs>
            <path
              v-for="(edge, idx) in graphEdges"
              :key="idx"
              :d="getBezierPath(edge)"
              stroke="#64748b"
              stroke-width="1.5"
              fill="none"
              marker-end="url(#arrowhead)"
              class="opacity-60"
            />
          </svg>

          <!-- Service Nodes -->
          <div
            v-for="(node, idx) in graphNodes"
            :key="node.name"
            class="absolute w-16 h-10 rounded-lg border flex flex-col items-center justify-center text-[9px] font-bold cursor-pointer transition-all"
            :class="getNodeClass(node.name)"
            :style="{ left: node.x + 'px', top: node.y + 'px' }"
            @click="selectService(node.name)"
          >
            <span class="truncate w-full text-center px-1">{{ node.name }}</span>
          </div>
        </div>

        <!-- Cycle Detection Result -->
        <div v-if="cycleResult" class="mt-3 p-2 rounded-lg text-xs" :class="cycleResult.hasCycle ? 'bg-red-950/30 border border-red-800/40 text-red-400' : 'bg-emerald-950/30 border border-emerald-800/40 text-emerald-400'">
          {{ cycleResult.message }}
        </div>
      </div>
    </div>

    <!-- Resolve Demo Panel -->
    <div class="bg-[#070b13]/60 border border-slate-800 rounded-xl p-4">
      <div class="flex items-center justify-between mb-4">
        <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <svg class="w-4 h-4 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M2 12h20"/>
          </svg>
          Resolution Demo
        </div>
        <div class="flex gap-2">
          <select 
            v-model="serviceToResolve"
            class="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 outline-none"
          >
            <option value="">Chọn service...</option>
            <option v-for="reg in registrations" :key="reg.interfaceName" :value="reg.interfaceName">
              {{ reg.interfaceName }}
            </option>
          </select>
          <button 
            @click="resolveService"
            :disabled="!serviceToResolve"
            class="px-3 py-1.5 bg-amber-950/40 border border-amber-700/40 text-amber-400 text-[10px] font-bold rounded-lg hover:bg-amber-900/40 transition-all disabled:opacity-50"
          >
            Resolve
          </button>
        </div>
      </div>

      <!-- Resolution Result -->
      <div v-if="resolutionResult" class="space-y-3">
        <div 
          class="p-3 rounded-lg border"
          :class="resolutionResult.success ? 'bg-emerald-950/30 border-emerald-800/40' : 'bg-red-950/30 border-red-800/40'"
        >
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ resolutionResult.success ? '✅' : '❌' }}</span>
            <span class="text-sm font-bold" :class="resolutionResult.success ? 'text-emerald-400' : 'text-red-400'">
              {{ resolutionResult.success ? 'Resolution Successful' : 'Resolution Failed' }}
            </span>
          </div>
          <div v-if="resolutionResult.error" class="text-xs text-red-300 mt-2">
            {{ resolutionResult.error }}
          </div>
        </div>

        <!-- Instance Details -->
        <div v-if="resolutionResult.instance" class="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
          <div class="text-[10px] font-bold uppercase text-slate-500 mb-2">Created Instance</div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="text-slate-500">ID:</span>
              <span class="text-cyan-400 font-mono ml-1">{{ resolutionResult.instance.instanceId }}</span>
            </div>
            <div>
              <span class="text-slate-500">Lifetime:</span>
              <span 
                class="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold"
                :class="resolutionResult.instance.lifetime === 'SINGLETON' ? 'bg-amber-950/50 text-amber-400' : 'bg-blue-950/50 text-blue-400'"
              >
                {{ resolutionResult.instance.lifetime }}
              </span>
            </div>
            <div>
              <span class="text-slate-500">Implementation:</span>
              <span class="text-slate-300 ml-1">{{ resolutionResult.instance.implementationName }}</span>
            </div>
            <div>
              <span class="text-slate-500">Time:</span>
              <span class="text-emerald-400 ml-1">{{ resolutionResult.resolutionTimeMs.toFixed(2) }}ms</span>
            </div>
          </div>
        </div>

        <!-- Resolution Path -->
        <div v-if="resolutionResult.resolutionPath.length > 0" class="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
          <div class="text-[10px] font-bold uppercase text-slate-500 mb-2">Resolution Path</div>
          <div class="flex items-center gap-1 flex-wrap">
            <span 
              v-for="(step, idx) in resolutionResult.resolutionPath" 
              :key="idx"
              class="text-xs px-2 py-1 rounded"
              :class="idx === resolutionResult.resolutionPath.length - 1 ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-800/30' : 'bg-slate-800 text-slate-400'"
            >
              {{ step }}
              <span v-if="idx < resolutionResult.resolutionPath.length - 1" class="ml-1 text-slate-500">→</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Active Singletons -->
      <div v-if="singletons.length > 0" class="mt-4 p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
        <div class="text-[10px] font-bold uppercase text-slate-500 mb-2 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-amber-400"/>
          Active Singleton Instances
        </div>
        <div class="flex flex-wrap gap-2">
          <div 
            v-for="instance in singletons" 
            :key="instance.instanceId"
            class="px-2 py-1 bg-amber-950/30 border border-amber-800/30 rounded text-[10px]"
          >
            <span class="text-amber-400">{{ instance.interfaceName }}</span>
            <span class="text-slate-500 ml-1">({{ instance.instanceId.slice(-6) }})</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  DIContainerEngine,
  type ServiceRegistration,
  type ServiceInstance,
  type CycleDetectionResult,
  type ResolutionResult,
} from '../DIContainerEngine';

// State
const registrations = ref<ServiceRegistration[]>([]);
const selectedService = ref<string>('');
const cycleResult = ref<CycleDetectionResult | null>(null);
const serviceToResolve = ref<string>('');
const resolutionResult = ref<ResolutionResult | null>(null);
const singletons = ref<ServiceInstance[]>([]);

// Graph visualization nodes
const graphNodes = computed(() => {
  const nodes = registrations.value.map((reg, idx) => {
    const total = registrations.value.length;
    const angle = (idx * 2 * Math.PI) / total - Math.PI / 2;
    const radius = 70;
    const centerX = 150;
    const centerY = 100;
    
    return {
      name: reg.interfaceName,
      x: centerX + Math.cos(angle) * radius - 32,
      y: centerY + Math.sin(angle) * radius - 20,
      lifetime: reg.lifetime,
    };
  });
  return nodes;
});

const graphEdges = computed(() => {
  const edges: Array<{ from: string; to: string }> = [];
  registrations.value.forEach((reg) => {
    reg.dependencies.forEach((dep) => {
      edges.push({ from: reg.interfaceName, to: dep });
    });
  });
  return edges;
});

function getNodeClass(name: string) {
  const reg = registrations.value.find((r) => r.interfaceName === name);
  const isSelected = selectedService.value === name;
  const baseClass = isSelected ? 'ring-2 ring-cyan-500/50 ' : '';
  
  if (reg?.lifetime === 'SINGLETON') {
    return baseClass + 'bg-amber-900/30 border-amber-700/40 text-amber-400';
  }
  return baseClass + 'bg-blue-900/30 border-blue-700/40 text-blue-400';
}

function getBezierPath(edge: { from: string; to: string }): string {
  const fromNode = graphNodes.value.find((n) => n.name === edge.from);
  const toNode = graphNodes.value.find((n) => n.name === edge.to);
  
  if (!fromNode || !toNode) return '';
  
  const x1 = fromNode.x + 32;
  const y1 = fromNode.y + 10;
  const x2 = toNode.x + 32;
  const y2 = toNode.y + 10;
  
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - 20;
  
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
}

function selectService(name: string) {
  selectedService.value = name;
  serviceToResolve.value = name;
}

function checkCycles() {
  cycleResult.value = DIContainerEngine.detectCycles();
}

function resolveService() {
  if (!serviceToResolve.value) return;
  
  resolutionResult.value = DIContainerEngine.resolve(serviceToResolve.value);
  singletons.value = DIContainerEngine.getSingletonInstances();
}

function registerSampleServices() {
  DIContainerEngine.reset();
  
  // Register sample services
  DIContainerEngine.register({
    interfaceName: 'ILogger',
    implementationName: 'ConsoleLogger',
    lifetime: 'SINGLETON',
    dependencies: [],
  });
  
  DIContainerEngine.register({
    interfaceName: 'IDatabase',
    implementationName: 'PostgreSQLDatabase',
    lifetime: 'SINGLETON',
    dependencies: ['ILogger'],
  });
  
  DIContainerEngine.register({
    interfaceName: 'IUserRepository',
    implementationName: 'UserRepository',
    lifetime: 'TRANSIENT',
    dependencies: ['IDatabase'],
  });
  
  DIContainerEngine.register({
    interfaceName: 'IAuthService',
    implementationName: 'JwtAuthService',
    lifetime: 'TRANSIENT',
    dependencies: ['IUserRepository', 'ILogger'],
  });
  
  DIContainerEngine.register({
    interfaceName: 'IUserController',
    implementationName: 'UserController',
    lifetime: 'TRANSIENT',
    dependencies: ['IAuthService', 'IUserRepository'],
  });
  
  registrations.value = DIContainerEngine.getAllRegistrations();
  cycleResult.value = null;
  resolutionResult.value = null;
  singletons.value = [];
}

// Load sample on mount
onMounted(() => {
  registerSampleServices();
});
</script>

<style scoped>
.di-sandbox {
  transition: all 0.3s ease;
}
</style>
