// ============================================================
// oop-sandbox module — Public API
// Sprint 6: OOP Concepts Visualizer & VTable Sandboxing
// ============================================================

export { default as OOPSandbox } from './components/OOPSandbox.vue';

export {
  OOPReflectionEngine,
  type AccessModifier,
  type ClassMember,
  type ClassDefinition,
  type HeapObjectInstance,
  type MethodDispatchResult,
  type AccessCheckResult,
} from './OOPReflectionEngine';

export {
  drawAccessLock,
  drawViolationLaser,
  createShakeAnimation,
  getModifierColor,
  drawModifierBadge,
  type LockConfig,
  type LaserBeam,
} from './EncapsulationLock';
