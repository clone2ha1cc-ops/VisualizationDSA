import type { NodeDTO, EdgeDTO } from '../store/usePlaygroundStore';

export interface AdjacencyEntry {
  target: string;
  weight: number;
}

export interface GraphPayload {
  algorithmId: string;
  inputType: string;
  nodes: string[];
  adjacencyList: Record<string, AdjacencyEntry[]>;
}

export class GraphParser {
  /**
   * Convert store nodes/edges into an adjacency list JSON payload.
   * Treats edges as undirected (adds both directions).
   */
  static toAdjacencyList(nodes: NodeDTO[], edges: EdgeDTO[], algorithmId = 'dijkstra'): GraphPayload {
    const nodeLabels = nodes.map(n => n.label);
    const adjacencyList: Record<string, AdjacencyEntry[]> = {};

    for (const node of nodes) {
      adjacencyList[node.label] = [];
    }

    for (const edge of edges) {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      if (!fromNode || !toNode) continue;

      adjacencyList[fromNode.label].push({ target: toNode.label, weight: edge.weight });
      adjacencyList[toNode.label].push({ target: fromNode.label, weight: edge.weight });
    }

    return {
      algorithmId,
      inputType: 'adjacency-list',
      nodes: nodeLabels,
      adjacencyList,
    };
  }

  /**
   * Check graph connectivity using BFS. Returns list of isolated node labels.
   */
  static findIsolatedNodes(nodes: NodeDTO[], edges: EdgeDTO[]): string[] {
    if (nodes.length === 0) return [];

    const adjMap = new Map<string, Set<string>>();
    for (const node of nodes) {
      adjMap.set(node.id, new Set());
    }
    for (const edge of edges) {
      adjMap.get(edge.from)?.add(edge.to);
      adjMap.get(edge.to)?.add(edge.from);
    }

    const visited = new Set<string>();
    const queue = [nodes[0].id];
    visited.add(nodes[0].id);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = adjMap.get(current);
      if (neighbors) {
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
    }

    return nodes
      .filter(n => !visited.has(n.id))
      .map(n => n.label);
  }

  /**
   * Export graph state as a JSON string for file download.
   */
  static exportToJSON(nodes: NodeDTO[], edges: EdgeDTO[]): string {
    return JSON.stringify({ nodes, edges }, null, 2);
  }

  /**
   * Import graph state from a JSON string. Returns parsed nodes/edges or null on error.
   */
  static importFromJSON(jsonStr: string): { nodes: NodeDTO[]; edges: EdgeDTO[] } | null {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) return null;

      const nodes: NodeDTO[] = parsed.nodes.map((n: Record<string, unknown>) => ({
        id: String(n.id),
        label: String(n.label),
        x: Number(n.x),
        y: Number(n.y),
        radius: Number(n.radius) || 20,
      }));

      const edges: EdgeDTO[] = parsed.edges.map((e: Record<string, unknown>) => ({
        id: String(e.id),
        from: String(e.from),
        to: String(e.to),
        weight: Number(e.weight) || 1,
      }));

      return { nodes, edges };
    } catch {
      return null;
    }
  }
}
