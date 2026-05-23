/**
 * DIContainerEngine - Mô phỏng IoC Container và Dependency Injection
 *
 * Sprint 8: Dependency Injection & IoC Container Visualizer
 * - Đăng ký services với vòng đời Transient/Singleton
 * - Phát hiện cyclic dependencies bằng DFS
 * - Resolve dependency graph
 */

export type ServiceLifetime = 'TRANSIENT' | 'SINGLETON' | 'SCOPED';

export interface ServiceRegistration {
  interfaceName: string;
  implementationName: string;
  lifetime: ServiceLifetime;
  dependencies: string[]; // Danh sách interface names mà service này phụ thuộc
}

export interface ServiceInstance {
  interfaceName: string;
  implementationName: string;
  instanceId: string;
  lifetime: ServiceLifetime;
  createdAt: number;
  resolvedDependencies: string[];
}

export interface DependencyGraph {
  nodes: string[];
  edges: Array<{ from: string; to: string }>;
}

export interface CycleDetectionResult {
  hasCycle: boolean;
  cycle: string[] | null;
  message: string;
}

export interface ResolutionResult {
  success: boolean;
  instance?: ServiceInstance;
  error?: string;
  resolutionPath: string[];
  resolutionTimeMs: number;
}

export class DIContainerEngine {
  private static registrations: Map<string, ServiceRegistration> = new Map();
  private static singletonInstances: Map<string, ServiceInstance> = new Map();
  private static transientCounter = 0;

  /**
   * Đăng ký một service vào container
   */
  public static register(registration: ServiceRegistration): void {
    this.registrations.set(registration.interfaceName, registration);
  }

  /**
   * Lấy registration theo interface name
   */
  public static getRegistration(interfaceName: string): ServiceRegistration | undefined {
    return this.registrations.get(interfaceName);
  }

  /**
   * Phát hiện cyclic dependencies sử dụng DFS
   * Thuật toán: Duyệt đồ thị, đánh dấu GRAY (đang duyệt) và BLACK (đã duyệt xong)
   */
  public static detectCycles(): CycleDetectionResult {
    const visited = new Map<string, 'WHITE' | 'GRAY' | 'BLACK'>(); // WHITE: chưa duyệt, GRAY: đang duyệt, BLACK: đã duyệt
    const recursionStack: string[] = [];

    // Khởi tạo tất cả nodes là WHITE
    this.registrations.forEach((_, interfaceName) => {
      visited.set(interfaceName, 'WHITE');
    });

    const dfs = (node: string): string[] | null => {
      visited.set(node, 'GRAY');
      recursionStack.push(node);

      const registration = this.registrations.get(node);
      if (registration) {
        for (const dep of registration.dependencies) {
          if (!this.registrations.has(dep)) {
            continue; // Dependency không tồn tại, bỏ qua (sẽ báo lỗi khi resolve)
          }

          const status = visited.get(dep);
          if (status === 'GRAY') {
            // Tìm thấy chu trình! Trả về đường đi từ dep đến hiện tại
            const cycleStart = recursionStack.indexOf(dep);
            return [...recursionStack.slice(cycleStart), dep];
          }

          if (status === 'WHITE') {
            const cycle = dfs(dep);
            if (cycle) return cycle;
          }
        }
      }

      visited.set(node, 'BLACK');
      recursionStack.pop();
      return null;
    };

    // DFS từ mỗi node chưa duyệt
    for (const [interfaceName, status] of visited) {
      if (status === 'WHITE') {
        const cycle = dfs(interfaceName);
        if (cycle) {
          return {
            hasCycle: true,
            cycle,
            message: `PHỤ THUỘC VÒNG LẶP PHÁT HIỆN: ${cycle.join(' → ')}`,
          };
        }
      }
    }

    return {
      hasCycle: false,
      cycle: null,
      message: 'Không phát hiện cyclic dependencies',
    };
  }

