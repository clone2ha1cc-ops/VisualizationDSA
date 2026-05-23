import type { NodeDTO, EdgeDTO } from '../store/usePlaygroundStore';

interface Velocity {
  x: number;
  y: number;
}

export class ForceDirectedEngine {
  private repulsionConstant = 4000;
  private springConstant = 0.05;
  private desiredSpringLength = 150;
  private damping = 0.85;
  private stabilityThreshold = 0.5;
  private velocities = new Map<string, Velocity>();

  /**
   * Run one physics simulation step. Returns total kinetic energy
   * (used to detect stability and auto-stop the loop).
   */
  tick(nodes: NodeDTO[], edges: EdgeDTO[], canvasWidth: number, canvasHeight: number, draggedNodeId: string | null): number {
    for (const node of nodes) {
      if (!this.velocities.has(node.id)) {
        this.velocities.set(node.id, { x: 0, y: 0 });
      }
    }

    // Reset velocities each tick (force accumulation per frame)
    for (const node of nodes) {
      this.velocities.set(node.id, { x: 0, y: 0 });
    }

    // 1. Repulsive forces between all node pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1.0;

        const force = this.repulsionConstant / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        const va = this.velocities.get(a.id)!;
        const vb = this.velocities.get(b.id)!;
        this.velocities.set(a.id, { x: va.x - fx, y: va.y - fy });
        this.velocities.set(b.id, { x: vb.x + fx, y: vb.y + fy });
      }
    }

    // 2. Spring (attractive) forces along edges
    for (const edge of edges) {
      const a = nodes.find(n => n.id === edge.from);
      const b = nodes.find(n => n.id === edge.to);
      if (!a || !b) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1.0;

      const force = this.springConstant * (dist - this.desiredSpringLength);
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      const va = this.velocities.get(a.id)!;
      const vb = this.velocities.get(b.id)!;
      this.velocities.set(a.id, { x: va.x + fx, y: va.y + fy });
      this.velocities.set(b.id, { x: vb.x - fx, y: vb.y - fy });
    }

    // 3. Apply velocities with damping, clamp to canvas bounds
    let totalEnergy = 0;
    for (const node of nodes) {
      if (node.id === draggedNodeId) continue;

      const vel = this.velocities.get(node.id)!;
      vel.x *= this.damping;
      vel.y *= this.damping;

      node.x += vel.x;
      node.y += vel.y;

      node.x = Math.max(node.radius, Math.min(canvasWidth - node.radius, node.x));
      node.y = Math.max(node.radius, Math.min(canvasHeight - node.radius, node.y));

      totalEnergy += vel.x * vel.x + vel.y * vel.y;
    }

    return totalEnergy;
  }

  /**
   * Check if the simulation has stabilized.
   */
  isStable(energy: number): boolean {
    return energy < this.stabilityThreshold;
  }

  /**
   * Reset internal velocity state (call when nodes are added/removed).
   */
  reset() {
    this.velocities.clear();
  }
}
