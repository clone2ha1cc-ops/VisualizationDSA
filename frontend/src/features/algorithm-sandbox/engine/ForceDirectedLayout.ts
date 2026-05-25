/**
 * ForceDirectedLayout - Thuật toán dàn xếp đồ thị tự động bằng Hệ Lực
 * 
 * Sử dụng phương trình vật lý:
 * - Lực đẩy Coulomb giữa các cặp Node (đẩy nhau ra xa)
 * - Lực hút lò xo Hooke dọc theo Edge (kéo lại gần nhau)
 * - Hệ số hãm dao động (damping) để tránh rung lắc
 */

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  fx?: number; // Lực tác động trục X tích lũy
  fy?: number; // Lực tác động trục Y tích lũy
}

export interface GraphEdge {
  sourceId: string;
  targetId: string;
  weight?: number;
}

export class ForceDirectedLayout {
  private kRepulsion = 400; // Hệ số lực đẩy Coulomb giữa các cặp Node
  private kAttraction = 0.06; // Hệ số lực hút Hooke giữ dọc liên kết Edge
  private idealLength = 120; // Chiều dài lò xo lý tưởng
  private damping = 0.85; // Hệ số hãm dao động (damping factor)

  constructor(params?: {
    kRepulsion?: number;
    kAttraction?: number;
    idealLength?: number;
    damping?: number;
  }) {
    if (params?.kRepulsion) this.kRepulsion = params.kRepulsion;
    if (params?.kAttraction) this.kAttraction = params.kAttraction;
    if (params?.idealLength) this.idealLength = params.idealLength;
    if (params?.damping) this.damping = params.damping;
  }

  /**
   * Tính toán một bước vật lý của hệ lực
   * Cập nhật vị trí các node dựa trên lực Coulomb và Hooke
   */
  public computePhysicsStep(nodes: GraphNode[], edges: GraphEdge[]): void {
    // 1. Reset lực tích lũy về 0
    nodes.forEach(n => {
      n.fx = 0;
      n.fy = 0;
    });

    // 2. Tính toán Lực Đẩy Coulomb giữa MỌI cặp Node để chúng giãn xa nhau
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];

        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1.0;

        // Công thức lực đẩy Coulomb tỉ lệ nghịch bình phương khoảng cách
        const force = this.kRepulsion / (distance * distance);
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        // Nút 1 bị đẩy lùi
        n1.fx! -= fx;
        n1.fy! -= fy;
        // Nút 2 bị đẩy đi
        n2.fx! += fx;
        n2.fy! += fy;
      }
    }

    // 3. Tính toán Lực Hút Lò xo Hooke dọc theo các liên kết Edges giữ chúng lại gần nhau
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.sourceId);
      const target = nodes.find(n => n.id === edge.targetId);

      if (!source || !target) return;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1.0;

      // Định luật lò xo đàn hồi Hooke F = k * (x - l)
      // Điều chỉnh theo weight của edge nếu có: weight lớn -> lực hút mạnh hơn
      const weightFactor = edge.weight ? Math.sqrt(edge.weight) / 10 : 1;
      const ideal = this.idealLength;
      const displacement = distance - ideal;
      const force = this.kAttraction * displacement * weightFactor;

      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;

      // Nguồn bị kéo tiến
      source.fx! += fx;
      source.fy! += fy;
      // Đích bị kéo giật
      target.fx! -= fx;
      target.fy! -= fy;
    });

    // 4. Cập nhật vị trí tọa độ mới của các Node dựa trên tổng lực tích lũy
    // Giới hạn vận tốc di chuyển (damping) tránh rung lắc mất ổn định
    nodes.forEach(node => {
      node.x += (node.fx || 0) * this.damping;
      node.y += (node.fy || 0) * this.damping;

      // Giới hạn trong bounds để trình diễn đẹp mắt
      // (Sẽ được áp dụng bởi component sau khi layout tính toán)
    });
  }

  /**
   * Chạy nhiều bước physics để đạt trạng thái ổn định
   */
  public convergeLayout(
    nodes: GraphNode[],
    edges: GraphEdge[],
    iterations: number = 100
  ): void {
    for (let i = 0; i < iterations; i++) {
      this.computePhysicsStep(nodes, edges);
    }
  }

  /**
   * Kiểm tra xem layout đã ổn định chưa (có thể dừng animation)
   */
  public isStable(nodes: GraphNode[], threshold: number = 0.1): boolean {
    return nodes.every(
      n => Math.abs(n.fx || 0) < threshold && Math.abs(n.fy || 0) < threshold
    );
  }
}

export default ForceDirectedLayout;
