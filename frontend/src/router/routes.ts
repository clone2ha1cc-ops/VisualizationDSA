import type { RouteRecordRaw } from 'vue-router';

/**
 * Danh sách routes cho toàn bộ ứng dụng.
 * Mỗi tab là một route riêng → code-splitting tự động qua Vite.
 */
export const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/sorting' },

  { path: '/sorting',       name: 'sorting',       component: () => import('../views/SortingView.vue'),          meta: { title: 'Sorting',         icon: 'sorting' } },
  { path: '/animation',     name: 'animation',     component: () => import('../views/AnimationView.vue'),        meta: { title: 'Animation',       icon: 'animation' } },
  { path: '/dsa',           name: 'dsa',           component: () => import('../views/DSAModulesView.vue'),       meta: { title: 'DSA Modules',     icon: 'dsa' } },
  { path: '/code-ide',      name: 'code-ide',      component: () => import('../views/CodeIDEView.vue'),          meta: { title: 'Code IDE',        icon: 'code-ide' } },
  { path: '/compare',       name: 'compare',       component: () => import('../views/CompareView.vue'),          meta: { title: 'So sánh',         icon: 'compare' } },
  { path: '/concurrency',   name: 'concurrency',   component: () => import('../views/ConcurrencyView.vue'),      meta: { title: 'Đa luồng',        icon: 'concurrency' } },
  { path: '/debug',         name: 'debug',         component: () => import('../views/DebugView.vue'),            meta: { title: 'Debug',           icon: 'debug' } },
  { path: '/graph',         name: 'graph',         component: () => import('../views/GraphView.vue'),            meta: { title: 'Graph',           icon: 'graph' } },
  { path: '/playground',    name: 'playground',    component: () => import('../views/PlaygroundView.vue'),       meta: { title: 'Playground',      icon: 'playground' } },
  { path: '/oop',           name: 'oop',           component: () => import('../views/OOPView.vue'),              meta: { title: 'OOP',             icon: 'oop' } },
  { path: '/solid',         name: 'solid',         component: () => import('../views/SOLIDView.vue'),            meta: { title: 'SOLID',           icon: 'solid' } },
  { path: '/di',            name: 'di',            component: () => import('../views/DIView.vue'),               meta: { title: 'DI/IoC',          icon: 'di' } },
  { path: '/patterns',      name: 'patterns',      component: () => import('../views/PatternsView.vue'),         meta: { title: 'Patterns',        icon: 'patterns' } },
  { path: '/state',         name: 'state',         component: () => import('../views/StateView.vue'),            meta: { title: 'Stack/Heap',      icon: 'state' } },
  { path: '/system',        name: 'system',        component: () => import('../views/SystemView.vue'),           meta: { title: 'System',          icon: 'system' } },
  { path: '/quiz',          name: 'quiz',          component: () => import('../views/QuizView.vue'),             meta: { title: 'Quiz',            icon: 'quiz' } },
  { path: '/gamification',  name: 'gamification',  component: () => import('../views/GamificationView.vue'),     meta: { title: 'Gamification',    icon: 'gamification' } },
  { path: '/leaderboard',   name: 'leaderboard',   component: () => import('../views/LeaderboardView.vue'),      meta: { title: 'Leaderboard',     icon: 'leaderboard' } },
  { path: '/checkout',      name: 'checkout',      component: () => import('../views/PremiumCheckoutView.vue'),  meta: { title: 'Premium Upgrade', icon: 'checkout' } },

  { path: '/:pathMatch(.*)*', redirect: '/sorting' },
];
