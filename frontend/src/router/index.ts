import { createRouter, createWebHashHistory } from 'vue-router';
import { routes } from './routes';

/**
 * Router cấu hình lazy loading cho từng feature tab.
 *
 * Nguyên tắc:
 * - Mỗi tab là một route riêng → code-splitting tự động qua Vite
 * - Dùng createWebHashHistory (#) để tương thích với SPA không cần server config
 * - Tất cả components được import động () => import(...) → lazy load on demand
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
