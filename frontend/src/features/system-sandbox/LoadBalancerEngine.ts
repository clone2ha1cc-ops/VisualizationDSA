/**
 * LoadBalancerEngine - System Design Network Simulator
 *
 * Sprint 11: Load Balancer, DB Replication, Failover Smoke
 * - Round-robin load balancing
 * - HTTP request particle animation
 * - Server failure smoke effect
 */

export interface ServerNode {
  id: string;
  name: string;
  type: 'LB' | 'WEB' | 'DB_PRIMARY' | 'DB_REPLICA';
  status: 'HEALTHY' | 'OVERLOADED' | 'FAILED';
  load: number; // 0-100%
  requestCount: number;
  position: { x: number; y: number };
}

export interface HTTPRequest {
  id: string;
  source: string;
  target: string;
  progress: number; // 0-1
  status: 'IN_FLIGHT' | 'ARRIVED' | 'FAILED';
  color: string;
}

export interface DBReplicationEvent {
  id: string;
  from: string;
  to: string;
  delay: number; // ms
  data: any;
  timestamp: number;
}

export interface SmokeParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number; // 0-1
  color: string;
}

export class LoadBalancerEngine {
  private servers: Map<string, ServerNode> = new Map();
  private requests: Map<string, HTTPRequest> = new Map();
  private replicationQueue: DBReplicationEvent[] = [];
  private smokeParticles: Map<string, SmokeParticle> = new Map();
  private roundRobinIndex = 0;
  private particleCounter = 0;

  /**
   * Initialize sample infrastructure
   */
  public initializeInfrastructure(): void {
    this.servers.clear();
    this.requests.clear();
    this.replicationQueue = [];
    this.smokeParticles.clear();

    // Load Balancer
    this.addServer('lb-1', 'LoadBalancer-1', 'LB', { x: 100, y: 150 });

    // Web Servers
    this.addServer('web-1', 'WebServer-1', 'WEB', { x: 300, y: 80 });
    this.addServer('web-2', 'WebServer-2', 'WEB', { x: 300, y: 150 });
    this.addServer('web-3', 'WebServer-3', 'WEB', { x: 300, y: 220 });

    // Database
    this.addServer('db-primary', 'DB-Primary', 'DB_PRIMARY', { x: 500, y: 120 });
    this.addServer('db-replica', 'DB-Replica', 'DB_REPLICA', { x: 500, y: 180 });
  }

  /**
   * Add a server node
   */
  public addServer(
    id: string,
    name: string,
    type: ServerNode['type'],
    position: { x: number; y: number }
  ): ServerNode {
    const server: ServerNode = {
      id,
      name,
      type,
      status: 'HEALTHY',
      load: 0,
      requestCount: 0,
      position,
    };
    this.servers.set(id, server);
    return server;
  }

  /**
   * Simulate incoming HTTP request
   */
  public simulateRequest(sourceId: string = 'client'): HTTPRequest | null {
    const lb = this.getLoadBalancer();
    if (!lb) return null;

    // Find healthy web servers
    const webServers = this.getWebServers().filter((s) => s.status !== 'FAILED');
    if (webServers.length === 0) return null;

    // Round-robin selection
    const targetServer = webServers[this.roundRobinIndex % webServers.length];
    this.roundRobinIndex++;

    this.particleCounter++;
    const request: HTTPRequest = {
      id: `req-${this.particleCounter}`,
      source: sourceId,
      target: targetServer.id,
      progress: 0,
      status: 'IN_FLIGHT',
      color: this.getRequestColor(targetServer.id),
    };

    this.requests.set(request.id, request);
    targetServer.requestCount++;
    targetServer.load = Math.min(100, targetServer.load + 5);

    return request;
  }

  /**
   * Update request animations
   */
  public updateRequests(deltaTime: number): void {
    for (const request of this.requests.values()) {
      if (request.status === 'IN_FLIGHT') {
        request.progress += deltaTime * 0.002;

        if (request.progress >= 1) {
          request.status = 'ARRIVED';
          request.progress = 1;

          // Auto-cleanup after arrival
          setTimeout(() => {
            this.requests.delete(request.id);
          }, 500);
        }
      }
    }
  }

