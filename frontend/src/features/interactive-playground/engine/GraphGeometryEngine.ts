import type { NodeDTO, EdgeDTO } from '../store/usePlaygroundStore';

export interface Point {
  x: number;
  y: number;
}

export interface ArrowPlacement {
  start: Point;
  end: Point;
  angle: number;
}

export class GraphGeometryEngine {
  /**
   * Euclidean hit detection: check if mouse (x,y) is inside any node circle.
   * Returns the first node hit, or null.
   */
  static hitTestNode(mousePos: Point, nodes: NodeDTO[]): NodeDTO | null {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      const dx = mousePos.x - node.x;
      const dy = mousePos.y - node.y;
      if (dx * dx + dy * dy <= node.radius * node.radius) {
        return node;
      }
    }
    return null;
  }

  /**
   * Check if mouse is near an edge line (within threshold pixels).
   * Uses point-to-line-segment distance.
   */
  static hitTestEdge(mousePos: Point, edges: EdgeDTO[], nodes: NodeDTO[], threshold = 8): EdgeDTO | null {
    for (let i = edges.length - 1; i >= 0; i--) {
      const edge = edges[i];
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      if (!fromNode || !toNode) continue;

      const dist = GraphGeometryEngine.pointToSegmentDistance(
        mousePos,
        { x: fromNode.x, y: fromNode.y },
        { x: toNode.x, y: toNode.y }
      );
      if (dist <= threshold) return edge;
    }
    return null;
  }

  /**
   * Calculate arrowhead placement: endpoints touch the circle borders, not centers.
   */
  static calculateArrowPlacement(from: Point, to: Point, fromRadius: number, toRadius: number): ArrowPlacement {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);

    return {
      start: {
        x: from.x + fromRadius * Math.cos(angle),
        y: from.y + fromRadius * Math.sin(angle),
      },
      end: {
        x: to.x - toRadius * Math.cos(angle),
        y: to.y - toRadius * Math.sin(angle),
      },
      angle,
    };
  }

  /**
   * Check if mouse is within snap distance of a node's border.
   */
  static isWithinSnapDistance(mousePos: Point, node: NodeDTO, snapDistance = 40): boolean {
    const dx = mousePos.x - node.x;
    const dy = mousePos.y - node.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist <= node.radius + snapDistance;
  }

  /**
   * Compute point-to-line-segment distance.
   */
  static pointToSegmentDistance(p: Point, a: Point, b: Point): number {
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const apx = p.x - a.x;
    const apy = p.y - a.y;

    const ab2 = abx * abx + aby * aby;
    if (ab2 === 0) return Math.sqrt(apx * apx + apy * apy);

    let t = (apx * abx + apy * aby) / ab2;
    t = Math.max(0, Math.min(1, t));

    const projX = a.x + t * abx;
    const projY = a.y + t * aby;
    const dx = p.x - projX;
    const dy = p.y - projY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Midpoint of an edge (for weight label positioning).
   */
  static edgeMidpoint(fromNode: NodeDTO, toNode: NodeDTO): Point {
    return {
      x: (fromNode.x + toNode.x) / 2,
      y: (fromNode.y + toNode.y) / 2,
    };
  }
}
