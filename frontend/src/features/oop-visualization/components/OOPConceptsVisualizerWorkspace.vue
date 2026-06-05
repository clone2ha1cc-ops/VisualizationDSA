<template>
  <div class="oop-workspace-panel relative overflow-hidden" ref="workspaceContainer">
    
    <!-- Top Header -->
    <div class="sandbox-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-color-border-subtle">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="icon-accent">
          <polygon points="12 2 2 7 12 12 22 7 12 2"/>
          <polyline points="2 17 12 22 22 17"/>
          <polyline points="2 12 12 17 22 12"/>
        </svg>
        <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">
          Visual OOP Runtime Engine — 4 Trụ Cột Hướng Đối Tượng
        </span>
      </div>

      <!-- 4 Pillars Selector -->
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <div class="pillar-selector flex bg-bg-secondary p-0.5 rounded-lg border border-border-subtle shadow-inner">
          <button 
            class="pillar-btn text-[10px] py-1 px-3 rounded-md font-bold uppercase transition-all"
            :class="store.activePillar === 'encapsulation' ? 'active' : 'inactive'"
            @click="store.setPillar('encapsulation')"
          >
            🔒 Đóng Gói
          </button>
          <button 
            class="pillar-btn text-[10px] py-1 px-3 rounded-md font-bold uppercase transition-all"
            :class="store.activePillar === 'inheritance' ? 'active' : 'inactive'"
            @click="store.setPillar('inheritance')"
          >
            🧬 Kế Thừa
          </button>
          <button 
            class="pillar-btn text-[10px] py-1 px-3 rounded-md font-bold uppercase transition-all"
            :class="store.activePillar === 'polymorphism' ? 'active' : 'inactive'"
            @click="store.setPillar('polymorphism')"
          >
            🎭 Đa Hình
          </button>
          <button 
            class="pillar-btn text-[10px] py-1 px-3 rounded-md font-bold uppercase transition-all"
            :class="store.activePillar === 'abstraction' ? 'active' : 'inactive'"
            @click="store.setPillar('abstraction')"
          >
            📐 Trừu Tượng
          </button>
        </div>

        <span class="sprint-badge uppercase text-[9px]">Sprint 6</span>
      </div>
    </div>

    <!-- Class Generalization SVG overlay (Inheritance line) -->
    <svg class="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
      <g v-if="classCardCenters.shapeBottom && classCardCenters.circleTop">
        <!-- Vertical connector line -->
        <path 
          :d="`M ${classCardCenters.circleTop.x} ${classCardCenters.circleTop.y} L ${classCardCenters.shapeBottom.x} ${classCardCenters.shapeBottom.y + 10}`" 
          fill="none" 
          stroke="var(--color-accent-purple)" 
          stroke-width="2" 
          stroke-dasharray="4 4"
          class="transition-all duration-300"
        />
        <!-- UML generalization triangle arrowhead pointing up -->
        <polygon 
          :points="`${classCardCenters.shapeBottom.x},${classCardCenters.shapeBottom.y} ${classCardCenters.shapeBottom.x - 6},${classCardCenters.shapeBottom.y + 10} ${classCardCenters.shapeBottom.x + 6},${classCardCenters.shapeBottom.y + 10}`" 
          fill="var(--vis-panel-bg)" 
          stroke="var(--color-accent-purple)" 
          stroke-width="2"
          class="transition-all duration-300"
        />
      </g>
    </svg>

    <!-- ========================================= -->
    <!-- RUNTIME PLAYGROUND (SIMULATION ENGINE)    -->
    <!-- ========================================= -->
    <div class="runtime-view grid grid-cols-1 xl:grid-cols-12 gap-5 py-3 min-h-[500px]">
      
      <!-- Left Column: Scenario & Execution Info (xl:span-4) -->
      <div class="xl:col-span-4 flex flex-col gap-4">
        
        <!-- Scenario Selector & Player -->
        <div class="scenario-panel glass-card p-4 flex flex-col gap-3">
          <div class="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
            <span class="status-dot interactive"></span>
            Chế độ Kịch bản Học tập
          </div>

          <div class="grid grid-cols-1 gap-2" v-if="!store.isPlayingScenario">
            <button 
              v-for="sc in scenarios" 
              :key="sc.id"
              class="sc-select-btn text-left p-3 rounded-lg border transition-all text-xs flex flex-col gap-1"
              @click="store.loadScenario(sc.id)"
            >
              <span class="font-bold text-text-primary">{{ sc.title }}</span>
              <span class="text-[11px] text-text-muted leading-relaxed">{{ sc.description }}</span>
            </button>
          </div>

          <!-- Active Scenario Controls -->
          <div class="active-scenario flex flex-col gap-3" v-else>
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-accent-purple">{{ currentScenario?.title }}</span>
              <button class="exit-btn text-[10px] uppercase font-bold" @click="store.exitScenario()">Thoát kịch bản</button>
            </div>

            <!-- VCR Player Controls -->
            <div class="vcr-controls flex items-center justify-center gap-2 py-1 bg-bg-secondary/40 rounded-lg border border-border-subtle">
              <button 
                class="vcr-btn" 
                :disabled="store.scenarioStepIndex === 0"
                @click="store.prevScenarioStep()"
                title="Quay lại bước trước"
              >
                ⏮
              </button>
              <button 
                class="vcr-btn text-accent-cyan font-bold" 
                v-if="!store.isAutoplayRunning"
                @click="store.startAutoplay()"
                title="Tự động chạy"
              >
                ▶ Play
              </button>
              <button 
                class="vcr-btn text-accent-yellow font-bold" 
                v-else
                @click="store.pauseAutoplay()"
                title="Tạm dừng"
              >
                ⏸ Pause
              </button>
              <button 
                class="vcr-btn text-accent-purple" 
                @click="store.resetScenario()"
                title="Khởi động lại kịch bản"
              >
                🔄
              </button>
              <button 
                class="vcr-btn" 
                :disabled="store.scenarioStepIndex >= store.totalSteps - 1"
                @click="store.nextScenarioStep()"
                title="Bước tiếp theo"
              >
                ⏭
              </button>
              <span class="text-[10px] font-mono text-text-muted px-2">
                {{ store.scenarioStepIndex + 1 }} / {{ store.totalSteps }}
              </span>
            </div>

            <!-- Playback Speed Slider -->
            <div class="flex items-center justify-between gap-3 px-1">
              <span class="text-[9px] text-text-muted font-bold uppercase">Tốc độ:</span>
              <div class="flex items-center gap-2 flex-1 max-w-[120px]">
                <input 
                  type="range" 
                  min="0.5" 
                  max="2" 
                  step="0.5" 
                  :value="store.playbackSpeed"
                  @input="onSpeedChange"
                  class="w-full h-1 bg-border-subtle rounded-lg appearance-none cursor-pointer accent-accent-purple"
                />
                <span class="text-[10px] font-mono text-text-secondary w-6 text-right">
                  {{ store.playbackSpeed }}x
                </span>
              </div>
            </div>

            <!-- Mock Code Panel -->
            <div class="code-panel-mock font-mono text-[11px] bg-[#0c0f16] p-3 rounded-xl border border-border-subtle shadow-inner flex flex-col gap-1">
              <div 
                v-for="(line, idx) in currentScenario?.codeLines" 
                :key="idx"
                class="code-line py-0.5 px-2 rounded transition-all flex items-center gap-3"
                :class="{ 'code-line-active bg-accent-purple/20 text-accent-purple-light border-l-2 border-accent-purple': idx === store.activeCodeLine }"
              >
                <span class="text-text-disabled select-none w-4 text-right">{{ idx + 1 }}</span>
                <span class="whitespace-pre font-semibold">{{ line }}</span>
              </div>
            </div>

            <!-- Action Name Badge (API mode) -->
            <div v-if="store.isApiMode && store.currentActionName" class="api-action-badge flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-purple/10 border border-accent-purple/30">
              <span class="text-[10px] font-bold uppercase text-accent-purple bg-accent-purple/20 px-2 py-0.5 rounded">{{ store.currentActionName }}</span>
              <span v-if="store.isApiMode" class="text-[9px] text-accent-purple/60">Backend Frame</span>
            </div>

            <!-- Explanation Panel -->
            <div class="explanation-box p-3 rounded-lg bg-bg-secondary/50 border border-border-subtle text-xs text-text-secondary leading-relaxed">
              <p class="font-bold text-[10px] uppercase text-accent-yellow mb-1">Giải thích:</p>
              {{ currentStepExplanation }}
            </div>

            <!-- API Loading/Error -->
            <div v-if="store.isLoadingApi" class="text-[10px] text-accent-cyan text-center py-1">
              Đang tải dữ liệu từ backend...
            </div>
            <div v-if="store.apiError" class="text-[10px] text-red-400 text-center py-1">
              {{ store.apiError }}
            </div>
          </div>
        </div>

        <!-- Call Stack Panel -->
        <div class="call-stack-panel glass-card p-4 flex flex-col gap-3">
          <div class="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Call Stack (Ngăn xếp cuộc gọi)
            </div>
            <span class="font-mono text-[9px] text-text-muted">Depth: {{ store.callStack.length }}</span>
          </div>

          <div class="stack-container flex flex-col-reverse gap-1.5 min-h-[100px] justify-end">
            <div 
              v-for="(frame, index) in store.callStack" 
              :key="index"
              class="stack-frame p-2 rounded border font-mono text-[11px] flex items-center justify-between transition-all duration-300"
              :class="index === store.callStack.length - 1 ? 'stack-frame-active border-accent-cyan bg-accent-cyan-dim text-accent-cyan-light' : 'border-border-subtle bg-bg-secondary/20 text-text-muted'"
            >
              <span>{{ frame }}</span>
              <span v-if="index === store.callStack.length - 1" class="text-[8px] font-bold uppercase bg-accent-cyan/20 px-1 rounded">Active</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Center Column: Class Cards (xl:span-5) -->
      <div class="xl:col-span-5 flex flex-col gap-4 justify-center items-center relative py-4">
        <div class="text-[10px] font-bold uppercase tracking-wider text-text-secondary w-full flex items-center gap-1.5 mb-2 px-1">
          <span class="status-dot pointer"></span>
          UML Class cards (Sơ đồ các lớp hoạt động)
        </div>

        <div class="flex flex-col gap-4 w-full max-w-sm">
          <!-- Render simplified Class cards vertically or stacked -->
          <div 
            v-for="classDef in store.registeredClasses" 
            :key="classDef.className" 
            :id="`class-card-${classDef.className}`"
            class="transition-all duration-300"
            :class="{ 'opacity-40': store.activeExecutionPointer.dispatchStatus === 'DISPATCHED' && store.activeExecutionPointer.resolvedClass !== classDef.className }"
          >
            <UMLClassCard
              :class-def="classDef"
              :header-color="getClassHeaderColor(classDef.className)"
              :is-active="store.selectedClassName === classDef.className"
              :is-wiggling="isCardWiggling(classDef.className)"
              :violated-field="getViolatedField(classDef.className)"
              :selected-method="store.selectedMethodCall"
              @method-click="onMethodClick"
              @field-click="onFieldClick"
            />
          </div>
        </div>
      </div>

      <!-- Right Column: Heap & VTable Details (xl:span-3) -->
      <div class="xl:col-span-3 flex flex-col gap-4">
        
        <!-- Heap Object Allocator -->
        <HeapObjectAllocator
          :heap-objects="store.heapObjects"
          :active-address="store.selectedObjectAddress"
          @select="onSelectHeapObject"
          @remove="store.removeHeapObject"
        />

        <div class="alloc-control-box p-3 rounded-lg border border-border-subtle bg-bg-secondary/20 flex gap-2" v-if="!store.isPlayingScenario">
          <button 
            v-for="cName in store.availableClassNames" 
            :key="cName"
            class="new-inst-btn text-[10px] font-bold py-1.5 px-2 flex-1 rounded bg-bg-surface hover:bg-bg-hover border border-border-subtle text-text-primary transition-all"
            :disabled="!store.canAllocate"
            @click="store.instantiateNewObject(cName)"
          >
            + new {{ cName }}()
          </button>
        </div>

        <!-- Polymorphism Sandbox / VTable -->
        <PolymorphismSandbox
          :available-classes="store.availableClassNames"
          :selected-class="store.selectedClassName"
          :can-allocate="store.canAllocate"
          :v-table-entries="store.vTableForSelectedClass"
          :dispatch-status="store.activeExecutionPointer.dispatchStatus"
          :resolved-class="store.activeExecutionPointer.resolvedClass"
          :active-method="store.selectedMethodCall"
          :violation="store.lastEncapsulationViolation"
          :active-pillar="store.activePillar"
          @select-class="store.selectClass"
          @instantiate="onInstantiate"
          @dispatch="onDispatchFromSandbox"
          @reset="onReset"
        />
      </div>
    </div>

    <!-- Dynamic Dispatch Laser (SVG Overlay) -->
    <DynamicDispatchLaser
      :is-active="store.isDispatching || store.activeExecutionPointer.dispatchStatus === 'DISPATCHED'"
      :source="laserSource"
      :v-table-pivot="laserPivot"
      :target="laserTarget"
      :phase="store.activeExecutionPointer.dispatchStatus === 'DISPATCHED' ? 'resolved' : 'seeking'"
      :is-overridden="isCurrentDispatchOverridden"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref, watch, nextTick } from 'vue';
