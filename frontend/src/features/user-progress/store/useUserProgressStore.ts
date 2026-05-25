/**
 * useUserProgressStore.ts — Bridge giữa XPEngine local và Backend persistence.
 *
 * Luồng hoạt động:
 * 1. App khởi động → nếu đã đăng nhập → fetchFromServer() hydrate local state
 * 2. Khi user làm quiz/xem lecture → syncXP() tính local + fire-and-forget lên server
 * 3. Offline mode: XP tích lũy trong pendingSyncQueue → flush khi online lại
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from '../../auth/store/useAuthStore';
import {
  fetchUserProgress,
  syncXPToServer,
  markModuleComplete,
  type UserProgressDto,
  type XPSyncPayload,
} from '../service/userProgressApi';

// ── Offline sync queue ────────────────────────────────────────────────────────
const SYNC_QUEUE_KEY = 'vdsa_xp_sync_queue';

function loadSyncQueue(): XPSyncPayload[] {
  try {
    return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveSyncQueue(queue: XPSyncPayload[]): void {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useUserProgressStore = defineStore('userProgress', () => {
  const authStore = useAuthStore();

  // State — mirror của backend UserProgressDto
  const totalXP              = ref<number>(0);
  const currentLevel         = ref<number>(1);
  const xpToNextLevel        = ref<number>(100);
  const levelProgressPercent = ref<number>(0);
  const currentStreak        = ref<number>(0);
  const completedModuleIds   = ref<string[]>([]);
  const isSyncing            = ref<boolean>(false);
  const pendingSyncQueue     = ref<XPSyncPayload[]>(loadSyncQueue());

  // Getters
  const isModuleCompleted = computed(
    () => (moduleId: string) => completedModuleIds.value.includes(moduleId),
  );

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Khởi động: đồng bộ dữ liệu từ server nếu đã đăng nhập.
   * Gọi trong App.vue sau khi useAuthStore.init() hoàn thành.
   */
  async function initFromServer(): Promise<void> {
    const token = authStore.getAccessToken();
    if (!token) return; // Guest mode — không sync

    try {
      const data = await fetchUserProgress(token);
      _hydrateFromDto(data);

      // Flush pending sync queue (XP tích lũy khi offline)
      await _flushPendingQueue(token);
    } catch {
      // Server không khả dụng → tiếp tục dùng local state
    }
  }

  /**
   * Cộng XP sau sự kiện học tập.
   * Tính local ngay lập tức → sync server background.
   */
  async function syncXP(amount: number, reason: string): Promise<void> {
    // Cập nhật local ngay (optimistic update)
    totalXP.value += amount;
    _recalculateLevel();

    const payload: XPSyncPayload = { amount, reason };
    const token = authStore.getAccessToken();

    if (!token) {
      // Offline/guest: lưu vào queue để sync sau
      pendingSyncQueue.value.push(payload);
      saveSyncQueue(pendingSyncQueue.value);
      return;
    }

    try {
      isSyncing.value = true;
      const result = await syncXPToServer(token, payload);
      // Cập nhật lại với giá trị server (single source of truth)
      totalXP.value      = result.totalXP;
      currentLevel.value = result.currentLevel;
    } catch {
      // Server lỗi → giữ local state, queue lại
      pendingSyncQueue.value.push(payload);
      saveSyncQueue(pendingSyncQueue.value);
    } finally {
      isSyncing.value = false;
    }
  }

  /**
   * Đánh dấu module hoàn thành (optimistic local + sync server).
   */
  async function completeModule(moduleId: string): Promise<void> {
    if (completedModuleIds.value.includes(moduleId)) return;

    completedModuleIds.value = [...completedModuleIds.value, moduleId];

    const token = authStore.getAccessToken();
    if (!token) return;

    try {
      await markModuleComplete(token, moduleId);
    } catch {
      // Server lỗi → đã lưu local, sẽ sync lần sau
    }
  }

  // ── Private ────────────────────────────────────────────────────────────────

  function _hydrateFromDto(data: UserProgressDto): void {
    totalXP.value              = data.totalXP;
    currentLevel.value         = data.currentLevel;
    xpToNextLevel.value        = data.xpToNextLevel;
    levelProgressPercent.value = data.levelProgressPercent;
    currentStreak.value        = data.currentStreak;
    completedModuleIds.value   = data.completedModuleIds;
  }

  /** Tính cấp độ đơn giản theo công thức backend: Level = 1 + floor(sqrt(XP/100)) */
  function _recalculateLevel(): void {
    const newLevel = 1 + Math.floor(Math.sqrt(totalXP.value / 100));
    currentLevel.value = newLevel;
  }

  async function _flushPendingQueue(token: string): Promise<void> {
    if (pendingSyncQueue.value.length === 0) return;

    const queue = [...pendingSyncQueue.value];
    pendingSyncQueue.value = [];
    saveSyncQueue([]);

    for (const payload of queue) {
      try {
        await syncXPToServer(token, payload);
      } catch {
        // Thất bại lần 2 → bỏ qua (không để loop vô tận)
      }
    }
  }

  return {
    totalXP,
    currentLevel,
    xpToNextLevel,
    levelProgressPercent,
    currentStreak,
    completedModuleIds,
    isSyncing,
    isModuleCompleted,
    initFromServer,
    syncXP,
    completeModule,
  };
});