  /**
   * Resolve một service từ container
   * - Singleton: Trả về instance đã tạo hoặc tạo mới nếu chưa có
   * - Transient: Luôn tạo instance mới
   */
  public static resolve(interfaceName: string): ResolutionResult {
    const startTime = performance.now();
    const resolutionPath: string[] = [];

    const registration = this.registrations.get(interfaceName);
    if (!registration) {
      return {
        success: false,
        error: `Service ${interfaceName} chưa được đăng ký trong container`,
        resolutionPath,
        resolutionTimeMs: performance.now() - startTime,
      };
    }

    // Kiểm tra cycle trước khi resolve
    const cycleCheck = this.detectCycles();
    if (cycleCheck.hasCycle) {
      return {
        success: false,
        error: cycleCheck.message,
        resolutionPath,
        resolutionTimeMs: performance.now() - startTime,
      };
    }

    try {
      const instance = this.resolveInternal(interfaceName, resolutionPath, new Set());
      const endTime = performance.now();

      return {
        success: true,
        instance,
        resolutionPath,
        resolutionTimeMs: endTime - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        resolutionPath,
        resolutionTimeMs: performance.now() - startTime,
      };
    }
  }

  /**
   * Internal resolve với tracking
   */
  private static resolveInternal(
    interfaceName: string,
    resolutionPath: string[],
    resolving: Set<string>
  ): ServiceInstance {
    if (resolving.has(interfaceName)) {
      throw new Error(`Circular dependency detected during resolution: ${interfaceName}`);
    }

    const registration = this.registrations.get(interfaceName);
    if (!registration) {
      throw new Error(`Service ${interfaceName} not registered`);
    }

    resolutionPath.push(interfaceName);

    // Singleton: Kiểm tra xem đã có instance chưa
    if (registration.lifetime === 'SINGLETON') {
      const existing = this.singletonInstances.get(interfaceName);
      if (existing) {
        return existing;
      }
    }

    // Resolve dependencies
    resolving.add(interfaceName);
    const resolvedDeps: string[] = [];

    for (const dep of registration.dependencies) {
      const depInstance = this.resolveInternal(dep, resolutionPath, resolving);
      resolvedDeps.push(depInstance.instanceId);
    }

    resolving.delete(interfaceName);

    // Tạo instance mới
    const instance: ServiceInstance = {
      interfaceName,
      implementationName: registration.implementationName,
      instanceId: this.generateInstanceId(registration.lifetime),
      lifetime: registration.lifetime,
      createdAt: Date.now(),
      resolvedDependencies: resolvedDeps,
    };

    // Lưu singleton instance
    if (registration.lifetime === 'SINGLETON') {
      this.singletonInstances.set(interfaceName, instance);
    }

    return instance;
  }

  /**
   * Tạo dependency graph để visualization
   */
  public static getDependencyGraph(): DependencyGraph {
    const nodes: string[] = [];
    const edges: Array<{ from: string; to: string }> = [];

    this.registrations.forEach((registration, interfaceName) => {
      nodes.push(interfaceName);
      registration.dependencies.forEach((dep) => {
        edges.push({ from: interfaceName, to: dep });
      });
    });

    return { nodes, edges };
  }

  /**
   * Lấy danh sách tất cả services đã đăng ký
   */
  public static getAllRegistrations(): ServiceRegistration[] {
    return Array.from(this.registrations.values());
  }

  /**
   * Lấy danh sách singleton instances hiện tại
   */
  public static getSingletonInstances(): ServiceInstance[] {
    return Array.from(this.singletonInstances.values());
  }

  /**
   * Xóa container (dùng cho testing)
   */
  public static reset(): void {
    this.registrations.clear();
    this.singletonInstances.clear();
    this.transientCounter = 0;
  }

  /**
   * Generate instance ID
   */
  private static generateInstanceId(lifetime: ServiceLifetime): string {
    if (lifetime === 'SINGLETON') {
      return `singleton-${Date.now().toString(36)}`;
    }
    this.transientCounter++;
    return `transient-${this.transientCounter}-${Date.now().toString(36).slice(-4)}`;
  }

  /**
   * Kiểm tra xem một service có phải singleton và đã được tạo chưa
   */
  public static isSingletonCreated(interfaceName: string): boolean {
    const reg = this.registrations.get(interfaceName);
    if (!reg || reg.lifetime !== 'SINGLETON') return false;
    return this.singletonInstances.has(interfaceName);
  }
}

export default DIContainerEngine;
