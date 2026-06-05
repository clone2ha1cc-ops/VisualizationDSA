// ============================================================
// useOOPVisualizerStore — Pinia Setup Store
// Orchestrates class registry, Heap allocation, VTable dispatch,
// encapsulation violation detection, laser animation state,
// 4 OOP pillars navigation, VCR autoplay, and step-by-step scenarios.
// ============================================================

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { OOPReflectionEngine } from '../engine/OOPReflectionEngine';
import type {
  ClassDefinition,
  HeapObjectInstance,
  ExecutionPointer,
  EncapsulationViolation,
  OOPFrame,
  HeapObjectSnapshot,
} from '../types/oop-visualization.types';
import {
  MAX_HEAP_OBJECTS,
  DISPATCH_LASER_DELAY_MS,
  VIOLATION_SHAKE_DURATION_MS,
} from '../types/oop-visualization.types';
import { OOP_SCENARIOS } from '../scenarios/oopScenarios';
import {
  executeOOPScenario as apiExecuteScenario,
} from '../services/oopApi';

export const useOOPVisualizerStore = defineStore('oopVisualizer', () => {
  // ==========================================
  // ENGINE INSTANCE
  // ==========================================
  const engine = new OOPReflectionEngine();

  // ==========================================
  // STATE
  // ==========================================
  const registeredClasses = ref<ClassDefinition[]>([]);
  const heapObjects = ref<HeapObjectInstance[]>([]);

  const activeExecutionPointer = ref<ExecutionPointer>({
    callerClass: 'Main',
    activeObjectAddress: '',
    activeMethod: '',
    dispatchStatus: 'IDLE',
    resolvedClass: undefined,
  });

  const lastEncapsulationViolation = ref<EncapsulationViolation | null>(null);
  const selectedClassName = ref<string>('Circle');
  const selectedMethodCall = ref<string | null>(null);
  const dispatchTimerId = ref<ReturnType<typeof setTimeout> | null>(null);
  const violationTimerId = ref<ReturnType<typeof setTimeout> | null>(null);

  // New States for Runtime upgrades & 4 Pillars Restructure
  const activePillar = ref<'encapsulation' | 'inheritance' | 'polymorphism' | 'abstraction'>('encapsulation');
  const selectedObjectAddress = ref<string | null>(null);
  const selectedScenarioId = ref<string | null>(null);
  const scenarioStepIndex = ref<number>(0);
  const callStack = ref<string[]>(['Main()']);
  const activeCodeLine = ref<number | null>(null);
  const isPlayingScenario = ref<boolean>(false);

  // Autoplay states
  const isAutoplayRunning = ref<boolean>(false);
  const playbackSpeed = ref<number>(1); // Preset multipliers: 0.5, 1, 2
  const autoplayTimerId = ref<ReturnType<typeof setTimeout> | null>(null);

  // ── API / Backend-driven VCR Mode State ──
  const isApiMode = ref<boolean>(false);
  const apiFrames = ref<OOPFrame[]>([]);
  const isLoadingApi = ref<boolean>(false);
  const apiError = ref<string | null>(null);

  // ==========================================
  // COMPUTED
  // ==========================================
  const heapObjectCount = computed(() => heapObjects.value.length);

  const canAllocate = computed(
    () => heapObjects.value.length < MAX_HEAP_OBJECTS
  );

  const isDispatching = computed(
    () => activeExecutionPointer.value.dispatchStatus === 'SEEKING_VTABLE'
  );

  const isViolated = computed(
    () => activeExecutionPointer.value.dispatchStatus === 'ACCESS_VIOLATED'
  );

  const availableClassNames = computed(() =>
    registeredClasses.value.map((c) => c.className)
  );

  const totalSteps = computed<number>(() => {
    if (isApiMode.value) {
      return apiFrames.value.length;
    }
    const scenario = OOP_SCENARIOS.find((s) => s.id === selectedScenarioId.value);
    return scenario?.steps.length ?? 0;
  });

  const currentExplanation = computed<string>(() => {
    if (isApiMode.value) {
      const frame = apiFrames.value[scenarioStepIndex.value];
      return frame?.explanation ?? '';
    }
    const scenario = OOP_SCENARIOS.find((s) => s.id === selectedScenarioId.value);
    if (!scenario) return '';
    const step = scenario.steps[scenarioStepIndex.value];
    return step?.explanation ?? '';
  });

  const currentActionName = computed<string>(() => {
    if (isApiMode.value) {
      const frame = apiFrames.value[scenarioStepIndex.value];
      return frame?.actionName ?? '';
    }
    const scenario = OOP_SCENARIOS.find((s) => s.id === selectedScenarioId.value);
    if (!scenario) return '';
    const step = scenario.steps[scenarioStepIndex.value];
    return step?.actionName ?? '';
  });

  const vTableForSelectedClass = computed(() => {
    let instance = heapObjects.value.find((o) => o.address === selectedObjectAddress.value);
    if (!instance) {
      instance = heapObjects.value.find((o) => o.className === selectedClassName.value);
    }
    if (!instance) return [];

    const entries: Array<{
      methodName: string;
      resolvedClass: string;
      isOverridden: boolean;
    }> = [];

    for (const [methodName, resolvedClass] of instance.vTable) {
      const classDef = engine.getClass(resolvedClass);
      const method = classDef?.members.find(
        (m) => m.name === methodName && m.type === 'METHOD'
      );
      entries.push({
        methodName,
        resolvedClass,
        isOverridden: method?.isOverridden ?? false,
      });
    }

    return entries;
  });

  // ==========================================
  // ACTIONS
  // ==========================================
  function initializeDemoClasses(): void {
    engine.clearRegistry();
    registeredClasses.value = [];
    heapObjects.value = [];

    const pillar = activePillar.value;
    let classes: ClassDefinition[] = [];

    if (pillar === 'encapsulation') {
      classes = [
        {
          className: 'Shape',
          members: [
            { name: 'x', type: 'FIELD', accessModifier: 'PUBLIC', returnType: 'number' },
            { name: 'y', type: 'FIELD', accessModifier: 'PUBLIC', returnType: 'number' },
            { name: 'color', type: 'FIELD', accessModifier: 'PROTECTED', returnType: 'string' },
            { name: 'draw', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'void' },
          ],
        },
        {
          className: 'Circle',
          parentClass: 'Shape',
          members: [
            { name: 'radius', type: 'FIELD', accessModifier: 'PRIVATE', returnType: 'number' },
            { name: 'setRadius', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'void' },
            { name: 'draw', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'void', isOverridden: true },
          ],
        },
      ];
    } else if (pillar === 'inheritance') {
      classes = [
        {
          className: 'Shape',
          members: [
            { name: 'draw', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'void' },
            { name: 'area', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'number' },
          ],
        },
        {
          className: 'Circle',
          parentClass: 'Shape',
          members: [
            // inherits everything
          ],
        },
      ];
    } else if (pillar === 'polymorphism') {
      classes = [
        {
          className: 'Shape',
          members: [
            { name: 'draw', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'void' },
          ],
        },
        {
          className: 'Circle',
          parentClass: 'Shape',
          members: [
            { name: 'draw', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'void', isOverridden: true },
          ],
        },
      ];
    } else if (pillar === 'abstraction') {
      classes = [
        {
          className: 'Shape',
          isAbstract: true,
          members: [
            { name: 'draw', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'void', isAbstract: true },
          ],
        },
        {
          className: 'Circle',
          parentClass: 'Shape',
          members: [
            { name: 'draw', type: 'METHOD', accessModifier: 'PUBLIC', returnType: 'void', isOverridden: true },
          ],
        },
      ];
    }

    for (const classDef of classes) {
      engine.registerClass(classDef);
      registeredClasses.value.push(classDef);
    }
  }

  function registerClass(config: ClassDefinition): void {
    try {
      engine.registerClass(config);
      registeredClasses.value.push(config);
    } catch (error) {
      console.error((error as Error).message);
    }
  }

  function instantiateNewObject(className: string): string {
    try {
      const instance = engine.instantiateObject(className);
      heapObjects.value = [...engine.getHeapInstances()];
      selectedObjectAddress.value = instance.address;
      selectedClassName.value = className;
      return instance.address;
    } catch (error) {
      console.error((error as Error).message);
      return '';
    }
  }

  function removeHeapObject(address: string): void {
    engine.removeHeapInstance(address);
    heapObjects.value = [...engine.getHeapInstances()];
    if (selectedObjectAddress.value === address) {
      selectedObjectAddress.value = heapObjects.value[0]?.address ?? null;
      selectedClassName.value = heapObjects.value[0]?.className ?? 'Circle';
    }
  }

  function triggerPolymorphicCall(
    objectAddress: string,
    methodName: string,
    callerClass: string = 'Main'
  ): void {
    const obj = heapObjects.value.find((o) => o.address === objectAddress);
    if (!obj) return;

    clearTimers();

    selectedMethodCall.value = `${obj.className}.${methodName}`;
    selectedObjectAddress.value = objectAddress;
    selectedClassName.value = obj.className;
    callStack.value = [`${callerClass}()`];

    activeExecutionPointer.value = {
      callerClass,
      activeObjectAddress: objectAddress,
      activeMethod: methodName,
      dispatchStatus: 'SEEKING_VTABLE',
      resolvedClass: undefined,
    };

    dispatchTimerId.value = setTimeout(() => {
      const result = engine.dispatchMethod(obj, methodName);
      if (result) {
        activeExecutionPointer.value = {
          ...activeExecutionPointer.value,
          dispatchStatus: 'DISPATCHED',
          resolvedClass: result.resolvedClass,
        };
        callStack.value = [`${callerClass}()`, `${result.resolvedClass}.${methodName}()`];
      }
      dispatchTimerId.value = null;
    }, DISPATCH_LASER_DELAY_MS);
  }

  function tryAccessProperty(
    targetClass: string,
    propertyName: string,
    callerClass: string = 'ExternalClass'
  ): boolean {
    const result = engine.validateEncapsulationAccess(
      targetClass,
      propertyName,
      callerClass
    );

    if (!result.hasAccess) {
      clearTimers();

      lastEncapsulationViolation.value = {
        targetClass,
        memberName: propertyName,
        callerClass,
        errorMessage:
          result.errorReason ?? 'Vi phạm quyền đóng gói.',
        timestamp: Date.now(),
      };

      activeExecutionPointer.value = {
        ...activeExecutionPointer.value,
        dispatchStatus: 'ACCESS_VIOLATED',
      };

      violationTimerId.value = setTimeout(() => {
        lastEncapsulationViolation.value = null;
        activeExecutionPointer.value = {
          ...activeExecutionPointer.value,
          dispatchStatus: 'IDLE',
        };
        violationTimerId.value = null;
      }, VIOLATION_SHAKE_DURATION_MS);

      return false;
    }

    lastEncapsulationViolation.value = null;
    return true;
  }

  function selectClass(className: string): void {
    selectedClassName.value = className;
  }

  function selectObjectAddress(address: string | null): void {
    selectedObjectAddress.value = address;
    if (address) {
      const obj = heapObjects.value.find((o) => o.address === address);
      if (obj) {
        selectedClassName.value = obj.className;
      }
    }
  }

  async function setPillar(pillar: 'encapsulation' | 'inheritance' | 'polymorphism' | 'abstraction'): Promise<void> {
    activePillar.value = pillar;
    await loadScenario(pillar);
  }

  // ==========================================
  // SCENARIO MODE ACTIONS
  // ==========================================
  async function loadScenario(scenarioId: string): Promise<void> {
    resetAll();
    selectedScenarioId.value = scenarioId;
    initializeDemoClasses();
    scenarioStepIndex.value = 0;
    isPlayingScenario.value = true;
    apiError.value = null;

    // Try fetching frames from backend API
    try {
      isLoadingApi.value = true;
      const frames = await apiExecuteScenario(scenarioId);
      apiFrames.value = frames;
      isApiMode.value = true;
      applyApiFrame();
    } catch {
      // Fallback to local scenario steps
      isApiMode.value = false;
      apiFrames.value = [];
      applyScenarioStep();
    } finally {
      isLoadingApi.value = false;
    }
  }

  function applyScenarioStep(): void {
    if (!selectedScenarioId.value) return;
    const scenario = OOP_SCENARIOS.find((s) => s.id === selectedScenarioId.value);
    if (!scenario) return;

    const step = scenario.steps[scenarioStepIndex.value];
    if (!step) return;

    activeCodeLine.value = step.codeLineIndex;
    clearTimers();
    lastEncapsulationViolation.value = null;

    if (step.actionName === 'RESET') {
      activeExecutionPointer.value = {
        callerClass: 'Main',
        activeObjectAddress: '',
        activeMethod: '',
        dispatchStatus: 'IDLE',
        resolvedClass: undefined,
      };
      callStack.value = ['Main()'];
      selectedMethodCall.value = null;
      heapObjects.value = [];
    } else if (step.actionName === 'CLONE_MEMBERS') {
      // Show class structures but clear heap
      heapObjects.value = [];
      callStack.value = ['Main()'];
      selectedMethodCall.value = null;
    } else if (step.actionName === 'INSTANTIATE') {
      const addr = instantiateNewObject(step.actionPayload.className);
      selectedObjectAddress.value = addr;
      callStack.value = ['Main()'];
      activeExecutionPointer.value = {
        callerClass: 'Main',
        activeObjectAddress: '',
        activeMethod: '',
        dispatchStatus: 'IDLE',
        resolvedClass: undefined,
      };
      selectedMethodCall.value = null;
    } else if (step.actionName === 'CALL_METHOD') {
      const addr = selectedObjectAddress.value;
      const methodName = step.actionPayload.methodName;
      if (!addr) return;

      const obj = heapObjects.value.find((o) => o.address === addr);
      if (!obj) return;

      selectedMethodCall.value = `${obj.className}.${methodName}`;

      if (step.actionPayload.state === 'seeking') {
        activeExecutionPointer.value = {
          callerClass: 'Main',
          activeObjectAddress: addr,
          activeMethod: methodName,
          dispatchStatus: 'SEEKING_VTABLE',
          resolvedClass: undefined,
        };
        callStack.value = ['Main()'];
      } else if (step.actionPayload.state === 'resolved') {
        const targetClass = step.actionPayload.targetClass || obj.className;
        activeExecutionPointer.value = {
          callerClass: 'Main',
          activeObjectAddress: addr,
          activeMethod: methodName,
          dispatchStatus: 'DISPATCHED',
          resolvedClass: targetClass,
        };
        callStack.value = ['Main()', `${targetClass}.${methodName}()`];
      }
    } else if (step.actionName === 'VIOLATE_ACCESS') {
      const className = step.actionPayload.className;
      const memberName = step.actionPayload.memberName;
      tryAccessProperty(className, memberName, 'Main');
    } else if (step.actionName === 'VALIDATE_SETTER') {
      // Modify value on Heap
      const addr = selectedObjectAddress.value;
      const memberName = step.actionPayload.memberName;
      const value = step.actionPayload.value;

      if (addr) {
        const obj = heapObjects.value.find((o) => o.address === addr);
        if (obj) {
          obj.fieldsData.set(memberName, value);
        }
      }
      activeExecutionPointer.value = {
        callerClass: 'Main',
        activeObjectAddress: addr || '',
        activeMethod: 'setRadius',
        dispatchStatus: 'DISPATCHED',
        resolvedClass: 'Circle',
      };
      callStack.value = ['Main()'];
    } else if (step.actionName === 'SHOW_ABSTRACT_ERROR') {
      lastEncapsulationViolation.value = {
        targetClass: 'Shape',
        memberName: 'Shape',
        callerClass: 'Main',
        errorMessage: 'ABSTRACT_CLASS_ERROR: Không thể khởi tạo đối tượng từ lớp trừu tượng (abstract class) Shape.',
        timestamp: Date.now(),
      };
      activeExecutionPointer.value = {
        callerClass: 'Main',
        activeObjectAddress: '',
        activeMethod: '',
        dispatchStatus: 'ACCESS_VIOLATED',
        resolvedClass: undefined,
      };
      callStack.value = ['Main()'];
    }
  }

  function nextScenarioStep(): void {
    if (!selectedScenarioId.value) return;
    if (scenarioStepIndex.value >= totalSteps.value - 1) return;

    scenarioStepIndex.value++;
    if (isApiMode.value) {
      applyApiFrame();
    } else {
      applyScenarioStep();
    }
  }

  function prevScenarioStep(): void {
    if (!selectedScenarioId.value || scenarioStepIndex.value <= 0) return;

    scenarioStepIndex.value--;
    if (isApiMode.value) {
      applyApiFrame();
    } else {
      applyScenarioStep();
    }
  }

  function resetScenario(): void {
    if (!selectedScenarioId.value) return;
    pauseAutoplay();
    scenarioStepIndex.value = 0;
    if (isApiMode.value) {
      applyApiFrame();
    } else {
      applyScenarioStep();
    }
  }

  function exitScenario(): void {
    pauseAutoplay();
    isPlayingScenario.value = false;
    selectedScenarioId.value = null;
    scenarioStepIndex.value = 0;
    activeCodeLine.value = null;
    isApiMode.value = false;
    apiFrames.value = [];
    apiError.value = null;
    resetAll();
    initializeDemoClasses();
  }

  // ============================================================
  // API FRAME APPLICATION — maps backend OOPFrame to reactive state
  // ============================================================

  /** Convert backend HeapObjectSnapshot (plain objects) to frontend HeapObjectInstance (Maps) */
  function snapshotToInstance(snapshot: HeapObjectSnapshot): HeapObjectInstance {
    return {
      address: snapshot.address,
      className: snapshot.className,
      fieldsData: new Map(Object.entries(snapshot.fieldsData)),
      vTable: new Map(Object.entries(snapshot.vTable)),
    };
  }

  /** Apply the current API frame's state snapshot to all reactive refs */
  function applyApiFrame(): void {
    const frame = apiFrames.value[scenarioStepIndex.value];
    if (!frame) return;

    // Update code line highlight
    activeCodeLine.value = frame.codeLineIndex;

    // Apply class definitions from frame
    registeredClasses.value = frame.classDefinitions.map((c) => ({ ...c }));

    // Apply heap objects — convert plain objects to Maps
    heapObjects.value = frame.heapObjects.map(snapshotToInstance);

    // Track selected object address from heap
    if (frame.heapObjects.length > 0) {
      selectedObjectAddress.value = frame.heapObjects[frame.heapObjects.length - 1].address;
      selectedClassName.value = frame.heapObjects[frame.heapObjects.length - 1].className;
    }

    // Apply execution pointer
    if (frame.executionPointer) {
      activeExecutionPointer.value = {
        callerClass: frame.executionPointer.callerClass,
        activeObjectAddress: frame.executionPointer.activeObjectAddress,
        activeMethod: frame.executionPointer.activeMethod,
        dispatchStatus: frame.executionPointer.dispatchStatus,
        resolvedClass: frame.executionPointer.resolvedClass ?? undefined,
      };
      if (frame.executionPointer.resolvedClass && frame.executionPointer.activeMethod) {
        selectedMethodCall.value = `${frame.executionPointer.resolvedClass}.${frame.executionPointer.activeMethod}`;
        callStack.value = [
          `${frame.executionPointer.callerClass}()`,
          `${frame.executionPointer.resolvedClass}.${frame.executionPointer.activeMethod}()`,
        ];
      } else if (frame.executionPointer.activeMethod) {
        selectedMethodCall.value = frame.executionPointer.activeMethod;
        callStack.value = [`${frame.executionPointer.callerClass}()`];
      }
    } else {
      activeExecutionPointer.value = {
        callerClass: 'Main',
        activeObjectAddress: '',
        activeMethod: '',
        dispatchStatus: 'IDLE',
        resolvedClass: undefined,
      };
      selectedMethodCall.value = null;
      callStack.value = ['Main()'];
    }

    // Apply encapsulation violation
    if (frame.violation) {
      lastEncapsulationViolation.value = {
        targetClass: frame.violation.targetClass,
        memberName: frame.violation.memberName,
        callerClass: frame.violation.callerClass,
        errorMessage: frame.violation.errorMessage,
        timestamp: Date.now(),
      };
      activeExecutionPointer.value = {
        ...activeExecutionPointer.value,
        dispatchStatus: 'ACCESS_VIOLATED',
      };
    } else if (!frame.executionPointer || frame.executionPointer.dispatchStatus !== 'ACCESS_VIOLATED') {
      lastEncapsulationViolation.value = null;
    }
  }

  // ==========================================
  // AUTOPLAY LIFECYCLE
  // ==========================================
  function startAutoplay(): void {
    if (isAutoplayRunning.value) return;
    isAutoplayRunning.value = true;
    const delay = 2500 / playbackSpeed.value;
    autoplayTimerId.value = setTimeout(runAutoplayStep, delay);
  }

  function pauseAutoplay(): void {
    isAutoplayRunning.value = false;
    if (autoplayTimerId.value !== null) {
      clearTimeout(autoplayTimerId.value);
      autoplayTimerId.value = null;
    }
  }

  function runAutoplayStep(): void {
    if (!isAutoplayRunning.value) return;

    if (scenarioStepIndex.value < totalSteps.value - 1) {
      nextScenarioStep();
      const delay = 2500 / playbackSpeed.value;
      autoplayTimerId.value = setTimeout(runAutoplayStep, delay);
    } else {
      pauseAutoplay();
    }
  }

  function changePlaybackSpeed(speed: number): void {
    playbackSpeed.value = speed;
    if (isAutoplayRunning.value) {
      if (autoplayTimerId.value !== null) {
        clearTimeout(autoplayTimerId.value);
      }
      const delay = 2500 / playbackSpeed.value;
      autoplayTimerId.value = setTimeout(runAutoplayStep, delay);
    }
  }

  function resetAll(): void {
    clearTimers();
    pauseAutoplay();
    engine.clearRegistry();
    registeredClasses.value = [];
    heapObjects.value = [];
    activeExecutionPointer.value = {
      callerClass: 'Main',
      activeObjectAddress: '',
      activeMethod: '',
      dispatchStatus: 'IDLE',
      resolvedClass: undefined,
    };
    lastEncapsulationViolation.value = null;
    selectedClassName.value = 'Circle';
    selectedObjectAddress.value = null;
    selectedMethodCall.value = null;
    callStack.value = ['Main()'];
  }

  function resetDispatchState(): void {
    clearTimers();
    activeExecutionPointer.value = {
      callerClass: 'Main',
      activeObjectAddress: '',
      activeMethod: '',
      dispatchStatus: 'IDLE',
      resolvedClass: undefined,
    };
    selectedMethodCall.value = null;
    callStack.value = ['Main()'];
  }

  function destroyStore(): void {
    clearTimers();
    pauseAutoplay();
    engine.clearRegistry();
  }

  function clearTimers(): void {
    if (dispatchTimerId.value !== null) {
      clearTimeout(dispatchTimerId.value);
      dispatchTimerId.value = null;
    }
    if (violationTimerId.value !== null) {
      clearTimeout(violationTimerId.value);
      violationTimerId.value = null;
    }
  }

  function getEngine(): OOPReflectionEngine {
    return engine;
  }

  return {
    // State
    registeredClasses,
    heapObjects,
    activeExecutionPointer,
    lastEncapsulationViolation,
    selectedClassName,
    selectedMethodCall,
    activePillar,
    selectedObjectAddress,
    selectedScenarioId,
    scenarioStepIndex,
    callStack,
    activeCodeLine,
    isPlayingScenario,
    isAutoplayRunning,
    playbackSpeed,
    // Computed
    heapObjectCount,
    canAllocate,
    isDispatching,
    isViolated,
    availableClassNames,
    vTableForSelectedClass,
    totalSteps,
    currentExplanation,
    currentActionName,
    // API State
    isApiMode,
    apiFrames,
    isLoadingApi,
    apiError,
    // Actions
    initializeDemoClasses,
    registerClass,
    instantiateNewObject,
    removeHeapObject,
    triggerPolymorphicCall,
    tryAccessProperty,
    selectClass,
    selectObjectAddress,
    setPillar,
    loadScenario,
    nextScenarioStep,
    prevScenarioStep,
    resetScenario,
    exitScenario,
    startAutoplay,
    pauseAutoplay,
    changePlaybackSpeed,
    resetAll,
    resetDispatchState,
    destroyStore,
    getEngine,
  };
});
