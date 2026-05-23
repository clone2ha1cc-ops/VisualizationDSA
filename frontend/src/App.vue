<template>
  <div class="min-h-screen flex flex-col bg-[#070b13] text-[#f8fafc]">
    <!-- Cyber Navbar -->
    <header class="flex items-center justify-between px-7 py-4 bg-[#0e1726]/65 backdrop-blur-md border-b border-[#1e293b]/80 sticky top-0 z-50">
      <div class="flex items-center gap-3">
        <div class="flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 w-[38px] h-[38px] rounded-xl shadow-[0_4px_14px_rgba(6,182,212,0.3)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-white">
            <line x1="6" y1="3" x2="6" y2="15" />
            <circle cx="18" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M18 9a9 9 0 0 1-9 9" />
          </svg>
        </div>
        <div class="flex flex-col">
          <h1 class="text-[19px] font-extrabold tracking-tight text-white m-0 flex items-center gap-2">
            Algolens <span class="text-[10px] font-bold uppercase tracking-[0.8px] bg-cyan-500/15 border border-cyan-500/30 text-cyan-500 px-1.5 py-0.5 rounded">DSA Sandbox</span>
          </h1>
          <p class="text-[11px] text-slate-400 font-medium m-0 mt-[1px]">Trực quan hóa Thuật toán Bằng Động Họa Cực Hạn</p>
        </div>
      </div>

      <!-- Mid-status indicator -->
      <div class="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-mono font-bold rounded-xl">
        <span class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)] animate-pulse"></span>
        <span>JavaScript Sandbox VM Active</span>
      </div>

      <!-- Navbar controls -->
      <div class="flex items-center">
        <a 
          href="https://github.com" 
          target="_blank" 
          class="flex items-center gap-2 px-4 py-2 bg-[#0d1527]/50 border border-[#1e293b]/80 text-slate-400 text-xs font-semibold no-underline rounded-xl transition-all duration-300 hover:text-white hover:border-white/15 hover:bg-slate-800/40 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
          <span>GitHub Documentation</span>
        </a>
      </div>
    </header>

    <!-- Main Grid Dashboard layout -->
    <main class="flex-1 w-full max-w-[1600px] mx-auto p-6">
      <div class="grid grid-cols-1 xl:grid-cols-[7.5fr_4.5fr] gap-6">
        
        <!-- Left column: Canvas & Control Console -->
        <section class="flex flex-col gap-6">
          <div class="flex items-center justify-between px-1">
            <h2 class="text-[12.5px] font-bold uppercase tracking-[0.8px] text-slate-500 flex items-center gap-2 m-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-cyan-500">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
              Sorting Visualizer — Sprint 2
            </h2>
            <div style="display:flex; gap:8px; align-items:center;">
              <span class="text-[10px] font-bold uppercase tracking-[0.07em] bg-rose-500/10 border border-rose-500/35 text-rose-500 px-2 py-0.5 rounded">Sprint 2 · DSA Library</span>
              <div class="text-[11px] text-slate-500 font-medium">Kéo để di chuyển / Cuộn để Zoom</div>
            </div>
          </div>

          <!-- ✅ Sprint 2: Array Bar Sorting Visualizer -->
          <ArrayBarVisualizer />

          <!-- Sprint 1 legacy canvas (hidden in sprint-2 mode) -->
          <!-- <AlgorithmCanvas /> -->
          
          <VcrControlPanel />
        </section>

        <!-- Right column: Code input & step highlight interpreter -->
        <section class="flex flex-col gap-6">
          <CodeEditor />
          <PseudocodeViewer />
        </section>

      </div>
    </main>

    <!-- Footer -->
    <footer class="text-center p-6 text-[11px] text-slate-500 border-t border-[#0d1527]/80 bg-[#070b13] mt-auto">
      <p>© 2026 Algolens Sandbox - Phát triển bởi Antigravity AI</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

// ─── Feature Modules (Modular Architecture) ───────────────────────────────────
import { useVcrStore }                               from './features/vcr-player';
import { AlgorithmCanvas, ArrayBarVisualizer }       from './features/algorithm-sandbox';
import { VcrControlPanel }                           from './features/vcr-player';
import { CodeEditor, PseudocodeViewer }              from './features/code-editor';

const vcrStore = useVcrStore();

onMounted(() => {
  // Sprint 2: ArrayBarVisualizer tự quản lý frames
  // Sprint 1 legacy: vcrStore.compileAndLoad();
});
</script>

