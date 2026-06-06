import { createRouter, createWebHashHistory } from 'vue-router';
import { routes } from './routes';
import { useAuthStore } from '../features/auth/store/useAuthStore';

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

/**
 * Global navigation guard — role-based access control.
 * - Landing page (`/`) redirects to `/dashboard` when authenticated
 * - `/dashboard` redirects to `/` when not authenticated
 * - `/teacher` requires Teacher role
 */
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  // Authenticated users visiting landing → redirect to dashboard
  if (to.name === 'landing' && authStore.isAuthenticated) {
    return next({ name: 'dashboard' });
  }

  // Routes requiring auth
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'landing' });
  }

  // Routes requiring specific role
  if (to.meta.requiresRole && authStore.userRole !== to.meta.requiresRole) {
    return next({ name: 'dashboard' });
  }

  next();
});

export default router;
