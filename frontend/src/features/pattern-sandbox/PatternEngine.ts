/**
 * PatternEngine - Mô phỏng Design Patterns (Observer, Strategy, Factory)
 *
 * Sprint 9: Design Patterns Interactive Visualizer
 * - Observer Pattern: Subject/Observer registration và notification
 * - Strategy Pattern: Interchangeable algorithms
 * - Factory Pattern: Object creation abstraction
 */

// ============================================
// OBSERVER PATTERN
// ============================================

export interface Observer {
  id: string;
  name: string;
  onNotify(data: any): void;
}

export interface Subject {
  id: string;
  name: string;
  state: any;
  observers: Observer[];
}

export interface NotificationEvent {
  from: string;
  to: string;
  data: any;
  timestamp: number;
}

export class ObserverPatternSimulator {
  private subjects: Map<string, Subject> = new Map();
  private notificationHistory: NotificationEvent[] = [];
  private onNotificationCallback?: (event: NotificationEvent) => void;

  constructor(onNotification?: (event: NotificationEvent) => void) {
    this.onNotificationCallback = onNotification;
  }

  /**
   * Tạo một Subject mới
   */
  public createSubject(id: string, name: string, initialState: any = {}): Subject {
    const subject: Subject = {
      id,
      name,
      state: initialState,
      observers: [],
    };
    this.subjects.set(id, subject);
    return subject;
  }

  /**
   * Tạo một Observer mới
   */
  public createObserver(id: string, name: string): Observer {
    return {
      id,
      name,
      onNotify: (data: any) => {
        console.log(`Observer ${name} received:`, data);
      },
    };
  }

  /**
   * Đăng ký observer vào subject (Attach)
   */
  public attachObserver(subjectId: string, observer: Observer): boolean {
    const subject = this.subjects.get(subjectId);
    if (!subject) return false;

    // Kiểm tra xem observer đã được đăng ký chưa
    if (subject.observers.find((o) => o.id === observer.id)) {
      return false; // Already attached
    }

    subject.observers.push(observer);
    return true;
  }

  /**
   * Hủy đăng ký observer khỏi subject (Detach)
   */
  public detachObserver(subjectId: string, observerId: string): boolean {
    const subject = this.subjects.get(subjectId);
    if (!subject) return false;

    const index = subject.observers.findIndex((o) => o.id === observerId);
    if (index === -1) return false;

    subject.observers.splice(index, 1);
    return true;
  }

  /**
   * Subject thay đổi state và notify tất cả observers
   */
  public setState(subjectId: string, newState: any): NotificationEvent[] {
    const subject = this.subjects.get(subjectId);
    if (!subject) return [];

    const oldState = subject.state;
    subject.state = { ...oldState, ...newState };

    // Notify all observers
    const notifications: NotificationEvent[] = [];
    const timestamp = Date.now();

    subject.observers.forEach((observer) => {
      const event: NotificationEvent = {
        from: subject.id,
        to: observer.id,
        data: { oldState, newState: subject.state },
        timestamp,
      };

      notifications.push(event);
      this.notificationHistory.push(event);
      this.onNotificationCallback?.(event);

      // Gọi observer callback
      observer.onNotify(event.data);
    });

    return notifications;
  }

  /**
   * Lấy danh sách tất cả subjects
   */
  public getAllSubjects(): Subject[] {
    return Array.from(this.subjects.values());
  }

  /**
   * Lấy notification history
   */
  public getNotificationHistory(): NotificationEvent[] {
    return [...this.notificationHistory];
  }

  /**
   * Clear history
   */
  public clearHistory(): void {
    this.notificationHistory = [];
  }

  /**
   * Reset simulator
   */
  public reset(): void {
    this.subjects.clear();
    this.notificationHistory = [];
  }
}

// ============================================
// STRATEGY PATTERN
// ============================================

export interface Strategy {
  name: string;
  execute(data: number[]): number;
  description: string;
}

export interface Context {
  name: string;
  currentStrategy: Strategy | null;
  data: number[];
  result: number | null;
}

export class StrategyPatternSimulator {
  private strategies: Map<string, Strategy> = new Map();
  private context: Context;
  private onStrategyChangeCallback?: (oldStrategy: Strategy | null, newStrategy: Strategy) => void;

  constructor(contextName: string = 'SortingContext', onStrategyChange?: (oldStrategy: Strategy | null, newStrategy: Strategy) => void) {
    this.context = {
      name: contextName,
      currentStrategy: null,
      data: [],
      result: null,
    };
    this.onStrategyChangeCallback = onStrategyChange;
    this.registerDefaultStrategies();
  }

