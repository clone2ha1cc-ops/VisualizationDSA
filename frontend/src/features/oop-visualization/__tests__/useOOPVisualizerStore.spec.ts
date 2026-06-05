import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useOOPVisualizerStore } from '../store/useOOPVisualizerStore';

// Mock OOP API service — reject all calls so store falls back to local scenarios
vi.mock('../services/oopApi', () => ({
  executeOOPScenario: vi.fn().mockRejectedValue(new Error('No backend in test')),
  fetchOOPScenarios: vi.fn().mockRejectedValue(new Error('No backend in test')),
}));

describe('useOOPVisualizerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initializeDemoClasses', () => {
    it('should register 2 demo classes (Shape, Circle) for encapsulation by default', () => {
      const store = useOOPVisualizerStore();
      store.initializeDemoClasses();
      expect(store.registeredClasses).toHaveLength(2);
      expect(store.availableClassNames).toEqual(['Shape', 'Circle']);
    });
  });

  describe('instantiateNewObject', () => {
    it('should allocate heap object and return address', () => {
      const store = useOOPVisualizerStore();
      store.initializeDemoClasses();
      const addr = store.instantiateNewObject('Circle');
      expect(addr).toMatch(/^0x[0-9A-F]+$/);
      expect(store.heapObjects).toHaveLength(1);
      expect(store.heapObjectCount).toBe(1);
    });

    it('should return empty string for unregistered class', () => {
      const store = useOOPVisualizerStore();
      store.initializeDemoClasses();
      const addr = store.instantiateNewObject('Unknown');
      expect(addr).toBe('');
    });

    it('should increment heap addresses by 16', () => {
      const store = useOOPVisualizerStore();
      store.initializeDemoClasses();
      const addr1 = store.instantiateNewObject('Circle');
      const addr2 = store.instantiateNewObject('Circle');
      const diff = parseInt(addr2, 16) - parseInt(addr1, 16);
      expect(diff).toBe(16);
    });

    it('should update canAllocate when reaching MAX_HEAP_OBJECTS', () => {
      const store = useOOPVisualizerStore();
      store.initializeDemoClasses();
      for (let i = 0; i < 10; i++) {
        store.instantiateNewObject('Circle');
      }
      expect(store.canAllocate).toBe(false);
    });
  });

  describe('removeHeapObject', () => {
    it('should remove object from heap', () => {
      const store = useOOPVisualizerStore();
      store.initializeDemoClasses();
      const addr = store.instantiateNewObject('Circle');
      expect(store.heapObjectCount).toBe(1);
      store.removeHeapObject(addr);
      expect(store.heapObjectCount).toBe(0);
    });
  });

  describe('triggerPolymorphicCall', () => {
    it('should set dispatch status to SEEKING_VTABLE immediately', () => {
      const store = useOOPVisualizerStore();
      store.initializeDemoClasses();
      const addr = store.instantiateNewObject('Circle');

      store.triggerPolymorphicCall(addr, 'draw');

      expect(store.activeExecutionPointer.dispatchStatus).toBe('SEEKING_VTABLE');
      expect(store.activeExecutionPointer.activeMethod).toBe('draw');
      expect(store.isDispatching).toBe(true);
    });

    it('should resolve to DISPATCHED after 800ms delay', () => {
      const store = useOOPVisualizerStore();
      store.initializeDemoClasses();
      const addr = store.instantiateNewObject('Circle');

      store.triggerPolymorphicCall(addr, 'draw');
      vi.advanceTimersByTime(800);

      expect(store.activeExecutionPointer.dispatchStatus).toBe('DISPATCHED');
      expect(store.activeExecutionPointer.resolvedClass).toBe('Circle');
      expect(store.isDispatching).toBe(false);
    });

    it('should update selectedMethodCall', () => {
      const store = useOOPVisualizerStore();
      store.initializeDemoClasses();
      const addr = store.instantiateNewObject('Circle');

      store.triggerPolymorphicCall(addr, 'area');
      expect(store.selectedMethodCall).toBe('Circle.area');
    });

    it('should handle dispatching inherited method (Shape.toString)', () => {
      const store = useOOPVisualizerStore();
      store.initializeDemoClasses();

      store.registerClass({
        className: 'Triangle',
        parentClass: 'Shape',
        members: [],
      });

      const addr = store.instantiateNewObject('Triangle');
      store.triggerPolymorphicCall(addr, 'draw');
      vi.advanceTimersByTime(800);

      expect(store.activeExecutionPointer.resolvedClass).toBe('Shape');
    });
  });

  describe('tryAccessProperty', () => {
    it('should return false and set violation for PRIVATE access', () => {
      const store = useOOPVisualizerStore();
      store.initializeDemoClasses();

      const result = store.tryAccessProperty('Circle', 'radius', 'ExternalClass');

      expect(result).toBe(false);
      expect(store.lastEncapsulationViolation).not.toBeNull();
      expect(store.lastEncapsulationViolation?.errorMessage).toContain('ENCAPSULATION_ERROR');
      expect(store.isViolated).toBe(true);
    });

    it('should auto-clear violation after 2000ms', () => {
      const store = useOOPVisualizerStore();
      store.initializeDemoClasses();

      store.tryAccessProperty('Circle', 'radius', 'ExternalClass');
      expect(store.isViolated).toBe(true);

      vi.advanceTimersByTime(2000);

      expect(store.lastEncapsulationViolation).toBeNull();
      expect(store.activeExecutionPointer.dispatchStatus).toBe('IDLE');
    });

    it('should return true for PUBLIC access', () => {
      const store = useOOPVisualizerStore();
      store.initializeDemoClasses();

      const result = store.tryAccessProperty('Shape', 'x', 'ExternalClass');
      expect(result).toBe(true);
      expect(store.lastEncapsulationViolation).toBeNull();
    });

    it('should return true for PROTECTED access from subclass', () => {
      const store = useOOPVisualizerStore();
      store.initializeDemoClasses();

      const result = store.tryAccessProperty('Shape', 'color', 'Circle');
      expect(result).toBe(true);
    });

    it('should return false for PROTECTED access from unrelated class', () => {
      const store = useOOPVisualizerStore();
      store.initializeDemoClasses();

      const result = store.tryAccessProperty('Shape', 'color', 'Hacker');
      expect(result).toBe(false);
      expect(store.isViolated).toBe(true);
    });
  });

  describe('selectClass', () => {
    it('should update selectedClassName', () => {
      const store = useOOPVisualizerStore();
      store.initializeDemoClasses();

      store.selectClass('Shape');
      expect(store.selectedClassName).toBe('Shape');
    });
  });

  describe('vTableForSelectedClass', () => {
    it('should return VTable entries for selected class', () => {
      const store = useOOPVisualizerStore();
      store.initializeDemoClasses();
      store.instantiateNewObject('Circle');

      const entries = store.vTableForSelectedClass;
      expect(entries.length).toBeGreaterThan(0);

      const drawEntry = entries.find(e => e.methodName === 'draw');
      expect(drawEntry).toBeDefined();
      expect(drawEntry!.resolvedClass).toBe('Circle');
      expect(drawEntry!.isOverridden).toBe(true);
    });

    it('should return empty when no matching heap object', () => {
      const store = useOOPVisualizerStore();
      store.initializeDemoClasses();
      store.selectClass('Shape');

      expect(store.vTableForSelectedClass).toEqual([]);
    });
  });

  describe('resetAll', () => {
    it('should clear everything and return to initial state', () => {
      const store = useOOPVisualizerStore();
      store.initializeDemoClasses();
      store.instantiateNewObject('Circle');
      store.tryAccessProperty('Circle', 'radius', 'Hacker');

      store.resetAll();

      expect(store.registeredClasses).toHaveLength(0);
      expect(store.heapObjects).toHaveLength(0);
      expect(store.lastEncapsulationViolation).toBeNull();
      expect(store.activeExecutionPointer.dispatchStatus).toBe('IDLE');
      expect(store.selectedClassName).toBe('Circle');
    });
  });

  describe('resetDispatchState', () => {
    it('should reset dispatch to IDLE without clearing classes/heap', () => {
      const store = useOOPVisualizerStore();
      store.initializeDemoClasses();
      const addr = store.instantiateNewObject('Circle');
      store.triggerPolymorphicCall(addr, 'draw');

      store.resetDispatchState();

      expect(store.activeExecutionPointer.dispatchStatus).toBe('IDLE');
      expect(store.selectedMethodCall).toBeNull();
      expect(store.registeredClasses).toHaveLength(2);
      expect(store.heapObjectCount).toBe(1);
    });
  });

  describe('Scenario Mode & Runtime Upgrades', () => {
    it('should set activePillar and load corresponding scenario', async () => {
      const store = useOOPVisualizerStore();
      expect(store.activePillar).toBe('encapsulation');
      await store.setPillar('inheritance');
      expect(store.activePillar).toBe('inheritance');
      expect(store.selectedScenarioId).toBe('inheritance');
    });

    it('should load scenario polymorphism and apply step 0', async () => {
      const store = useOOPVisualizerStore();
      await store.loadScenario('polymorphism');

      expect(store.isPlayingScenario).toBe(true);
      expect(store.selectedScenarioId).toBe('polymorphism');
      expect(store.scenarioStepIndex).toBe(0);
      expect(store.activeCodeLine).toBe(1);
      expect(store.heapObjectCount).toBe(1);
      expect(store.callStack).toEqual(['Main()']);
    });

    it('should advance scenario polymorphism to seeking and resolve steps', async () => {
      const store = useOOPVisualizerStore();
      await store.loadScenario('polymorphism');
      
      store.nextScenarioStep(); // Step 1: CALL_METHOD seeking
      expect(store.scenarioStepIndex).toBe(1);
      expect(store.activeCodeLine).toBe(4);
      expect(store.activeExecutionPointer.dispatchStatus).toBe('SEEKING_VTABLE');

      store.nextScenarioStep(); // Step 2: CALL_METHOD resolved
      expect(store.scenarioStepIndex).toBe(2);
      expect(store.activeExecutionPointer.dispatchStatus).toBe('DISPATCHED');
      expect(store.activeExecutionPointer.resolvedClass).toBe('Circle');
      expect(store.callStack).toEqual(['Main()', 'Circle.draw()']);
    });

    it('should allow exiting scenario mode', async () => {
      const store = useOOPVisualizerStore();
      await store.loadScenario('polymorphism');
      expect(store.isPlayingScenario).toBe(true);

      store.exitScenario();
      expect(store.isPlayingScenario).toBe(false);
      expect(store.selectedScenarioId).toBeNull();
      expect(store.heapObjectCount).toBe(0); // zero-state loading
    });

    it('should start autoplay and advance steps automatically', async () => {
      const store = useOOPVisualizerStore();
      await store.loadScenario('polymorphism');
      expect(store.scenarioStepIndex).toBe(0);
      expect(store.isAutoplayRunning).toBe(false);

      store.startAutoplay();
      expect(store.isAutoplayRunning).toBe(true);

      // Advance by 2500ms (default delay / playbackSpeed of 1)
      vi.advanceTimersByTime(2500);
      expect(store.scenarioStepIndex).toBe(1);

      // Change speed to 2x (delay becomes 1250ms)
      store.changePlaybackSpeed(2);
      vi.advanceTimersByTime(1250);
      expect(store.scenarioStepIndex).toBe(2);

      store.pauseAutoplay();
      expect(store.isAutoplayRunning).toBe(false);
    });
  });
});
