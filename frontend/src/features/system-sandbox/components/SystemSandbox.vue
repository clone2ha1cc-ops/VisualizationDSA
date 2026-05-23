<template>
  <div class="system-sandbox bg-[#0e1726]/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
    
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-slate-800 pb-4">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-sky-400">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        <span class="text-xs font-bold uppercase tracking-wider text-slate-300">System Design: Load Balancer & Failover</span>
      </div>
      <div class="flex gap-1.5">
        <span class="text-[10px] font-bold uppercase tracking-wider bg-sky-950/40 text-sky-400 border border-sky-800/40 px-2 py-1 rounded-lg">
          Sprint 11
        </span>
      </div>
    </div>

    <!-- System Topology Canvas -->
    <div class="relative h-[250px] bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800">
      <!-- Connection Lines -->
      <svg class="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <marker id="arrow-sky" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#38bdf8"/>
          </marker>
        </defs>
        <!-- LB to Web Servers -->
        <path
          v-for="server in webServers"
          :key="`conn-${server.id}`"
          :d="`M ${getServer('lb-1')?.position.x! + 30} ${getServer('lb-1')?.position.y!} L ${server.position.x - 30} ${server.position.y}`"
          stroke="#38bdf8"
          stroke-width="1"
          fill="none"
          stroke-dasharray="4,2"
          opacity="0.5"
          marker-end="url(#arrow-sky)"
        />
        <!-- Web to DB -->
        <path
          v-for="db in dbServers"
          :key="`db-conn-${db.id}`"
          :d="`M 380 ${db.position.y < 150 ? 100 : 200} L ${db.position.x - 30} ${db.position.y}`"
          stroke="#64748b"
          stroke-width="1"
          fill="none"
          opacity="0.3"
        />
      </svg>

      <!-- Request Particles -->
      <div
        v-for="req in activeRequests"
        :key="req.id"
        class="absolute w-3 h-3 rounded-full"
        :style="{
          left: getRequestPosition(req).x + 'px',
          top: getRequestPosition(req).y + 'px',
          backgroundColor: req.color,
          boxShadow: `0 0 8px ${req.color}`
        }"
      />

      <!-- Smoke Particles -->
      <div
        v-for="smoke in smokeParticles"
        :key="smoke.id"
        class="absolute rounded-full pointer-events-none"
        :style="{
          left: smoke.x + 'px',
          top: smoke.y + 'px',
          width: smoke.size + 'px',
          height: smoke.size + 'px',
          backgroundColor: `rgba(100, 100, 100, ${smoke.opacity})`,
          transform: 'translate(-50%, -50%)'
        }"
      />

      <!-- Server Nodes -->
      <div
        v-for="server in allServers"
        :key="server.id"
        class="absolute flex flex-col items-center cursor-pointer transition-all"
        :class="server.status === 'FAILED' ? 'opacity-50' : ''"
        :style="{ left: server.position.x - 30 + 'px', top: server.position.y - 25 + 'px' }"
        @click="toggleServerStatus(server.id)"
      >
        <div 
          class="w-14 h-14 rounded-lg border-2 flex items-center justify-center"
          :class="getServerClass(server)"
        >
          <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2" v-if="server.type === 'LB'"/>
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2" v-if="server.type === 'LB'"/>
            <line x1="6" y1="6" x2="6.01" y2="6" v-if="server.type === 'LB'"/>
            <line x1="6" y1="18" x2="6.01" y2="18" v-if="server.type === 'LB'"/>
            <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" v-if="server.type === 'WEB'"/>
            <polyline points="14 2 14 8 20 8" v-if="server.type === 'WEB'"/>
            <ellipse cx="12" cy="5" rx="9" ry="3" v-if="server.type.includes('DB')"/>
            <path d="M3 5V19A9 3 0 0 0 12 22A9 3 0 0 0 21 19V5" v-if="server.type.includes('DB')"/>
          </svg>
        </div>
        <div class="text-[9px] mt-1 text-slate-400 font-bold">{{ server.name }}</div>
        <div v-if="server.status === 'FAILED'" class="text-[8px] text-red-400">OFFLINE</div>
        <div v-else class="text-[8px]" :class="server.load > 80 ? 'text-red-400' : 'text-emerald-400'">
          {{ server.load }}%
        </div>
      </div>

      <!-- Legend -->
      <div class="absolute bottom-2 left-2 flex gap-3 text-[9px]">
        <div class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-emerald-500"/>
          <span class="text-slate-400">Healthy</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-red-500"/>
          <span class="text-slate-400">Failed</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-sky-400"/>
          <span class="text-slate-400">Request</span>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="grid grid-cols-2 gap-4">
      <!-- Load Balancer Controls -->
      <div class="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
        <div class="text-[10px] font-bold uppercase text-slate-500 mb-2">Load Balancer</div>
        <div class="flex gap-2">
          <button 
            @click="simulateRequest"
            class="flex-1 px-3 py-2 bg-sky-950/40 border border-sky-700/40 text-sky-400 text-[10px] font-bold rounded-lg hover:bg-sky-900/40 transition-all"
          >
            Send Request
          </button>
          <button 
            @click="simulateBurst"
            class="flex-1 px-3 py-2 bg-indigo-950/40 border border-indigo-700/40 text-indigo-400 text-[10px] font-bold rounded-lg hover:bg-indigo-900/40 transition-all"
          >
            Burst (10 req)
          </button>
        </div>
        <div class="mt-2 text-[9px] text-slate-500">
          Round-robin: {{ roundRobinInfo }}
        </div>
      </div>

      <!-- DB Replication -->
      <div class="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
        <div class="text-[10px] font-bold uppercase text-slate-500 mb-2">DB Replication Lag</div>
        <div class="flex items-center gap-2">
          <input 
            v-model="replicationDelay"
            type="range"
            min="100"
            max="5000"
            step="100"
            class="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
          <span class="text-[10px] text-amber-400 w-14">{{ replicationDelay }}ms</span>
        </div>
        <button 
          @click="triggerReplication"
          class="w-full mt-2 px-3 py-2 bg-amber-950/40 border border-amber-700/40 text-amber-400 text-[10px] font-bold rounded-lg hover:bg-amber-900/40 transition-all"
        >
          Sync Primary → Replica
        </button>
      </div>
    </div>

    <!-- Server Stats -->
    <div class="grid grid-cols-3 gap-2">
      <div 
        v-for="server in webServers" 
        :key="`stat-${server.id}`"
        class="p-2 rounded-lg border text-center"
        :class="server.status === 'FAILED' ? 'bg-red-950/30 border-red-800/40' : 'bg-slate-900/50 border-slate-800'"
      >
        <div class="text-[10px] font-bold" :class="server.status === 'FAILED' ? 'text-red-400' : 'text-slate-400'">
          {{ server.name }}
        </div>
        <div class="text-xs mt-1">
          <span :class="server.status === 'FAILED' ? 'text-red-400' : 'text-emerald-400'">
            {{ server.requestCount }}
          </span>
          <span class="text-slate-500"> requests</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  LoadBalancerEngine,
  type ServerNode,
  type HTTPRequest,
  type SmokeParticle,
} from '../LoadBalancerEngine';