  private registerDefaultStrategies(): void {
    // Bubble Sort Strategy
    this.registerStrategy({
      name: 'BubbleSort',
      description: 'So sánh liền kề, đổi chỗ nếu cần',
      execute: (data: number[]) => {
        const arr = [...data];
        for (let i = 0; i < arr.length; i++) {
          for (let j = 0; j < arr.length - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
              [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
          }
        }
        return arr[arr.length - 1]; // Return max
      },
    });

    // Quick Sort Strategy
    this.registerStrategy({
      name: 'QuickSort',
      description: 'Chia để trị với pivot',
      execute: (data: number[]) => {
        const quickSort = (arr: number[]): number[] => {
          if (arr.length <= 1) return arr;
          const pivot = arr[Math.floor(arr.length / 2)];
          const left = arr.filter((x) => x < pivot);
          const middle = arr.filter((x) => x === pivot);
          const right = arr.filter((x) => x > pivot);
          return [...quickSort(left), ...middle, ...quickSort(right)];
        };
        const sorted = quickSort([...data]);
        return sorted[sorted.length - 1];
      },
    });

    // Max Strategy
    this.registerStrategy({
      name: 'FindMax',
      description: 'Tìm giá trị lớn nhất',
      execute: (data: number[]) => Math.max(...data),
    });

    // Sum Strategy
    this.registerStrategy({
      name: 'CalculateSum',
      description: 'Tính tổng các phần tử',
      execute: (data: number[]) => data.reduce((a, b) => a + b, 0),
    });
  }

  /**
   * Đăng ký một strategy mới
   */
  public registerStrategy(strategy: Strategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  /**
   * Chuyển đổi strategy (Set Strategy)
   */
  public setStrategy(strategyName: string): boolean {
    const newStrategy = this.strategies.get(strategyName);
    if (!newStrategy) return false;

    const oldStrategy = this.context.currentStrategy;
    this.context.currentStrategy = newStrategy;

    this.onStrategyChangeCallback?.(oldStrategy, newStrategy);
    return true;
  }

  /**
   * Thực thi strategy hiện tại
   */
  public executeStrategy(data?: number[]): { strategy: string; result: number; timeMs: number } | null {
    if (!this.context.currentStrategy) return null;

    const inputData = data || this.context.data;
    this.context.data = inputData;

    const start = performance.now();
    const result = this.context.currentStrategy.execute(inputData);
    const end = performance.now();

    this.context.result = result;

    return {
      strategy: this.context.currentStrategy.name,
      result,
      timeMs: end - start,
    };
  }

  /**
   * Lấy context hiện tại
   */
  public getContext(): Context {
    return { ...this.context };
  }

  /**
   * Lấy danh sách tất cả strategies
   */
  public getAllStrategies(): Strategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Thay đổi data trong context
   */
  public setData(data: number[]): void {
    this.context.data = data;
  }
}

// ============================================
// FACTORY PATTERN
// ============================================

export interface Product {
  id: string;
  name: string;
  type: string;
  properties: Record<string, any>;
}

export interface Factory {
  type: string;
  name: string;
  productsCreated: number;
}

export class FactoryPatternSimulator {
  private factories: Map<string, Factory> = new Map();
  private products: Map<string, Product> = new Map();
  private productCounter = 0;

  /**
   * Tạo một factory
   */
  public createFactory(type: string, name: string): Factory {
    const factory: Factory = {
      type,
      name,
      productsCreated: 0,
    };
    this.factories.set(type, factory);
    return factory;
  }

  /**
   * Factory method: Tạo product
   */
  public createProduct(factoryType: string, name: string, properties: Record<string, any> = {}): Product | null {
    const factory = this.factories.get(factoryType);
    if (!factory) return null;

    this.productCounter++;
    const product: Product = {
      id: `${factoryType}-${this.productCounter}`,
      name,
      type: factoryType,
      properties,
    };

    this.products.set(product.id, product);
    factory.productsCreated++;

    return product;
  }

  /**
   * Lấy tất cả factories
   */
  public getAllFactories(): Factory[] {
    return Array.from(this.factories.values());
  }

  /**
   * Lấy tất cả products
   */
  public getAllProducts(): Product[] {
    return Array.from(this.products.values());
  }

  /**
   * Lấy products theo type
   */
  public getProductsByType(type: string): Product[] {
    return this.getAllProducts().filter((p) => p.type === type);
  }

  /**
   * Reset
   */
  public reset(): void {
    this.factories.clear();
    this.products.clear();
    this.productCounter = 0;
  }
}

// ============================================
// Message Flow Animation Helpers
// ============================================

export interface BezierPath {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  controlX: number;
  controlY: number;
}

export class MessageFlowRenderer {
  /**
   * Tính toán Bezier curve path
   */
  public static calculateBezierPath(from: { x: number; y: number }, to: { x: number; y: number }): BezierPath {
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2 - 30; // Curve upward

    return {
      startX: from.x,
      startY: from.y,
      endX: to.x,
      endY: to.y,
      controlX: mx,
      controlY: my,
    };
  }

  /**
   * Convert BezierPath to SVG path string
   */
  public static toSvgPath(path: BezierPath): string {
    return `M ${path.startX} ${path.startY} Q ${path.controlX} ${path.controlY} ${path.endX} ${path.endY}`;
  }

  /**
   * Tính điểm trên Bezier curve tại t% (0-1)
   */
  public static getPointOnBezier(path: BezierPath, t: number): { x: number; y: number } {
    // Quadratic Bezier formula: B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
    const { startX, startY, endX, endY, controlX, controlY } = path;

    const x = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * controlX + Math.pow(t, 2) * endX;

    const y = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * controlY + Math.pow(t, 2) * endY;

    return { x, y };
  }
}

export default {
  ObserverPatternSimulator,
  StrategyPatternSimulator,
  FactoryPatternSimulator,
  MessageFlowRenderer,
};
