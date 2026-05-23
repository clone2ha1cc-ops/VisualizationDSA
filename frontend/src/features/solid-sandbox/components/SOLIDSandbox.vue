<template>
  <div class="solid-sandbox bg-[#0e1726]/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
    
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-slate-800 pb-4">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-amber-400">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        <span class="text-xs font-bold uppercase tracking-wider text-slate-300">SOLID Inspector & LCOM4 Linter</span>
      </div>
      <div class="flex gap-1.5">
        <span class="text-[10px] font-bold uppercase tracking-wider bg-amber-950/40 text-amber-400 border border-amber-800/40 px-2 py-1 rounded-lg">
          Sprint 7
        </span>
      </div>
    </div>

    <!-- SOLID Principles Summary -->
    <div class="grid grid-cols-5 gap-2">
      <div 
        v-for="(principle, idx) in solidPrinciples" 
        :key="idx"
        class="p-3 rounded-lg border text-center cursor-pointer transition-all"
        :class="activePrinciple === idx ? 'bg-amber-900/30 border-amber-700/40' : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800/50'"
        @click="activePrinciple = idx"
      >
        <div class="text-lg font-bold" :class="principle.color">{{ principle.letter }}</div>
        <div class="text-[10px] font-bold uppercase text-slate-400 mt-1">{{ principle.name }}</div>
      </div>
    </div>

    <!-- Active Principle Details -->
    <div class="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-lg bg-amber-950/50 border border-amber-800/30 flex items-center justify-center text-xl font-bold" :class="solidPrinciples[activePrinciple].color">
          {{ solidPrinciples[activePrinciple].letter }}
        </div>
        <div>
          <div class="text-sm font-bold text-slate-200">{{ solidPrinciples[activePrinciple].fullName }}</div>
          <div class="text-xs text-slate-400 mt-1">{{ solidPrinciples[activePrinciple].description }}</div>
        </div>
      </div>
    </div>

    <!-- LCOM4 Cohesion Analyzer -->
    <div class="lcom4-panel bg-[#070b13]/60 border border-slate-800 rounded-xl p-4">
      <div class="flex items-center justify-between mb-4">
        <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <svg class="w-4 h-4 text-emerald-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          LCOM4 Cohesion Analyzer (SRP Check)
        </div>
        <button 
          @click="analyzeCohesion"
          class="px-3 py-1.5 bg-emerald-950/40 border border-emerald-700/40 text-emerald-400 text-[10px] font-bold rounded-lg hover:bg-emerald-900/40 transition-all"
        >
          Phân tích Cohesion
        </button>
      </div>

      <!-- Class Selection -->
      <div class="flex gap-2 mb-4">
        <button 
          v-for="cls in sampleClasses" 
          :key="cls.name"
          @click="selectedClass = cls"
          class="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
          :class="selectedClass.name === cls.name ? 'bg-cyan-950/50 text-cyan-400 border border-cyan-800/40' : 'bg-slate-900/50 text-slate-400 border border-slate-800'"
        >
          {{ cls.name }}
        </button>
      </div>

      <!-- LCOM4 Result -->
      <div v-if="lcom4Result" class="space-y-3">
        <div class="flex items-center justify-between p-3 rounded-lg" :class="lcom4Result.violatesSRP ? 'bg-red-950/30 border border-red-800/40' : 'bg-emerald-950/30 border border-emerald-800/40'">
          <div>
            <div class="text-[10px] text-slate-400 uppercase">LCOM4 Value</div>
            <div class="text-2xl font-bold" :class="lcom4Result.violatesSRP ? 'text-red-400' : 'text-emerald-400'">
              {{ lcom4Result.lcom4Value }}
            </div>
          </div>
          <div class="text-right">
            <div class="text-[10px] text-slate-400 uppercase">Cohesion Score</div>
            <div class="text-lg font-bold" :class="lcom4Result.violatesSRP ? 'text-red-400' : 'text-emerald-400'">
              {{ (lcom4Result.cohesionScore * 100).toFixed(0) }}%
            </div>
          </div>
        </div>

        <div class="text-xs" :class="lcom4Result.violatesSRP ? 'text-red-300' : 'text-emerald-300'">
          {{ lcom4Result.analysis }}
        </div>

        <!-- Connected Components Visualization -->
        <div class="space-y-2">
          <div class="text-[10px] font-bold uppercase text-slate-500">Connected Components</div>
          <div class="flex flex-wrap gap-2">
            <div 
              v-for="(component, idx) in lcom4Result.connectedComponents" 
              :key="idx"
              class="px-2 py-1 rounded text-[10px] font-mono"
              :class="lcom4Result.connectedComponents.length > 1 ? 'bg-red-950/30 text-red-400 border border-red-800/30' : 'bg-emerald-950/30 text-emerald-400 border border-emerald-800/30'"
            >
              Group {{ idx + 1 }}: {{ component.join(', ') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- LSP Violation Demo with Cracked Glass -->
    <div class="lsp-panel bg-[#070b13]/60 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
      <div class="flex items-center justify-between mb-4">
        <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <svg class="w-4 h-4 text-rose-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
          </svg>
          LSP Substitution Demo
        </div>
        <button 
          @click="triggerLSPViolation"
          class="px-3 py-1.5 bg-rose-950/40 border border-rose-700/40 text-rose-400 text-[10px] font-bold rounded-lg hover:bg-rose-900/40 transition-all"
        >
          Vi phạm LSP
        </button>
      </div>

      <!-- Class Hierarchy -->
      <div class="grid grid-cols-3 gap-3 mb-4">
        <div class="p-3 bg-emerald-900/30 border border-emerald-700/30 rounded-lg text-center">
          <div class="text-xs font-bold text-emerald-400">Bird</div>
          <div class="text-[10px] text-slate-400 mt-1">fly()</div>
        </div>
        <div class="p-3 bg-cyan-900/30 border border-cyan-700/30 rounded-lg text-center">
          <div class="text-xs font-bold text-cyan-400">Sparrow</div>
          <div class="text-[10px] text-slate-400 mt-1">@Override fly()</div>
        </div>
        <div 
          class="p-3 rounded-lg text-center cursor-pointer transition-all"
          :class="showCrackedGlass ? 'bg-red-900/50 border border-red-700/50 animate-pulse' : 'bg-rose-900/30 border border-rose-700/30'"
          @click="triggerLSPViolation"
        >
          <div class="text-xs font-bold" :class="showCrackedGlass ? 'text-red-400' : 'text-rose-400'">Ostrich</div>
          <div class="text-[10px] text-slate-400 mt-1">throws Error</div>
          <div v-if="showCrackedGlass" class="text-[9px] text-red-400 mt-1 font-bold">VI PHẠM LSP!</div>
        </div>
      </div>

      <!-- Cracked Glass Canvas Overlay -->
      <div v-if="showCrackedGlass" class="absolute inset-0 pointer-events-none">
        <canvas 
          ref="crackCanvas"
          class="w-full h-full"
        />
      </div>

      <div class="text-xs text-slate-400">
        <span class="font-bold text-rose-400">LSP Violation:</span> Ostrich kế thừa Bird nhưng không thể fly() - 
        đây là vi phạm nguyên lý thay thế Liskov. Click "Vi phạm LSP" để xem hiệu ứng kính vỡ.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import {
  SOLIDLCOM4Calculator,
  type ClassCohesionData,
  type LCOM4Result,
} from '../SOLIDLCOM4Calculator';
import { LspGlassCracker } from '../LspGlassCracker';

// SOLID Principles Data
const solidPrinciples = [
  {
    letter: 'S',
    name: 'SRP',
    fullName: 'Single Responsibility Principle',
    description: 'Một class chỉ nên có một lý do để thay đổi. Phân tích bằng LCOM4 cohesion score.',
    color: 'text-emerald-400',
  },
  {
    letter: 'O',
    name: 'OCP',
    fullName: 'Open/Closed Principle',
    description: 'Mở rộng behavior mà không cần sửa đổi source code hiện có.',
    color: 'text-blue-400',
  },
  {
    letter: 'L',
    name: 'LSP',
    fullName: 'Liskov Substitution Principle',
    description: 'Lớp con phải có thể thay thế lớp cha mà không làm hỏng chương trình.',
    color: 'text-rose-400',
  },
  {
    letter: 'I',
    name: 'ISP',
    fullName: 'Interface Segregation Principle',
    description: 'Client không nên phụ thuộc vào interfaces họ không sử dụng.',
    color: 'text-purple-400',
  },
  {
    letter: 'D',
    name: 'DIP',
    fullName: 'Dependency Inversion Principle',
    description: 'Phụ thuộc vào abstraction, không phụ thuộc vào concrete implementation.',
    color: 'text-amber-400',
  },
];

const activePrinciple = ref(2); // LSP active by default

// LCOM4 Analysis
const lcom4Result = ref<LCOM4Result | null>(null);

const sampleClasses: ClassCohesionData[] = [
  {
    className: 'GoodEmployee',
    fields: [
      { name: 'name', type: 'string' },
      { name: 'salary', type: 'number' },
    ],
    methods: [
      { name: 'getName', accessedFields: ['name'] },
      { name: 'setName', accessedFields: ['name'] },
      { name: 'getSalary', accessedFields: ['salary'] },
      { name: 'setSalary', accessedFields: ['salary'] },
      { name: 'calculateBonus', accessedFields: ['salary'] },
    ],
  },
  {
    className: 'BadEmployee',
    fields: [
      { name: 'name', type: 'string' },
      { name: 'salary', type: 'number' },
      { name: 'printerName', type: 'string' },
      { name: 'reportFormat', type: 'string' },
    ],
    methods: [
      { name: 'getName', accessedFields: ['name'] },
      { name: 'getSalary', accessedFields: ['salary'] },
      { name: 'printReport', accessedFields: ['printerName', 'reportFormat'] },
      { name: 'formatReport', accessedFields: ['reportFormat'] },
      { name: 'sendToPrinter', accessedFields: ['printerName'] },
    ],
  },
];

const selectedClass = ref<ClassCohesionData>(sampleClasses[0]);

function analyzeCohesion() {
  const result = SOLIDLCOM4Calculator.calculateLCOM4(selectedClass.value);
  lcom4Result.value = result;
}

// LSP Cracked Glass Effect
const showCrackedGlass = ref(false);
const crackCanvas = ref<HTMLCanvasElement | null>(null);

async function triggerLSPViolation() {
  showCrackedGlass.value = true;
  
  await nextTick();
  
  const canvas = crackCanvas.value;
  if (!canvas) return;
  
  // Set canvas size to match parent
  const parent = canvas.parentElement;
  if (parent) {
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
  }
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Trigger cracked glass animation at center
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(canvas.width, canvas.height) * 0.4;
  
  LspGlassCracker.animateCracks(ctx, centerX, centerY, radius, 600);
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    showCrackedGlass.value = false;
  }, 3000);
}

// Initial analysis
onMounted(() => {
  analyzeCohesion();
});
</script>

<style scoped>
.solid-sandbox {
  transition: all 0.3s ease;
}

.lcom4-panel,
.lsp-panel {
  transition: all 0.3s ease;
}
</style>
