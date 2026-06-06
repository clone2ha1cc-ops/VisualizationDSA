<template>
  <div class="dashboard">
    <!-- Greeting Banner -->
    <div class="greeting-banner">
      <h1 class="greeting-banner__title">
        Chào mừng <span class="greeting-banner__name">{{ authStore.userName }}</span> quay trở lại!
      </h1>
      <p class="greeting-banner__sub">
        Level {{ authStore.userLevel }} · {{ authStore.userXP }} XP ·
        <span v-if="authStore.isTeacher" class="role-tag role-tag--teacher">Giảng viên</span>
        <span v-else class="role-tag role-tag--student">Sinh viên</span>
      </p>
    </div>

    <!-- Dashboard Grid -->
    <div class="dashboard__grid">
      <!-- XP Progress Wheel -->
      <div class="dash-card xp-card">
        <h3 class="dash-card__title">Tiến trình XP</h3>
        <div class="xp-wheel">
          <svg viewBox="0 0 120 120" class="xp-wheel__svg">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8" />
            <circle cx="60" cy="60" r="52"
              fill="none"
              stroke="url(#xpGrad)"
              stroke-width="8"
              stroke-linecap="round"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="dashOffset"
              class="xp-wheel__progress"
            />
            <defs>
              <linearGradient id="xpGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#6366f1" />
                <stop offset="100%" stop-color="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <div class="xp-wheel__center">
            <span class="xp-wheel__level">Lv.{{ authStore.userLevel }}</span>
            <span class="xp-wheel__xp">{{ authStore.userXP }} XP</span>
          </div>
        </div>
        <p class="xp-card__hint">{{ xpToNext }} XP để lên level tiếp theo</p>
      </div>

      <!-- Top Badges -->
      <div class="dash-card badges-card">
        <h3 class="dash-card__title">Huy hiệu đã mở</h3>
        <div class="badges-grid">
          <div v-for="badge in topBadges" :key="badge.id" class="badge-item">
            <span class="badge-item__icon">{{ badge.icon }}</span>
            <span class="badge-item__name">{{ badge.name }}</span>
          </div>
          <div v-if="topBadges.length === 0" class="badges-empty">
            Chưa có huy hiệu nào. Hãy bắt đầu học!
          </div>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="dash-card quicklinks-card">
        <h3 class="dash-card__title">Truy cập nhanh</h3>
        <div class="quicklinks">
          <router-link to="/sorting" class="quicklink">
            <span class="quicklink__icon">📊</span>
            <span>Sorting</span>
          </router-link>
          <router-link to="/quiz" class="quicklink">
            <span class="quicklink__icon">📝</span>
            <span>Quiz</span>
          </router-link>
          <router-link to="/gamification" class="quicklink">
            <span class="quicklink__icon">🏆</span>
            <span>Leaderboard</span>
          </router-link>
          <router-link v-if="authStore.isTeacher" to="/teacher" class="quicklink quicklink--teacher">
            <span class="quicklink__icon">🎓</span>
            <span>Teacher Panel</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../features/auth/store/useAuthStore';

const authStore = useAuthStore();

const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000];
const circumference = 2 * Math.PI * 52;

const xpToNext = computed(() => {
  const lvl = authStore.userLevel;
  if (lvl >= levelThresholds.length) return 0;
  return levelThresholds[lvl] - authStore.userXP;
});

const progressPercent = computed(() => {
  const lvl = authStore.userLevel;
  if (lvl <= 0 || lvl >= levelThresholds.length) return 100;
  const prev = levelThresholds[lvl - 1];
  const next = levelThresholds[lvl];
  const range = next - prev;
  if (range <= 0) return 100;
  return Math.min(100, ((authStore.userXP - prev) / range) * 100);
});

const dashOffset = computed(() => {
  return circumference * (1 - progressPercent.value / 100);
});

interface BadgeDisplay {
  id: string;
  name: string;
  icon: string;
}

const topBadges = computed<BadgeDisplay[]>(() => {
  const badges = authStore.currentUser?.badges ?? [];
  return badges.slice(0, 3).map((b: Record<string, unknown>) => ({
    id: String(b.id ?? ''),
    name: String(b.name ?? ''),
    icon: String(b.icon ?? '🏅'),
  }));
});
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  min-height: 100%;
  overflow-y: auto;
}

.greeting-banner {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.08));
  border: 1px solid rgba(99, 102, 241, 0.2);
  animation: fadeSlideIn 0.5s ease;
}

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.greeting-banner__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary, #e2e8f0);
}

.greeting-banner__name {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.greeting-banner__sub {
  font-size: 0.9rem;
  color: var(--text-secondary, #94a3b8);
  margin-top: 0.5rem;
}

.role-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.role-tag--teacher {
  background: rgba(234, 179, 8, 0.15);
  color: #eab308;
}

.role-tag--student {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
}

/* ── Grid ───────────────────────────────── */
.dashboard__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.dash-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem;
}

.dash-card__title {
  font-size: 0.9rem;
  color: var(--text-secondary, #94a3b8);
  margin-bottom: 1rem;
  font-weight: 500;
}

/* ── XP Wheel ──────────────────────────── */
.xp-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.xp-wheel {
  position: relative;
  width: 140px;
  height: 140px;
}

.xp-wheel__svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.xp-wheel__progress {
  transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.xp-wheel__center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.xp-wheel__level {
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary, #e2e8f0);
}

.xp-wheel__xp {
  font-size: 0.75rem;
  color: var(--text-tertiary, #64748b);
}

.xp-card__hint {
  font-size: 0.8rem;
  color: var(--text-tertiary, #64748b);
  margin-top: 0.75rem;
}

/* ── Badges ────────────────────────────── */
.badges-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.badge-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.badge-item__icon {
  font-size: 1.25rem;
}

.badge-item__name {
  font-size: 0.8rem;
  color: var(--text-primary, #e2e8f0);
}

.badges-empty {
  font-size: 0.85rem;
  color: var(--text-tertiary, #64748b);
  font-style: italic;
}

/* ── Quick Links ───────────────────────── */
.quicklinks {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quicklink {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  color: var(--text-primary, #e2e8f0);
  text-decoration: none;
  font-size: 0.9rem;
  transition: background 0.15s ease;
}

.quicklink:hover {
  background: rgba(255, 255, 255, 0.06);
}

.quicklink--teacher {
  border: 1px solid rgba(234, 179, 8, 0.2);
}

.quicklink__icon {
  font-size: 1.1rem;
}
</style>