import { useOOPVisualizerStore } from '../store/useOOPVisualizerStore';
import { OOP_SCENARIOS } from '../scenarios/oopScenarios';
import type { CoordinatePoint } from '../types/oop-visualization.types';
import UMLClassCard from './UMLClassCard.vue';
import DynamicDispatchLaser from './DynamicDispatchLaser.vue';
import HeapObjectAllocator from './HeapObjectAllocator.vue';
import PolymorphismSandbox from './PolymorphismSandbox.vue';

const store = useOOPVisualizerStore();
const workspaceContainer = ref<HTMLElement | null>(null);

const laserSource = ref<CoordinatePoint>({ x: 0, y: 0 });
const laserPivot = ref<CoordinatePoint>({ x: 0, y: 0 });
const laserTarget = ref<CoordinatePoint>({ x: 0, y: 0 });

const CLASS_COLORS: Record<string, string> = {
  Shape: 'var(--color-accent-green)',
  Circle: 'var(--color-accent-purple)',
};

const classCardCenters = ref({
  shapeBottom: null as CoordinatePoint | null,
  circleTop: null as CoordinatePoint | null,
});

const scenarios = OOP_SCENARIOS;

const currentScenario = computed(() => {
  if (!store.selectedScenarioId) return null;
  return scenarios.find((s) => s.id === store.selectedScenarioId) ?? null;
});

