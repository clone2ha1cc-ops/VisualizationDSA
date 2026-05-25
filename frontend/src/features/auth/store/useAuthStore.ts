/**
 * useAuthStore.ts — Pinia Store quản lý trạng thái đăng nhập.
 *
 * Chiến lược Token:
 * - Access Token (15 phút): lưu trong memory (ref) — không localStorage để tránh XSS
 * - Refresh Token (30 ngày): lưu localStorage — dùng để tái tạo access token
 *
 * Tự động refresh: 2 phút trước khi Access Token hết hạn.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as authApi from '../services/authApi';
import { setSession, clearSession, getSavedRefreshToken } from './authSessionHelpers';

export const useAuthStore = defineStore('auth', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const accessToken  = ref<string | null>(null);      // Memory only (XSS-safe)
  const currentUser  = ref<authApi.AuthUserDto | null>(null);
  const isLoading    = ref<boolean>(false);
  const authError    = ref<string | null>(null);

  const refreshTimer = { value: null as ReturnType<typeof setTimeout> | null };

  // ── Getters ───────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => accessToken.value !== null && currentUser.value !== null);
  const userName        = computed(() => currentUser.value?.username ?? 'Khách');
  const userLevel       = computed(() => currentUser.value?.currentLevel ?? 1);
  const userXP          = computed(() => currentUser.value?.totalXP ?? 0);
  const isPremium       = computed(() => currentUser.value?.isPremium ?? false);

  // ── Private helpers ────────────────────────────────────────────────────────
  function _scheduleRefresh(expiresInSeconds: number): void {
    if (refreshTimer.value) clearTimeout(refreshTimer.value);
    const delay = Math.max(0, (expiresInSeconds - 120) * 1000);
    refreshTimer.value = setTimeout(async () => {
      const saved = getSavedRefreshToken();
      if (!saved) return;
      try { setSession(await authApi.refreshAccessToken(saved), accessToken, currentUser, _scheduleRefresh); }
      catch { clearSession(accessToken, currentUser, refreshTimer); }
    }, delay);
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Khởi động store — tự động đăng nhập lại nếu còn refresh token */
  async function init(): Promise<void> {
    const saved = getSavedRefreshToken();
    if (!saved) return;
    try { setSession(await authApi.refreshAccessToken(saved), accessToken, currentUser, _scheduleRefresh); }
    catch { clearSession(accessToken, currentUser, refreshTimer); }
  }

  async function register(email: string, username: string, password: string): Promise<void> {
    isLoading.value = true; authError.value = null;
    try { setSession(await authApi.register({ email, username, password }), accessToken, currentUser, _scheduleRefresh); }
    catch (err) { authError.value = err instanceof Error ? err.message : 'Đăng ký thất bại.'; throw err; }
    finally { isLoading.value = false; }
  }

  async function logIn(email: string, password: string): Promise<void> {
    isLoading.value = true; authError.value = null;
    try { setSession(await authApi.login({ email, password }), accessToken, currentUser, _scheduleRefresh); }
    catch (err) { authError.value = err instanceof Error ? err.message : 'Đăng nhập thất bại.'; throw err; }
    finally { isLoading.value = false; }
  }

  async function logOut(): Promise<void> {
    const savedRefresh = getSavedRefreshToken();
    if (accessToken.value && savedRefresh) await authApi.logout(accessToken.value, savedRefresh);
    clearSession(accessToken, currentUser, refreshTimer);
  }

  /** Lấy access token hiện tại — gọi trước mỗi API call cần auth */
  function getAccessToken(): string | null { return accessToken.value; }

  return {
    currentUser, isLoading, authError,
    isAuthenticated, userName, userLevel, userXP, isPremium,
    init, register, logIn, logOut, getAccessToken,
  };
});
