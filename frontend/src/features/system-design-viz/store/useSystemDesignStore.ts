import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { SystemDesignEngine } from '../engine/SystemDesignEngine';
import { ReplicationLagScheduler } from '../engine/ReplicationLagScheduler';
import type {
  SystemNode,
  NetworkLink,
  NetworkPacket,
  ReplicationJob,
} from '../types/system-design-viz.types';
import {
  PACKET_COLORS,
  REPLICATION_LAG_DEFAULT_MS,
  REPLICATION_LAG_MIN_MS,
  REPLICATION_LAG_MAX_MS,
} from '../types/system-design-viz.types';

export const useSystemDesignStore = defineStore('systemDesign', () => {
  // ── State ──
  const nodes = ref<SystemNode[]>([]);
  const links = ref<NetworkLink[]>([]);
  const activePackets = ref<NetworkPacket[]>([]);
  const replicationLagMs = ref<number>(REPLICATION_LAG_DEFAULT_MS);
  const isTrafficSpikeActive = ref<boolean>(false);
  const pendingReplications = ref<ReplicationJob[]>([]);
  const completedReplications = ref<number>(0);
  const failedNodeIds = ref<Set<string>>(new Set());

  // ── Engine instances ──
  const engine = new SystemDesignEngine();
  const replicationScheduler = new ReplicationLagScheduler();

  // ── Computed ──
  const healthyNodeCount = computed(
    () => nodes.value.filter((n) => n.status === 'HEALTHY').length,
  );
  const failedNodeCount = computed(
    () => nodes.value.filter((n) => n.status === 'FAILED').length,
  );
  const totalPacketsInFlight = computed(() => activePackets.value.length);

  // ── Actions ──

  function initializeDemoTopology(): void {
    engine.clear();
    replicationScheduler.clear();
    failedNodeIds.value.clear();

    const demoNodes: SystemNode[] = [
      { nodeId: 'client-1', nodeType: 'CLIENT', label: 'Client', status: 'HEALTHY', requestCount: 0, posX: 100, posY: 200 },
      { nodeId: 'lb-1', nodeType: 'LOAD_BALANCER', label: 'Load Balancer', status: 'HEALTHY', requestCount: 0, posX: 300, posY: 200 },
      { nodeId: 'server-a', nodeType: 'WEB_SERVER', label: 'Server A', status: 'HEALTHY', requestCount: 0, posX: 500, posY: 100 },
      { nodeId: 'server-b', nodeType: 'WEB_SERVER', label: 'Server B', status: 'HEALTHY', requestCount: 0, posX: 500, posY: 300 },
      { nodeId: 'db-primary', nodeType: 'POSTGRES_PRIMARY', label: 'Primary DB', status: 'HEALTHY', requestCount: 0, posX: 700, posY: 150 },
      { nodeId: 'db-replica', nodeType: 'POSTGRES_REPLICA', label: 'Replica DB', status: 'HEALTHY', requestCount: 0, posX: 700, posY: 300 },
    ];

    const demoLinks: NetworkLink[] = [
      { linkId: 'link-client-lb', sourceId: 'client-1', targetId: 'lb-1', latencyMs: 10 },
      { linkId: 'link-lb-a', sourceId: 'lb-1', targetId: 'server-a', latencyMs: 20 },
      { linkId: 'link-lb-b', sourceId: 'lb-1', targetId: 'server-b', latencyMs: 20 },
      { linkId: 'link-a-db', sourceId: 'server-a', targetId: 'db-primary', latencyMs: 5 },
      { linkId: 'link-b-db', sourceId: 'server-b', targetId: 'db-primary', latencyMs: 5 },
      { linkId: 'link-db-replica', sourceId: 'db-primary', targetId: 'db-replica', latencyMs: 50 },
    ];

    for (const node of demoNodes) {
      engine.registerNode(node);
    }
    for (const link of demoLinks) {
      engine.registerLink(link);
    }

    nodes.value = [...demoNodes];
    links.value = [...demoLinks];
    activePackets.value = [];
    pendingReplications.value = [];
    completedReplications.value = 0;
    isTrafficSpikeActive.value = false;
  }

  function toggleServerStatus(nodeId: string): void {
    const node = nodes.value.find((n) => n.nodeId === nodeId);
    if (!node || (node.nodeType !== 'WEB_SERVER' && node.nodeType !== 'REDIS_CACHE')) return;

    if (node.status === 'FAILED') {
      node.status = 'HEALTHY';
      failedNodeIds.value.delete(nodeId);
    } else {
      node.status = 'FAILED';
      failedNodeIds.value.add(nodeId);
      dispatchSmokeEvent(nodeId);
    }

    engine.setNodeStatus(nodeId, node.status);
  }

  function injectHttpRequest(): void {
    const packet = engine.routeRequestFromLB('lb-1', PACKET_COLORS.HTTP_REQUEST);
    if (packet) {
      syncPackets();
      syncNodes();
    }
  }

  function injectTrafficBurst(count = 10): void {
    isTrafficSpikeActive.value = true;
    for (let i = 0; i < count; i++) {
      engine.routeRequestFromLB('lb-1', PACKET_COLORS.HTTP_REQUEST);
    }
    syncPackets();
    syncNodes();
  }

  function triggerDbWrite(): void {
    const writePacket = engine.createDirectPacket(
      'server-a',
      'db-primary',
      PACKET_COLORS.DB_WRITE,
    );
    if (writePacket) {
      syncPackets();
    }

    replicationScheduler.scheduleReplication(
      'db-primary',
      'db-replica',
      replicationLagMs.value,
      (job: ReplicationJob) => {
        engine.createDirectPacket(job.primaryId, job.replicaId, job.packetColor);
        completedReplications.value++;
        pendingReplications.value = replicationScheduler.getPendingJobs();
        syncPackets();
      },
    );
    pendingReplications.value = replicationScheduler.getPendingJobs();
  }

  function tickEngine(deltaTime: number): void {
    engine.updatePacketsProgress(deltaTime);
    syncPackets();
    syncNodes();
  }

  function setReplicationLag(ms: number): void {
    replicationLagMs.value = Math.max(
      REPLICATION_LAG_MIN_MS,
      Math.min(REPLICATION_LAG_MAX_MS, ms),
    );
  }

  function clearTopology(): void {
    engine.clear();
    replicationScheduler.clear();
    nodes.value = [];
    links.value = [];
    activePackets.value = [];
    pendingReplications.value = [];
    completedReplications.value = 0;
    isTrafficSpikeActive.value = false;
    failedNodeIds.value.clear();
    replicationLagMs.value = REPLICATION_LAG_DEFAULT_MS;
  }

  // ── Internal ──

  function syncPackets(): void {
    activePackets.value = engine.getPackets();
  }

  function syncNodes(): void {
    nodes.value = engine.getNodes().map((n) => ({ ...n }));
  }

  function dispatchSmokeEvent(nodeId: string): void {
    if (typeof window !== 'undefined') {
      const smokeEvent = new CustomEvent('SERVER_FAILED_SMOKE_BURST', {
        detail: { nodeId },
      });
      window.dispatchEvent(smokeEvent);
    }
  }

  return {
    // State
    nodes,
    links,
    activePackets,
    replicationLagMs,
    isTrafficSpikeActive,
    pendingReplications,
    completedReplications,
    failedNodeIds,
    // Computed
    healthyNodeCount,
    failedNodeCount,
    totalPacketsInFlight,
    // Actions
    initializeDemoTopology,
    toggleServerStatus,
    injectHttpRequest,
    injectTrafficBurst,
    triggerDbWrite,
    tickEngine,
    setReplicationLag,
    clearTopology,
  };
});