  /**
   * Create smoke particles when server fails
   */
  public createSmoke(serverId: string, intensity: number = 50): void {
    const server = this.servers.get(serverId);
    if (!server) return;

    for (let i = 0; i < intensity; i++) {
      this.particleCounter++;
      const particle: SmokeParticle = {
        id: `smoke-${this.particleCounter}`,
        x: server.position.x + (Math.random() - 0.5) * 40,
        y: server.position.y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 3 - 1, // Rise upward
        size: Math.random() * 10 + 5,
        opacity: Math.random() * 0.5 + 0.3,
        life: 1,
        color: `rgba(${100 + Math.random() * 50}, ${100 + Math.random() * 50}, ${100 + Math.random() * 50}`,
      };
      this.smokeParticles.set(particle.id, particle);
    }
  }

  /**
   * Update smoke particles
   */
  public updateSmoke(deltaTime: number): void {
    for (const particle of this.smokeParticles.values()) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= deltaTime * 0.001;
      particle.opacity *= 0.995;
      particle.size *= 1.005;

      if (particle.life <= 0 || particle.opacity < 0.01) {
        this.smokeParticles.delete(particle.id);
      }
    }
  }

  /**
   * Fail a server (create smoke and mark as failed)
   */
  public failServer(serverId: string): void {
    const server = this.servers.get(serverId);
    if (!server) return;

    server.status = 'FAILED';
    server.load = 100;
    this.createSmoke(serverId, 80);
  }

  /**
   * Recover a server
   */
  public recoverServer(serverId: string): void {
    const server = this.servers.get(serverId);
    if (!server) return;

    server.status = 'HEALTHY';
    server.load = 0;
    server.requestCount = 0;
  }

  /**
   * Simulate DB replication lag
   */
  public simulateReplication(delayMs: number): void {
    const primary = this.getPrimaryDB();
    const replica = this.getReplicaDB();

    if (!primary || !replica) return;

    this.particleCounter++;
    const event: DBReplicationEvent = {
      id: `repl-${this.particleCounter}`,
      from: primary.id,
      to: replica.id,
      delay: delayMs,
      data: { timestamp: Date.now() },
      timestamp: Date.now(),
    };

    this.replicationQueue.push(event);

    // Remove after delay
    setTimeout(() => {
      const index = this.replicationQueue.findIndex((e) => e.id === event.id);
      if (index > -1) {
        this.replicationQueue.splice(index, 1);
      }
    }, delayMs);
  }

  /**
   * Get all servers
   */
  public getAllServers(): ServerNode[] {
    return Array.from(this.servers.values());
  }

  /**
   * Get active requests
   */
  public getActiveRequests(): HTTPRequest[] {
    return Array.from(this.requests.values()).filter((r) => r.status === 'IN_FLIGHT');
  }

  /**
   * Get smoke particles
   */
  public getSmokeParticles(): SmokeParticle[] {
    return Array.from(this.smokeParticles.values());
  }

  /**
   * Get replication events
   */
  public getReplicationEvents(): DBReplicationEvent[] {
    return [...this.replicationQueue];
  }

  /**
   * Get load balancer
   */
  private getLoadBalancer(): ServerNode | undefined {
    return Array.from(this.servers.values()).find((s) => s.type === 'LB');
  }

  /**
   * Get web servers
   */
  private getWebServers(): ServerNode[] {
    return Array.from(this.servers.values()).filter((s) => s.type === 'WEB');
  }

  /**
   * Get primary DB
   */
  private getPrimaryDB(): ServerNode | undefined {
    return Array.from(this.servers.values()).find((s) => s.type === 'DB_PRIMARY');
  }

  /**
   * Get replica DB
   */
  private getReplicaDB(): ServerNode | undefined {
    return Array.from(this.servers.values()).find((s) => s.type === 'DB_REPLICA');
  }

  /**
   * Get color for request based on target server
   */
  private getRequestColor(serverId: string): string {
    const colors: Record<string, string> = {
      'web-1': '#22c55e',
      'web-2': '#3b82f6',
      'web-3': '#f59e0b',
    };
    return colors[serverId] || '#22c55e';
  }

  /**
   * Reset engine
   */
  public reset(): void {
    this.servers.clear();
    this.requests.clear();
    this.replicationQueue = [];
    this.smokeParticles.clear();
    this.roundRobinIndex = 0;
  }
}

export default LoadBalancerEngine;
