// ============================================================
// gamification module — Public API
// Sprint 12: Gamification Rewards & Embed Widget Generator
// ============================================================

export { default as GamificationPanel } from './components/GamificationPanel.vue';

export {
  XPEngine,
  type UserProgress,
  type Badge,
  type LevelConfig,
  type XPEvent,
  type EmbedConfig,
} from './XPEngine';
