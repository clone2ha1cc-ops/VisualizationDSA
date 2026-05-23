// ============================================================
// pattern-sandbox module — Public API
// Sprint 9: Design Patterns Interactive Visualizer
// ============================================================

export { default as PatternSandbox } from './components/PatternSandbox.vue';

export {
  ObserverPatternSimulator,
  StrategyPatternSimulator,
  FactoryPatternSimulator,
  MessageFlowRenderer,
  type Observer,
  type Subject,
  type Strategy,
  type Context,
  type Product,
  type Factory,
  type NotificationEvent,
  type BezierPath,
} from './PatternEngine';
