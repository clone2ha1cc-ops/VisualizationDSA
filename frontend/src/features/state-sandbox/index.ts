// ============================================================
// state-sandbox module — Public API
// Sprint 10: State Inspector Stack-Heap & Custom DSL Compiler
// ============================================================

export { default as StateInspector } from './components/StateInspector.vue';

export {
  CallStackEngine,
  type StackFrame3D,
  type HeapNode3D,
  type PointerArrow,
  type BezierPath,
  type MemorySnapshot,
} from './CallStackEngine';

export {
  DSLEngine,
  type DSLCommandType,
  type DSLCommand,
  type DSLAnimationFrame,
  type StackFrame,
  type HeapObject,
  type Pointer,
  type DSLCompileResult,
} from './DSLEngine';
