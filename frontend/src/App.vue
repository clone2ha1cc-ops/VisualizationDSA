<template>
  <div class="h-screen flex flex-col bg-slate-950 text-slate-200 overflow-hidden">
    <!-- Header -->
    <header class="flex-shrink-0 bg-slate-900 border-b border-slate-800">
      <div class="flex items-center justify-between px-4 py-3">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center">
            <span class="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <h1 class="text-base font-bold text-white">AlgoLens</h1>
            <p class="text-[10px] text-slate-400">DSA Visualization</p>
          </div>
        </div>

        <!-- Tab Navigation -->
        <nav class="flex items-center gap-1 overflow-x-auto max-w-[70vw]">
          <RouterLink v-for="tab in APP_TABS" :key="tab.id" :to="tab.path"
            class="px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5"
            active-class="bg-slate-700 text-white"
            inactive-class="text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <BaseIcon :name="tab.id" class="w-3.5 h-3.5" />
            {{ tab.name }}
          </RouterLink>
        </nav>

        <!-- Right side: User badge + GitHub -->
        <div class="flex items-center gap-3 flex-shrink-0">
          <div v-if="authStore.isAuthenticated" class="flex items-center gap-2">
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
              <div class="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                <span class="text-white text-[10px] font-bold">{{ authStore.userName.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="leading-tight">
                <p class="text-xs font-semibold text-white">{{ authStore.userName }}</p>
                <p class="text-[10px] text-cyan-400">Lv.{{ authStore.userLevel }} &middot; {{ authStore.userXP }} XP</p>
              </div>
            </div>
            <button @click="handleLogout" class="text-xs text-slate-400 hover:text-red-400 transition-colors px-2 py-1 rounded" title="Đăng xuất">⏏</button>
          </div>
          <button v-else @click="showLoginModal = true"
            class="px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors">
            Đăng nhập
          </button>

          <!-- GitHub -->
          <a href="https://github.com/maitieubao/VisualizationDSA" target="_blank"
            class="text-slate-400 hover:text-white transition-colors" aria-label="GitHub Repository">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>
    </header>

    <!-- Main Content — RouterView -->
    <main class="flex-1 flex flex-col overflow-hidden p-4 gap-4">
      <RouterView v-slot="{ Component }">
        <Transition name="tab-fade" mode="out-in">
          <component :is="Component" class="flex-1 min-h-0" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterView, RouterLink } from 'vue-router';
import { useAuthStore } from './features/auth/store/useAuthStore';
import { APP_TABS } from './appTabs';

const authStore      = useAuthStore();
const showLoginModal = ref(false);

async function handleLogout(): Promise<void> { await authStore.logOut(); }
</script>

<style>
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #475569; }
.tab-fade-enter-active, .tab-fade-leave-active { transition: opacity 0.15s ease; }
.tab-fade-enter-from, .tab-fade-leave-to { opacity: 0; }
</style>
