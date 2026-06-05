<template>
  <div class="di-sandbox backdrop-blur-md border border-border-subtle/80 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-border-subtle pb-4">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-accent">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
          <path d="m12 15-3-3a22 22 0 0 1 2-3.93A9.88 9.88 0 0 1 12 11c.96 0 2.68.37 4.12-1.91a22 22 0 0 1 2 3.93l-3 3"/>
          <path d="M9 12H4.5a2.5 2.5 0 0 1 0-5H9M15 12h4.5a2.5 2.5 0 0 0 0-5H15"/>
        </svg>
        <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">DI Container & IoC Visualizer</span>
      </div>
      <span class="text-[10px] font-bold uppercase tracking-wider bg-accent-cyan/40 text-accent border border-accent-cyan/40 px-2 py-1 rounded-lg">Sprint 8</span>
    </div>

    <!-- Backend Scenario Picker (VCR) -->
    <div class="vcr-picker">
      <h4 class="vcr-title">Backend Scenarios (VCR)</h4>
      <div class="vcr-btn-group">
        <button v-for="scenario in diScenarios" :key="scenario.id"
          class="vcr-btn vcr-btn-scenario" :disabled="vcrStore.isVcrLoading"
          @click="vcrStore.loadVcrScenario(scenario.id)">
          {{ scenario.label }}
        </button>
      </div>
    </div>

    <!-- VCR Explanation Banner -->
    <div v-if="vcrStore.isVcrMode && vcrStore.vcrCurrentFrame" class="vcr-banner">
      <span class="vcr-banner-action">{{ vcrStore.vcrCurrentFrame.actionType }}</span>
      <span class="vcr-banner-text">{{ vcrStore.vcrCurrentFrame.explanation }}</span>
    </div>

    <!-- VCR Loading / Error -->
    <div v-if="vcrStore.isVcrLoading" class="vcr-api-status vcr-loading">Loading from backend...</div>
    <div v-if="vcrStore.vcrError" class="vcr-api-status vcr-error">{{ vcrStore.vcrError }}</div>

    <!-- VCR Playback Controls -->
    <div v-if="vcrStore.isVcrMode" class="vcr-playback">
      <h4 class="vcr-title">VCR Playback</h4>
      <div class="vcr-row">
        <div class="vcr-btn-group">
          <button class="vcr-btn vcr-btn-nav" :disabled="vcrCurrentIndex <= 0" @click="vcrStore.vcrPrev()">◀ Prev</button>
          <button class="vcr-btn vcr-btn-nav" :disabled="vcrCurrentIndex >= vcrStore.vcrTotalFrames - 1" @click="vcrStore.vcrNext()">Next ▶</button>
          <button class="vcr-btn vcr-btn-nav" @click="vcrStore.vcrReset()">⏮ Reset</button>
        </div>
        <div class="vcr-frame-indicator">Frame {{ vcrCurrentIndex + 1 }} / {{ vcrStore.vcrTotalFrames }}</div>
        <button class="vcr-btn vcr-btn-exit" @click="vcrStore.exitVcrMode()">Exit VCR → Sandbox</button>
      </div>
    </div>

    <!-- IoC Concept Explanation (hidden in VCR mode) -->
    <div v-if="!vcrStore.isVcrMode" class="ioc-concept-box p-4 border border-border-subtle rounded-xl flex items-center gap-3">
      <div class="w-10 h-10 rounded-lg bg-accent-cyan/50 border border-accent-cyan/30 flex items-center justify-center shrink-0">
        <svg class="w-5 h-5 text-accent" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5 5 4 4 0 0 1-5-5 10 10 0 0 0 10-10z"/>
        </svg>
      </div>
      <div>
        <div class="text-sm font-bold text-text-secondary">Inversion of Control (IoC)</div>
        <div class="text-xs text-text-secondary mt-1">Thay vì class tự tạo dependencies, Container sẽ tiêm chúng vào. Visualize cách dependencies được resolve và quản lý vòng đời.</div>
      </div>
    </div>

    <!-- Service Panels Grid (hidden in VCR mode) -->
    <div v-if="!vcrStore.isVcrMode" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <DIServiceList :registrations="registrations" :selected-service="selectedService" @select="selectService" @load-sample="registerSampleServices" />
      <DIDependencyGraph :registrations="registrations" :selected-service="selectedService" :cycle-result="cycleResult" @select="selectService" @check-cycles="checkCycles" />
    </div>

    <!-- Resolve Demo Panel (hidden in VCR mode) -->
    <DIResolutionDemo v-if="!vcrStore.isVcrMode" :registrations="registrations" :singletons="singletons" :resolution-result="resolutionResult" v-model:service-to-resolve="serviceToResolve" @resolve="resolveService" />
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
import { useDIContainerStore } from '../store/useDIContainerStore';
import DIServiceList from './DIServiceList.vue';
import DIDependencyGraph from './DIDependencyGraph.vue';
import DIResolutionDemo from './DIResolutionDemo.vue';

const vcrStore = useDIContainerStore();
const vcrCurrentIndex = computed(() => vcrStore.vcrCurrentIndex);

interface DiScenario { id: string; label: string; }
const diScenarios: DiScenario[] = [
  { id: 'lifetime-demo', label: 'Lifetime Demo' },
  { id: 'cycle-detection', label: 'Cycle Detection' },
];

const registrations = ref<ServiceRegistration[]>([]);
const selectedService = ref<string>('');
const cycleResult = ref<CycleDetectionResult | null>(null);
const serviceToResolve = ref<string>('');
const resolutionResult = ref<ResolutionResult | null>(null);
const singletons = ref<ServiceInstance[]>([]);

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
  [
    { interfaceName: 'ILogger', implementationName: 'ConsoleLogger', lifetime: 'SINGLETON', dependencies: [] },
    { interfaceName: 'IDatabase', implementationName: 'PostgreSQLDatabase', lifetime: 'SINGLETON', dependencies: ['ILogger'] },
    { interfaceName: 'IUserRepository', implementationName: 'UserRepository', lifetime: 'TRANSIENT', dependencies: ['IDatabase'] },
    { interfaceName: 'IAuthService', implementationName: 'JwtAuthService', lifetime: 'TRANSIENT', dependencies: ['IUserRepository', 'ILogger'] },
    { interfaceName: 'IUserController', implementationName: 'UserController', lifetime: 'TRANSIENT', dependencies: ['IAuthService', 'IUserRepository'] },
  ].forEach(s => DIContainerEngine.register(s as ServiceRegistration));
  registrations.value = DIContainerEngine.getAllRegistrations();
  cycleResult.value = null;
  resolutionResult.value = null;
  singletons.value = [];
}

onMounted(() => registerSampleServices());
</script>

<style scoped>
.di-sandbox {
  background-color: color-mix(in srgb, var(--vis-panel-bg) 70%, transparent);
}
.ioc-concept-box {
  background-color: color-mix(in srgb, var(--color-bg-primary) 60%, transparent);
}

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