const engine = new LoadBalancerEngine();

// State
const allServers = ref<ServerNode[]>([]);
const activeRequests = ref<HTTPRequest[]>([]);
const smokeParticles = ref<SmokeParticle[]>([]);
const replicationDelay = ref(500);
const animationFrame = ref<number>(0);

// Computed
const webServers = computed(() => allServers.value.filter((s) => s.type === 'WEB'));
const dbServers = computed(() => allServers.value.filter((s) => s.type.includes('DB')));

const roundRobinInfo = computed(() => {
  const healthy = webServers.value.filter((s) => s.status !== 'FAILED');
  if (healthy.length === 0) return 'No healthy servers!';
  return `${healthy.length} healthy servers`;
});

// Methods
function updateState(): void {
  allServers.value = engine.getAllServers();
  activeRequests.value = engine.getActiveRequests();
  smokeParticles.value = engine.getSmokeParticles();
}

function simulateRequest(): void {
  engine.simulateRequest();
}

function simulateBurst(): void {
  for (let i = 0; i < 10; i++) {
    setTimeout(() => engine.simulateRequest(), i * 100);
  }
}

function toggleServerStatus(serverId: string): void {
  const server = allServers.value.find((s) => s.id === serverId);
  if (!server) return;

  if (server.status === 'FAILED') {
    engine.recoverServer(serverId);
  } else {
    engine.failServer(serverId);
  }
  updateState();
}

function triggerReplication(): void {
  engine.simulateReplication(replicationDelay.value);
}

function getServer(id: string): ServerNode | undefined {
  return allServers.value.find((s) => s.id === id);
}

function getServerClass(server: ServerNode): string {
  if (server.status === 'FAILED') {
    return 'bg-red-950/50 border-red-700/50 text-red-400';
  }
  if (server.load > 80) {
    return 'bg-amber-950/50 border-amber-700/50 text-amber-400';
  }
  
  switch (server.type) {
    case 'LB':
      return 'bg-sky-950/50 border-sky-700/50 text-sky-400';
    case 'WEB':
      return 'bg-emerald-950/50 border-emerald-700/50 text-emerald-400';
    case 'DB_PRIMARY':
    case 'DB_REPLICA':
      return 'bg-purple-950/50 border-purple-700/50 text-purple-400';
    default:
      return 'bg-slate-800 border-slate-700 text-slate-400';
  }
}

function getRequestPosition(req: HTTPRequest): { x: number; y: number } {
  const lb = getServer('lb-1');
  const target = getServer(req.target);
  
  if (!lb || !target) return { x: 0, y: 0 };
  
  const startX = lb.position.x + 30;
  const startY = lb.position.y;
  const endX = target.position.x - 30;
  const endY = target.position.y;
  
  return {
    x: startX + (endX - startX) * req.progress,
    y: startY + (endY - startY) * req.progress,
  };
}

// Animation loop
function animate(): void {
  engine.updateRequests(16);
  engine.updateSmoke(16);
  updateState();
  animationFrame.value = requestAnimationFrame(animate);
}

// Init
onMounted(() => {
  engine.initializeInfrastructure();
  updateState();
  animate();
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrame.value);
});
</script>

<style scoped>
.system-sandbox {
  transition: all 0.3s ease;
}
</style>
