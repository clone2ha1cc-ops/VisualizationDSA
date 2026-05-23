<template>
  <div class="gamification-panel bg-[#0e1726]/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
    
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-slate-800 pb-4">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-yellow-400">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
          <path d="M4 22h16"/>
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
        </svg>
        <span class="text-xs font-bold uppercase tracking-wider text-slate-300">Gamification & Rewards</span>
      </div>
      <div class="flex gap-1.5">
        <span class="text-[10px] font-bold uppercase tracking-wider bg-yellow-950/40 text-yellow-400 border border-yellow-800/40 px-2 py-1 rounded-lg">
          Sprint 12
        </span>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 p-1 bg-slate-900/50 rounded-lg">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        class="flex-1 px-3 py-2 rounded-md text-[11px] font-bold uppercase transition-all"
        :class="activeTab === tab.id ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-700/40' : 'text-slate-400 hover:text-slate-200'"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- Progress Tab -->
    <div v-if="activeTab === 'progress'" class="space-y-4">
      <!-- Level Card -->
      <div class="p-4 bg-gradient-to-r from-slate-900/50 to-slate-800/30 border border-slate-700 rounded-xl">
        <div class="flex items-center gap-4">
          <div 
            class="w-16 h-16 rounded-full border-2 flex items-center justify-center text-xl font-bold"
            :style="{ borderColor: currentLevel.color, color: currentLevel.color, backgroundColor: currentLevel.color + '20' }"
          >
            {{ progress.currentLevel }}
          </div>
          <div class="flex-1">
            <div class="text-sm font-bold text-slate-200">{{ currentLevel.name }}</div>
            <div class="text-[10px] text-slate-400">{{ progress.totalXP }} XP Total</div>
            <div class="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                class="h-full rounded-full transition-all"
                :style="{ width: levelProgressPercent + '%', backgroundColor: currentLevel.color }"
              />
            </div>
            <div class="text-[9px] text-slate-500 mt-1">
              {{ progress.xpInCurrentLevel }} / {{ progress.xpToNextLevel }} XP to next level
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-3 gap-3">
        <div class="p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-center">
          <div class="text-lg font-bold text-emerald-400">{{ stats.quizzesTaken }}</div>
          <div class="text-[9px] text-slate-500 uppercase">Quizzes</div>
        </div>
        <div class="p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-center">
          <div class="text-lg font-bold text-amber-400">{{ stats.badgesEarned }}</div>
          <div class="text-[9px] text-slate-500 uppercase">Badges</div>
        </div>
        <div class="p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-center">
          <div class="text-lg font-bold text-purple-400">{{ stats.modulesCompleted }}</div>
          <div class="text-[9px] text-slate-500 uppercase">Modules</div>
        </div>
      </div>

      <!-- Earn Badges Button -->
      <div class="flex gap-2">
        <button 
          @click="simulateQuizComplete"
          class="flex-1 px-3 py-2 bg-emerald-950/40 border border-emerald-700/40 text-emerald-400 text-[10px] font-bold rounded-lg hover:bg-emerald-900/40 transition-all"
        >
          +50 XP (Quiz)
        </button>
        <button 
          @click="simulateModuleComplete"
          class="flex-1 px-3 py-2 bg-blue-950/40 border border-blue-700/40 text-blue-400 text-[10px] font-bold rounded-lg hover:bg-blue-900/40 transition-all"
        >
          +100 XP (Module)
        </button>
      </div>
    </div>

    <!-- Badges Tab -->
    <div v-if="activeTab === 'badges'" class="space-y-4">
      <div class="text-[10px] font-bold uppercase text-slate-500">Earned Badges ({{ progress.badges.length }}/{{ allBadges.length }})</div>
      <div class="grid grid-cols-2 gap-3">
        <div 
          v-for="badge in progress.badges" 
          :key="badge.id"
          class="p-3 rounded-lg border bg-slate-900/50 border-slate-800"
        >
          <div class="flex items-center gap-3">
            <div 
              class="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              :style="{ backgroundColor: badge.color + '20', border: `1px solid ${badge.color}` }"
            >
              {{ badge.icon }}
            </div>
            <div>
              <div class="text-xs font-bold" :style="{ color: badge.color }">{{ badge.name }}</div>
              <div class="text-[9px] text-slate-500">{{ badge.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="lockedBadges.length > 0" class="mt-4">
        <div class="text-[10px] font-bold uppercase text-slate-500 mb-2">Locked Badges</div>
        <div class="flex flex-wrap gap-2">
          <div 
            v-for="badge in lockedBadges" 
            :key="badge.id"
            class="px-3 py-2 rounded-lg bg-slate-900/30 border border-slate-800 text-slate-600 opacity-50"
          >
            <span class="text-sm">{{ badge.icon }}</span>
            <span class="text-[10px] ml-1">{{ badge.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Embed Tab -->
    <div v-if="activeTab === 'embed'" class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-[10px] text-slate-500">Widget Type</label>
          <select v-model="embedConfig.widgetType" class="w-full mt-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300">
            <option value="array-visualizer">Array Visualizer</option>
            <option value="sorting-algo">Sorting Algorithm</option>
            <option value="graph-playground">Graph Playground</option>
            <option value="oop-sandbox">OOP Sandbox</option>
          </select>
        </div>
        <div>
          <label class="text-[10px] text-slate-500">Theme</label>
          <select v-model="embedConfig.theme" class="w-full mt-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300">
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-[10px] text-slate-500">Width (px)</label>
          <input v-model.number="embedConfig.width" type="number" class="w-full mt-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300" />
        </div>
        <div>
          <label class="text-[10px] text-slate-500">Height (px)</label>
          <input v-model.number="embedConfig.height" type="number" class="w-full mt-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300" />
        </div>
      </div>

      <div class="flex gap-4">
        <label class="flex items-center gap-2 text-[10px] text-slate-400">
          <input v-model="embedConfig.autoPlay" type="checkbox" class="rounded bg-slate-900 border-slate-700" />
          Auto Play
        </label>
        <label class="flex items-center gap-2 text-[10px] text-slate-400">
          <input v-model="embedConfig.showControls" type="checkbox" class="rounded bg-slate-900 border-slate-700" />
          Show Controls
        </label>
      </div>

      <div class="p-3 bg-slate-950 border border-slate-800 rounded-lg">
        <div class="text-[10px] text-slate-500 mb-2">Embed Code</div>
        <pre class="text-[10px] text-slate-400 overflow-x-auto whitespace-pre-wrap">{{ generatedEmbedCode }}</pre>
      </div>

      <button 
        @click="copyEmbedCode"
        class="w-full px-3 py-2 bg-yellow-950/40 border border-yellow-700/40 text-yellow-400 text-xs font-bold rounded-lg hover:bg-yellow-900/40 transition-all"
      >
        {{ copySuccess ? '✓ Copied!' : 'Copy Embed Code' }}
      </button>
    </div>

    <!-- Level Up Notification -->
    <div v-if="showLevelUp" class="p-3 bg-gradient-to-r from-yellow-900/50 to-amber-900/30 border border-yellow-700/50 rounded-lg animate-pulse">
      <div class="flex items-center gap-2">
        <span class="text-xl">🎉</span>
        <div>
          <div class="text-sm font-bold text-yellow-400">Level Up!</div>
          <div class="text-[10px] text-yellow-300">You've reached Level {{ progress.currentLevel }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  XPEngine,
  type UserProgress,
  type Badge,
  type LevelConfig,
  type EmbedConfig,
} from '../XPEngine';

// Tabs
const tabs = [
  { id: 'progress', name: 'Progress' },
  { id: 'badges', name: 'Badges' },
  { id: 'embed', name: 'Embed' },
];
const activeTab = ref('progress');

// XP Engine
const xpEngine = new XPEngine(
  'demo-user',
  (newLevel) => {
    showLevelUp.value = true;
    setTimeout(() => {
      showLevelUp.value = false;
    }, 3000);
  },
  (badge) => {
    console.log('Earned badge:', badge.name);
  }
);

// State
const progress = ref<UserProgress>(xpEngine.getProgress());
const allBadges = ref<Omit<Badge, 'earnedAt'>[]>(XPEngine.getAllBadges());
const showLevelUp = ref(false);
const copySuccess = ref(false);

// Embed config
const embedConfig = ref<EmbedConfig>({
  widgetType: 'array-visualizer',
  width: 800,
  height: 400,
  theme: 'dark',
  autoPlay: false,
  showControls: true,
});

// Computed
const currentLevel = computed<LevelConfig>(() => xpEngine.getCurrentLevelInfo());
const levelProgressPercent = computed(() => xpEngine.getLevelProgressPercent());
const stats = computed(() => xpEngine.getStats());
const lockedBadges = computed(() => {
  const earnedIds = new Set(progress.value.badges.map((b) => b.id));
  return allBadges.value.filter((b) => !earnedIds.has(b.id));
});
const generatedEmbedCode = computed(() => XPEngine.generateEmbedCode(embedConfig.value));

// Methods
function simulateQuizComplete(): void {
  xpEngine.awardXP({
    type: 'QUIZ_COMPLETE',
    xpAmount: 50,
    description: 'Completed quiz',
  });
  updateProgress();
}

function simulateModuleComplete(): void {
  xpEngine.completeModule(`module-${Date.now()}`);
  xpEngine.awardXP({
    type: 'MODULE_FINISH',
    xpAmount: 100,
    description: 'Completed learning module',
  });
  updateProgress();
}

function updateProgress(): void {
  progress.value = xpEngine.getProgress();
}

function copyEmbedCode(): void {
  navigator.clipboard.writeText(generatedEmbedCode.value);
  copySuccess.value = true;
  setTimeout(() => {
    copySuccess.value = false;
  }, 2000);
}

// Init
onMounted(() => {
  // Simulate some initial progress
  xpEngine.awardXP({
    type: 'QUIZ_COMPLETE',
    xpAmount: 150,
    description: 'Initial XP',
  });
  updateProgress();
});
</script>

<style scoped>
.gamification-panel {
  transition: all 0.3s ease;
}
</style>