const currentStepExplanation = computed(() => store.currentExplanation);

onMounted(() => {
  store.initializeDemoClasses();
  updateAllCoordinates();
  window.addEventListener('resize', updateAllCoordinates);
});

onUnmounted(() => {
  store.destroyStore();
  window.removeEventListener('resize', updateAllCoordinates);
});

function getClassHeaderColor(className: string): string {
  return CLASS_COLORS[className] ?? 'var(--color-text-muted)';
}

function isCardWiggling(className: string): boolean {
  return (
    store.lastEncapsulationViolation?.targetClass === className &&
    store.activeExecutionPointer.dispatchStatus === 'ACCESS_VIOLATED'
  );
}

function getViolatedField(className: string): string | null {
  if (store.lastEncapsulationViolation?.targetClass === className) {
    return store.lastEncapsulationViolation.memberName;
  }
  return null;
}

const isCurrentDispatchOverridden = computed(() => {
  const ptr = store.activeExecutionPointer;
  if (!ptr.resolvedClass || !ptr.activeMethod) return false;
  const entry = store.vTableForSelectedClass.find(
    (e) => e.methodName === ptr.activeMethod
  );
  return entry?.isOverridden ?? false;
});

const shapeClass = computed(() => store.registeredClasses.find((c) => c.className === 'Shape'));
const circleClass = computed(() => store.registeredClasses.find((c) => c.className === 'Circle'));

