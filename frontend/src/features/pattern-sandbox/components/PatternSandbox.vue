<template>
  <div class="pattern-sandbox bg-[#0e1726]/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
    
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-slate-800 pb-4">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-pink-400">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        <span class="text-xs font-bold uppercase tracking-wider text-slate-300">Design Patterns Sandbox</span>
      </div>
      <div class="flex gap-1.5">
        <span class="text-[10px] font-bold uppercase tracking-wider bg-pink-950/40 text-pink-400 border border-pink-800/40 px-2 py-1 rounded-lg">
          Sprint 9
        </span>
      </div>
    </div>

    <!-- Pattern Tabs -->
    <div class="flex gap-2 p-1 bg-slate-900/50 rounded-lg">
      <button 
        v-for="pattern in patterns" 
        :key="pattern.id"
        @click="activePattern = pattern.id"
        class="flex-1 px-3 py-2 rounded-md text-[11px] font-bold uppercase transition-all"
        :class="activePattern === pattern.id ? 'bg-pink-900/50 text-pink-400 border border-pink-700/40' : 'text-slate-400 hover:text-slate-200'"
      >
        {{ pattern.name }}
      </button>
    </div>

    <!-- Observer Pattern Panel -->
    <div v-if="activePattern === 'observer'" class="space-y-4">
      <div class="p-3 bg-[#070b13]/60 border border-slate-800 rounded-xl">
        <div class="text-[11px] font-bold uppercase text-slate-500 mb-2">Subject (Publisher)</div>
        <div class="flex items-center gap-3 p-3 bg-amber-900/30 border border-amber-700/40 rounded-lg">
          <div class="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m4.22-10.22 4.24-4.24M6.34 17.66l-4.24 4.24M23 12h-6m-6 0H1m20.24 4.24-4.24-4.24M6.34 6.34 2.1 2.1"/>
            </svg>
          </div>
          <div>
            <div class="text-sm font-bold text-amber-400">NewsPublisher</div>
            <div class="text-[10px] text-slate-400">Observers: {{ subject?.observers.length || 0 }}</div>
          </div>
          <div class="ml-auto flex gap-2">
            <input 
              v-model="newsContent"
              placeholder="Nhập tin tức..."
              class="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs w-32"
              @keyup.enter="publishNews"
            />
            <button 
              @click="publishNews"
              class="px-3 py-1 bg-amber-950/40 border border-amber-700/40 text-amber-400 text-[10px] font-bold rounded hover:bg-amber-900/40 transition-all"
            >
              Publish
            </button>
          </div>
        </div>
      </div>

      <!-- Observers Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div 
          v-for="observer in observers" 
          :key="observer.id"
          class="p-3 rounded-lg border text-center cursor-pointer transition-all relative"
          :class="isObserverAttached(observer.id) ? 'bg-cyan-900/30 border-cyan-700/40' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'"
          @click="toggleObserver(observer)"
        >
          <div class="w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2"
            :class="isObserverAttached(observer.id) ? 'bg-cyan-500/20' : 'bg-slate-800'"
          >
            <svg class="w-4 h-4" :class="isObserverAttached(observer.id) ? 'text-cyan-400' : 'text-slate-500'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="text-xs font-bold" :class="isObserverAttached(observer.id) ? 'text-cyan-400' : 'text-slate-400'">
            {{ observer.name }}
          </div>
          <div class="text-[9px] text-slate-500 mt-1">
            {{ isObserverAttached(observer.id) ? 'Đã đăng ký ✓' : 'Click để đăng ký' }}
          </div>

          <!-- Notification indicator -->
          <div 
            v-if="lastNotification && lastNotification.to === observer.id"
            class="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full animate-ping"
          />
        </div>
      </div>

      <!-- Message Flow Animation Overlay -->
      <div class="relative h-[120px] bg-slate-900/30 rounded-lg overflow-hidden">
        <svg class="absolute inset-0 w-full h-full">
          <defs>
            <marker id="arrowhead-pink" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#ec4899"/>
            </marker>
          </defs>
          <!-- Draw connection lines from subject to attached observers -->
          <path
            v-for="(observer, idx) in attachedObservers"
            :key="idx"
            :d="getNotificationPath(idx)"
            stroke="#ec4899"
            stroke-width="1.5"
            fill="none"
            stroke-dasharray="5,3"
            marker-end="url(#arrowhead-pink)"
            class="opacity-60"
          />
          
          <!-- Animated notification dots -->
          <circle
            v-for="(anim, idx) in notificationAnimations"
            :key="`anim-${idx}`"
            :cx="anim.x"
            :cy="anim.y"
            r="4"
            fill="#ec4899"
            class="animate-pulse"
          />
        </svg>

        <!-- Subject node -->
        <div class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center">
          <span class="text-[10px] font-bold text-amber-400">S</span>
        </div>
      </div>

      <!-- Notification Log -->
      <div v-if="notificationLog.length > 0" class="p-3 bg-slate-900/50 border border-slate-800 rounded-lg max-h-[120px] overflow-y-auto">
        <div class="text-[10px] font-bold uppercase text-slate-500 mb-2">Notification Log</div>
        <div class="space-y-1">
          <div 
            v-for="(log, idx) in notificationLog.slice(-5)" 
            :key="idx"
            class="text-[10px] text-slate-400 flex items-center gap-2"
          >
            <span class="text-pink-400">{{ log.time }}</span>
            <span>Subject → {{ getObserverName(log.to) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Strategy Pattern Panel -->
    <div v-if="activePattern === 'strategy'" class="space-y-4">
      <div class="p-4 bg-[#070b13]/60 border border-slate-800 rounded-xl">
        <div class="text-[11px] font-bold uppercase text-slate-500 mb-3">Context (Client)</div>
        <div class="flex items-center gap-4">
          <div class="p-3 bg-purple-900/30 border border-purple-700/40 rounded-lg flex-1">
            <div class="text-sm font-bold text-purple-400">SortingContext</div>
            <div class="text-[10px] text-slate-400 mt-1">
              Data: [{{ strategyData.join(', ') }}]
            </div>
            <div v-if="strategyResult" class="mt-2 p-2 bg-purple-950/50 rounded text-[10px]">
              <span class="text-slate-400">Result:</span>
              <span class="text-purple-400 font-bold ml-1">{{ strategyResult.result }}</span>
              <span class="text-slate-500 ml-2">({{ strategyResult.timeMs.toFixed(2) }}ms)</span>
            </div>
          </div>
          <div class="text-2xl text-slate-600">→</div>
          <div class="p-3 bg-emerald-900/30 border border-emerald-700/40 rounded-lg w-32">
            <div class="text-[10px] text-slate-400">Current Strategy</div>
            <div class="text-sm font-bold" :class="currentStrategy ? 'text-emerald-400' : 'text-slate-500'">
              {{ currentStrategy?.name || 'None' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Strategy Selection -->
      <div class="grid grid-cols-2 gap-3">
        <button 
          v-for="strategy in strategies" 
          :key="strategy.name"
          @click="setStrategy(strategy.name)"
          class="p-3 rounded-lg border text-left transition-all"
          :class="currentStrategy?.name === strategy.name ? 'bg-emerald-900/30 border-emerald-700/40 ring-1 ring-emerald-500/30' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'"
        >
          <div class="text-sm font-bold" :class="currentStrategy?.name === strategy.name ? 'text-emerald-400' : 'text-slate-400'">
            {{ strategy.name }}
          </div>
          <div class="text-[9px] text-slate-500 mt-1">{{ strategy.description }}</div>
        </button>
      </div>

      <!-- Data Input -->
      <div class="flex gap-2">
        <input 
          v-model="strategyInput"
          placeholder="Nhập số (ví dụ: 5, 2, 8, 1, 9)"
          class="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300"
          @keyup.enter="executeStrategy"
        />
        <button 
          @click="executeStrategy"
          :disabled="!currentStrategy"
          class="px-4 py-2 bg-emerald-950/40 border border-emerald-700/40 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-900/40 transition-all disabled:opacity-50"
        >
          Execute Strategy
        </button>
      </div>
    </div>

    <!-- Factory Pattern Panel -->
    <div v-if="activePattern === 'factory'" class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <button 
          v-for="factory in factories" 
          :key="factory.type"
          @click="createProduct(factory.type)"
          class="p-3 rounded-lg border text-center transition-all hover:scale-105"
          :class="factory.type === 'Car' ? 'bg-blue-900/30 border-blue-700/40' : 'bg-rose-900/30 border-rose-700/40'"
        >
          <div class="text-sm font-bold" :class="factory.type === 'Car' ? 'text-blue-400' : 'text-rose-400'">
            {{ factory.name }}
          </div>
          <div class="text-[9px] text-slate-400 mt-1">Created: {{ factory.productsCreated }}</div>
          <div class="text-[9px] text-slate-500 mt-2">Click để tạo {{ factory.type }}</div>
        </button>
      </div>

      <!-- Products Display -->
      <div v-if="products.length > 0" class="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
        <div class="text-[10px] font-bold uppercase text-slate-500 mb-2">Created Products</div>
        <div class="grid grid-cols-3 gap-2">
          <div 
            v-for="product in products.slice(-6)" 
            :key="product.id"
            class="p-2 rounded text-center text-[10px]"
            :class="product.type === 'Car' ? 'bg-blue-950/30 text-blue-400 border border-blue-800/30' : 'bg-rose-950/30 text-rose-400 border border-rose-800/30'"
          >
            <div class="font-bold">{{ product.name }}</div>
            <div class="text-slate-500">{{ product.id }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  ObserverPatternSimulator,
  StrategyPatternSimulator,
  FactoryPatternSimulator,
  MessageFlowRenderer,
  type Observer,
  type Strategy,
  type Factory,
  type Product,
  type NotificationEvent,
} from '../PatternEngine';

// Tab state
const patterns = [
  { id: 'observer', name: 'Observer' },
  { id: 'strategy', name: 'Strategy' },
  { id: 'factory', name: 'Factory' },
];
const activePattern = ref('observer');

// ============================================
// OBSERVER PATTERN STATE
// ============================================
const observerSimulator = new ObserverPatternSimulator((event) => {
  handleNotification(event);
});

const subject = ref(observerSimulator.createSubject('news-publisher', 'NewsPublisher', { lastNews: '' }));
const observers = ref<Observer[]>([
  observerSimulator.createObserver('obs-1', 'EmailSubscriber'),
  observerSimulator.createObserver('obs-2', 'PushNotifier'),
  observerSimulator.createObserver('obs-3', 'SMSSubscriber'),
  observerSimulator.createObserver('obs-4', 'DashboardWidget'),
]);

const attachedObserverIds = ref<Set<string>>(new Set());
const newsContent = ref('');
const notificationLog = ref<Array<{ from: string; to: string; time: string }>>([]);
const lastNotification = ref<NotificationEvent | null>(null);
const notificationAnimations = ref<Array<{ x: number; y: number }>>([]);

const attachedObservers = computed(() => {
  return observers.value.filter((o) => attachedObserverIds.value.has(o.id));
});

function isObserverAttached(id: string): boolean {
  return attachedObserverIds.value.has(id);
}

function toggleObserver(observer: Observer): void {
  if (isObserverAttached(observer.id)) {
    observerSimulator.detachObserver(subject.value.id, observer.id);
    attachedObserverIds.value.delete(observer.id);
  } else {
    observerSimulator.attachObserver(subject.value.id, observer);
    attachedObserverIds.value.add(observer.id);
  }
}

function publishNews(): void {
  if (!newsContent.value) return;
  
  const notifications = observerSimulator.setState(subject.value.id, {
    lastNews: newsContent.value,
    timestamp: new Date().toLocaleTimeString(),
  });

  notifications.forEach((event) => {
    notificationLog.value.push({
      from: event.from,
      to: event.to,
      time: new Date(event.timestamp).toLocaleTimeString(),
    });
  });

  lastNotification.value = notifications[notifications.length - 1] || null;
  
  // Trigger animation
  animateNotifications();
  
  newsContent.value = '';
}

function getObserverName(id: string): string {
  return observers.value.find((o) => o.id === id)?.name || id;
}

function getNotificationPath(observerIndex: number): string {
  const startX = 40;
  const startY = 60;
  const endX = 80 + observerIndex * 70;
  const endY = 60;
  
  return `M ${startX} ${startY} Q ${(startX + endX) / 2} ${startY - 30} ${endX} ${endY}`;
}

function handleNotification(event: NotificationEvent): void {
  console.log('Notification:', event);
}

function animateNotifications(): void {
  // Simple animation trigger
  notificationAnimations.value = attachedObservers.value.map((_, idx) => ({
    x: 80 + idx * 70,
    y: 60,
  }));
  
  setTimeout(() => {
    notificationAnimations.value = [];
  }, 1000);
}

// ============================================
// STRATEGY PATTERN STATE
// ============================================
const strategySimulator = new StrategyPatternSimulator('SortingContext', (oldStrat, newStrat) => {
  currentStrategy.value = newStrat;
});

const strategies = ref<Strategy[]>(strategySimulator.getAllStrategies());
const currentStrategy = ref<Strategy | null>(null);
const strategyData = ref<number[]>([5, 2, 8, 1, 9, 3, 7, 4, 6]);
const strategyInput = ref('');
const strategyResult = ref<{ strategy: string; result: number; timeMs: number } | null>(null);

function setStrategy(name: string): void {
  strategySimulator.setStrategy(name);
}

function executeStrategy(): void {
  if (strategyInput.value) {
    const data = strategyInput.value.split(',').map((s) => parseInt(s.trim())).filter((n) => !isNaN(n));
    if (data.length > 0) {
      strategyData.value = data;
    }
  }
  
  strategyResult.value = strategySimulator.executeStrategy(strategyData.value);
}

// ============================================
// FACTORY PATTERN STATE
// ============================================
const factorySimulator = new FactoryPatternSimulator();
const factories = ref<Factory[]>([]);
const products = ref<Product[]>([]);

function initFactories(): void {
  factorySimulator.reset();
  
  factories.value = [
    factorySimulator.createFactory('Car', 'CarFactory'),
    factorySimulator.createFactory('Motorcycle', 'MotorcycleFactory'),
  ];
  
  products.value = [];
}

function createProduct(type: string): void {
  const product = factorySimulator.createProduct(type, `${type}-${products.value.length + 1}`, {
    createdAt: new Date().toISOString(),
  });
  
  if (product) {
    products.value = factorySimulator.getAllProducts();
    factories.value = factorySimulator.getAllFactories();
  }
}

// Init
onMounted(() => {
  initFactories();
});
</script>

<style scoped>
.pattern-sandbox {
  transition: all 0.3s ease;
}
</style>
