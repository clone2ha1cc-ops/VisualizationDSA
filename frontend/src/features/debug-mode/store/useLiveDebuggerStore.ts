/**
 * useLiveDebuggerStore — Pinia Setup Store cho Algorithmic Step Debugger.
 *
 * Quản lý: breakpoints, currentLine, callStack, watchedVars, mutatedKeys,
 * tích hợp DebuggerYieldEngine + LiveCompilerDebugger,
 * đồng bộ Canvas animation với debug stepping.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { compileToDebugGenerator } from '../engine/DebuggerYieldEngine';
import { LiveCompilerDebugger } from '../engine/LiveCompilerDebugger';
import type {
  DebugStepPayload,
  DebuggerStatus,
} from '../types/debug.types';

const DEFAULT_SOURCE_CODE = `function bubbleSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
}`;

const DEFAULT_INPUT_ARRAY = [5, 3, 8, 1, 9, 2, 7];

export const useLiveDebuggerStore = defineStore('liveDebugger', () => {
  // ==========================================
  // STATE
  // ==========================================
  const status = ref<DebuggerStatus>('IDLE');
  const sourceCode = ref<string>(DEFAULT_SOURCE_CODE);
  const inputArray = ref<number[]>([...DEFAULT_INPUT_ARRAY]);
  const activeBreakpoints = ref<number[]>([]);
  const currentLineNumber = ref<number | null>(null);
  const callStackFrames = ref<string[]>([]);
  const watchedVariables = ref<Record<string, string | number | undefined>>({});
  const mutatedVariableKeys = ref<string[]>([]);
  const stepCount = ref<number>(0);
  const errorMessage = ref<string | null>(null);
  const arrayState = ref<number[]>([]);

  let debuggerInstance: LiveCompilerDebugger | null = null;

  // ==========================================
  // COMPUTED
  // ==========================================
  const isDebugging = computed(() => status.value === 'DEBUGGING' || status.value === 'PAUSED');
  const isPaused = computed(() => status.value === 'PAUSED');
  const isFinished = computed(() => status.value === 'FINISHED');
  const hasError = computed(() => status.value === 'ERROR');
  const canStepForward = computed(() => status.value === 'PAUSED' && debuggerInstance !== null && !debuggerInstance.isFinished());
  const canStepBackward = computed(() => status.value === 'PAUSED' && debuggerInstance !== null && debuggerInstance.getHistory().length > 1);
  const canContinue = computed(() => status.value === 'PAUSED' && activeBreakpoints.value.length > 0 && debuggerInstance !== null && !debuggerInstance.isFinished());

  // ==========================================
  // ACTIONS
  // ==========================================

  function setSourceCode(code: string): void {
    sourceCode.value = code;
  }

  function setInputArray(arr: number[]): void {
    inputArray.value = [...arr];
  }

  /**
   * Toggle breakpoint at line number.
   */
  function toggleBreakpoint(lineNumber: number): void {
    const index = activeBreakpoints.value.indexOf(lineNumber);
    if (index > -1) {
      activeBreakpoints.value.splice(index, 1);
    } else {
      activeBreakpoints.value.push(lineNumber);
    }

    if (debuggerInstance) {
      debuggerInstance.setBreakpoints(activeBreakpoints.value);
    }
  }

  /**
   * Start debugging session — compile AST to generator, create debugger instance.
   */
  function startDebuggingSession(): void {
    errorMessage.value = null;
    currentLineNumber.value = null;
    callStackFrames.value = [];
    watchedVariables.value = {};
    mutatedVariableKeys.value = [];
    stepCount.value = 0;
    arrayState.value = [...inputArray.value];

    const compileResult = compileToDebugGenerator(sourceCode.value);

    if (!compileResult.success || !compileResult.generatorCode) {
      status.value = 'ERROR';
      errorMessage.value = compileResult.error ?? 'Loi bien dich AST khong xac dinh.';
      return;
    }

    try {
      const generatorCode = compileResult.generatorCode;
      const inputArr = [...inputArray.value];

      const generatorFunc = (): Generator<DebugStepPayload, void, unknown> => {
        const captureVarsFunc = `
          function __captureVars() {
            const vars = {};
            try { if (typeof n !== 'undefined') vars.n = n; } catch(e) {}
            try { if (typeof i !== 'undefined') vars.i = i; } catch(e) {}
            try { if (typeof j !== 'undefined') vars.j = j; } catch(e) {}
            try { if (typeof temp !== 'undefined') vars.temp = temp; } catch(e) {}
            try { if (typeof left !== 'undefined') vars.left = left; } catch(e) {}
            try { if (typeof right !== 'undefined') vars.right = right; } catch(e) {}
            try { if (typeof pivot !== 'undefined') vars.pivot = pivot; } catch(e) {}
            try { if (typeof mid !== 'undefined') vars.mid = mid; } catch(e) {}
            try { if (typeof key !== 'undefined') vars.key = key; } catch(e) {}
            try { if (typeof low !== 'undefined') vars.low = low; } catch(e) {}
            try { if (typeof high !== 'undefined') vars.high = high; } catch(e) {}
            try { if (typeof min !== 'undefined') vars.min = min; } catch(e) {}
            try { if (typeof max !== 'undefined') vars.max = max; } catch(e) {}
            return vars;
          }
        `;
        const fullCode = captureVarsFunc + generatorCode;

        const createGenerator = new Function('arr', `
          ${fullCode}
          return __debugMain();
        `);
        return createGenerator(inputArr) as Generator<DebugStepPayload, void, unknown>;
      };

      debuggerInstance = new LiveCompilerDebugger(generatorFunc);
      debuggerInstance.setBreakpoints(activeBreakpoints.value);
      status.value = 'PAUSED';

      stepForward();
    } catch (err: unknown) {
      status.value = 'ERROR';
      errorMessage.value = err instanceof Error ? err.message : 'Loi khoi tao debugger.';
    }
  }

  /**
   * Step Forward — Tiến một dòng lệnh.
   */
  function stepForward(): void {
    if (!debuggerInstance) return;

    try {
      const payload = debuggerInstance.stepForward();
      if (payload) {
        syncDebuggerPayload(payload);
      } else {
        status.value = 'FINISHED';
        currentLineNumber.value = null;
      }
    } catch (err: unknown) {
      status.value = 'ERROR';
      errorMessage.value = err instanceof Error ? err.message : 'Loi step forward.';
    }
  }

  /**
   * Step Backward — Quay lại bước trước.
   */
  function stepBackward(): void {
    if (!debuggerInstance) return;

    const payload = debuggerInstance.stepBackward();
    if (payload) {
      syncDebuggerPayload(payload);
    }
  }

  /**
   * Continue — Phát tới breakpoint kế tiếp.
   */
  function continueToNextBreakpoint(): void {
    if (!debuggerInstance) return;

    try {
      const payload = debuggerInstance.continueToNextBreakpoint();
      if (payload) {
        syncDebuggerPayload(payload);
      } else {
        status.value = 'FINISHED';
        currentLineNumber.value = null;
      }
    } catch (err: unknown) {
      status.value = 'ERROR';
      errorMessage.value = err instanceof Error ? err.message : 'Loi continue.';
    }
  }

  /**
   * Step Out — Thoát hàm hiện tại.
   */
  function stepOut(): void {
    if (!debuggerInstance) return;

    try {
      const payload = debuggerInstance.stepOut();
      if (payload) {
        syncDebuggerPayload(payload);
      } else {
        status.value = 'FINISHED';
        currentLineNumber.value = null;
      }
    } catch (err: unknown) {
      status.value = 'ERROR';
      errorMessage.value = err instanceof Error ? err.message : 'Loi step out.';
    }
  }

  /**
   * Stop debugging session.
   */
  function stopDebuggingSession(): void {
    status.value = 'IDLE';
    currentLineNumber.value = null;
    callStackFrames.value = [];
    watchedVariables.value = {};
    mutatedVariableKeys.value = [];
    stepCount.value = 0;
    errorMessage.value = null;
    arrayState.value = [...inputArray.value];

    if (debuggerInstance) {
      debuggerInstance.reset();
      debuggerInstance = null;
    }
  }

  /**
   * Sync debug payload from engine to reactive state.
   */
  function syncDebuggerPayload(payload: DebugStepPayload): void {
    currentLineNumber.value = payload.lineNumber;
    callStackFrames.value = [...payload.callStack];
    arrayState.value = [...payload.arrayState];
    stepCount.value = debuggerInstance?.getStepCount() ?? 0;

    const nextMutatedKeys: string[] = [];
    for (const key of Object.keys(payload.variables)) {
      if (watchedVariables.value[key] !== payload.variables[key]) {
        nextMutatedKeys.push(key);
      }
    }
    mutatedVariableKeys.value = nextMutatedKeys;
    watchedVariables.value = { ...payload.variables };
  }

  return {
    // State
    status,
    sourceCode,
    inputArray,
    activeBreakpoints,
    currentLineNumber,
    callStackFrames,
    watchedVariables,
    mutatedVariableKeys,
    stepCount,
    errorMessage,
    arrayState,
    // Computed
    isDebugging,
    isPaused,
    isFinished,
    hasError,
    canStepForward,
    canStepBackward,
    canContinue,
    // Actions
    setSourceCode,
    setInputArray,
    toggleBreakpoint,
    startDebuggingSession,
    stepForward,
    stepBackward,
    continueToNextBreakpoint,
    stepOut,
    stopDebuggingSession,
  };
});