function onMethodClick(className: string, methodName: string): void {
  store.selectClass(className);
  let addr = store.selectedObjectAddress;
  if (!addr) {
    const instance = store.heapObjects.find((o) => o.className === className);
    addr = instance ? instance.address : '';
  } else {
    const currentObj = store.heapObjects.find((o) => o.address === addr);
    if (!currentObj || currentObj.className !== className) {
      const instance = store.heapObjects.find((o) => o.className === className);
      addr = instance ? instance.address : '';
    }
  }

  if (addr) {
    store.triggerPolymorphicCall(addr, methodName);
  }
}

function onFieldClick(className: string, fieldName: string): void {
  store.tryAccessProperty(className, fieldName, 'ExternalClass');
}

function onInstantiate(className: string): void {
  store.instantiateNewObject(className);
}

function onDispatchFromSandbox(methodName: string): void {
  const addr = store.selectedObjectAddress;
  if (addr) {
    store.triggerPolymorphicCall(addr, methodName);
  }
}

function onReset(): void {
  store.resetAll();
  store.initializeDemoClasses();
}

function onSelectHeapObject(address: string): void {
  store.selectObjectAddress(address);
}

function onSpeedChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  store.changePlaybackSpeed(parseFloat(target.value));
}

function updateAllCoordinates(): void {
  nextTick(() => {
    updateLaserCoordinates();
    updateClassInheritanceLine();
  });
}

