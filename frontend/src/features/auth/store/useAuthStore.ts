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
import { statelessAuthApi } from '../services/statelessAuthApi';
import type { StatelessUserDto, StatelessAuthResponse } from '../services/statelessAuthApi';

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
  const userRole        = computed(() => currentUser.value?.role ?? 'Student');
  const isTeacher       = computed(() => userRole.value === 'Teacher');

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

  // ── Stateless Backend Integration ──────────────────────────────
  const statelessUser = ref<StatelessUserDto | null>(null);
  const isStatelessMode = ref(false);

  function _applyStatelessAuth(response: StatelessAuthResponse): void {
    accessToken.value = response.accessToken;
    statelessUser.value = response.user;
    isStatelessMode.value = true;
    currentUser.value = {
      id: response.user.id,
      email: response.user.email,
      username: response.user.username,
      totalXP: response.user.totalXP,
      currentLevel: response.user.currentLevel,
      streakDays: response.user.streakDays,
      createdAt: response.user.createdAt,
      badges: response.user.badges,
      isPremium: response.user.isPremium,
      role: response.user.role,
    };
    localStorage.setItem('vdsa_refresh_token', response.refreshToken);
    localStorage.setItem('vdsa_access_expires', String(Date.now() + response.expiresIn * 1000));
    localStorage.setItem('vdsa_stateless_user_id', response.user.id);
  }

  async function statelessLogin(email: string, password: string): Promise<void> {
    isLoading.value = true; authError.value = null;
    try {
      const response = await statelessAuthApi.login(email, password);
      _applyStatelessAuth(response);
    } catch (err: unknown) {
      authError.value = err instanceof Error ? err.message : 'Đăng nhập thất bại.';
      throw err;
    } finally { isLoading.value = false; }
  }

  async function statelessRegister(email: string, username: string, password: string): Promise<void> {
    isLoading.value = true; authError.value = null;
    try {
      const response = await statelessAuthApi.register(email, username, password);
      _applyStatelessAuth(response);
    } catch (err: unknown) {
      authError.value = err instanceof Error ? err.message : 'Đăng ký thất bại.';
      throw err;
    } finally { isLoading.value = false; }
  }

  async function statelessLogout(): Promise<void> {
    const savedRefresh = getSavedRefreshToken();
    if (savedRefresh) await statelessAuthApi.logout(savedRefresh);
    accessToken.value = null;
    currentUser.value = null;
    statelessUser.value = null;
    isStatelessMode.value = false;
    localStorage.removeItem('vdsa_refresh_token');
    localStorage.removeItem('vdsa_access_expires');
    localStorage.removeItem('vdsa_stateless_user_id');
  }

  async function statelessInit(): Promise<void> {
    const savedRefresh = getSavedRefreshToken();
    const savedUserId = localStorage.getItem('vdsa_stateless_user_id');
    if (!savedRefresh || !savedUserId) return;

    try {
      const response = await statelessAuthApi.refresh(savedRefresh);
      _applyStatelessAuth(response);
    } catch {
      // Refresh failed — clear session
      localStorage.removeItem('vdsa_refresh_token');
      localStorage.removeItem('vdsa_access_expires');
      localStorage.removeItem('vdsa_stateless_user_id');
    }
  }

  async function loadStatelessProfile(): Promise<void> {
    const userId = statelessUser.value?.id ?? localStorage.getItem('vdsa_stateless_user_id');
    if (!userId) return;
    try {
      statelessUser.value = await statelessAuthApi.getMe(userId);
      if (currentUser.value) {
        currentUser.value.totalXP = statelessUser.value.totalXP;
        currentUser.value.currentLevel = statelessUser.value.currentLevel;
        currentUser.value.streakDays = statelessUser.value.streakDays;
      }
    } catch { /* silent — profile load is optional */ }
  }

  return {
    currentUser, isLoading, authError,
    isAuthenticated, userName, userLevel, userXP, isPremium, userRole, isTeacher,
    init, register, logIn, logOut, getAccessToken,
    // Stateless backend
    statelessUser, isStatelessMode,
    statelessLogin, statelessRegister, statelessLogout, statelessInit, loadStatelessProfile,
  };
});