function updateClassInheritanceLine(): void {
  const container = workspaceContainer.value;
  const shapeEl = document.getElementById('class-card-Shape');
  const circleEl = document.getElementById('class-card-Circle');

  if (!container || !shapeEl || !circleEl) {
    classCardCenters.value = { shapeBottom: null, circleTop: null };
    return;
  }

  const containerRect = container.getBoundingClientRect();
  const shapeRect = shapeEl.getBoundingClientRect();
  const circleRect = circleEl.getBoundingClientRect();

  const shapeX = shapeRect.left - containerRect.left + shapeRect.width / 2;
  const shapeBottomY = shapeRect.top - containerRect.top + shapeRect.height;

  const circleX = circleRect.left - containerRect.left + circleRect.width / 2;
  const circleTopY = circleRect.top - containerRect.top;

  classCardCenters.value = {
    shapeBottom: { x: shapeX, y: shapeBottomY },
    circleTop: { x: circleX, y: circleTopY },
  };
}

function updateLaserCoordinates(): void {
  const container = workspaceContainer.value;
  if (!container) return;
  const containerRect = container.getBoundingClientRect();

  const activeAddr = store.selectedObjectAddress || store.heapObjects[0]?.address;
  const activeMethod = store.activeExecutionPointer.activeMethod;
  const resolvedClass = store.activeExecutionPointer.resolvedClass;

  const sourceEl = document.getElementById(`heap-obj-${activeAddr}`);
  const pivotEl = document.getElementById(`vtable-entry-${activeMethod}`);
  
  const targetEl = resolvedClass && activeMethod
    ? document.getElementById(`class-${resolvedClass}-method-${activeMethod}`)
    : null;

  if (sourceEl) {
    const rect = sourceEl.getBoundingClientRect();
    laserSource.value = {
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top + rect.height / 2,
    };
  }
  if (targetEl) {
    const rect = targetEl.getBoundingClientRect();
    laserTarget.value = {
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top + rect.height / 2,
    };
  }
  if (pivotEl) {
    const rect = pivotEl.getBoundingClientRect();
    laserPivot.value = {
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top + rect.height / 2,
    };
  } else if (targetEl) {
    laserPivot.value = { ...laserTarget.value };
  }
}

watch(() => store.activeExecutionPointer, updateAllCoordinates, { deep: true });
watch(() => store.selectedObjectAddress, updateAllCoordinates);
watch(() => store.selectedClassName, updateAllCoordinates);
watch(() => store.selectedMethodCall, updateAllCoordinates);
watch(() => store.activePillar, updateAllCoordinates);
watch(() => store.isPlayingScenario, updateAllCoordinates);
</script>

<style scoped>
.oop-workspace-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background-color: color-mix(in srgb, var(--vis-panel-bg) 70%, transparent);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid color-mix(in srgb, var(--color-border-subtle) 80%, transparent);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  min-height: 550px;
}

.sandbox-header {
  border-b: 1px solid var(--color-border-subtle);
}

.icon-accent {
  color: var(--color-accent-purple);
}

.pillar-selector {
  display: flex;
  gap: 4px;
}

.pillar-btn {
  border: 1px solid transparent;
  cursor: pointer;
  background: transparent;
  color: var(--color-text-muted);
  transition: all 0.2s ease;
}

.pillar-btn:hover {
  color: var(--color-text-secondary);
}

.pillar-btn.active {
  background-color: var(--color-accent-purple-dim);
  border-color: color-mix(in srgb, var(--color-accent-purple) 35%, transparent);
  color: var(--color-accent-purple-light);
}

.sprint-badge {
  font-weight: var(--font-bold);
  letter-spacing: 0.05em;
  background-color: var(--color-accent-purple-dim);
  color: var(--color-accent-purple);
  border: 1px solid color-mix(in srgb, var(--color-accent-purple) 40%, transparent);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}

.glass-card {
  background: color-mix(in srgb, var(--vis-panel-bg-deep) 55%, transparent);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
}

.sc-select-btn {
  background-color: color-mix(in srgb, var(--color-bg-secondary) 30%, transparent);
  border-color: var(--color-border-subtle);
}

.sc-select-btn:hover {
  background-color: color-mix(in srgb, var(--color-bg-secondary) 60%, transparent);
  border-color: var(--color-accent-purple-dim);
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.15);
}

.exit-btn {
  color: var(--color-accent-red);
  background: transparent;
  border: none;
  cursor: pointer;
}

.exit-btn:hover {
  text-decoration: underline;
}

.vcr-btn {
  background: transparent;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
}

.vcr-btn:hover:not(:disabled) {
  background-color: var(--color-bg-hover);
}

.vcr-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.code-line-active {
  box-shadow: inset 2px 0 0 var(--color-accent-purple);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
}

.status-dot.interactive {
  background-color: var(--color-accent-purple);
}

.status-dot.pointer {
  background-color: var(--color-accent-green);
}

.stack-frame-active {
  box-shadow: 0 0 10px var(--color-accent-cyan-glow);
}
</style>
