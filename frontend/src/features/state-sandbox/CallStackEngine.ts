/**
 * CallStackEngine - 3D Call Stack & Heap Visualization Engine
 *
 * Sprint 10: State Inspector Stack-Heap
 * - 3D stack frame visualization
 * - Stack-to-Heap Bezier pointer arrows
 * - Resize-aware coordinate tracking
 */

export interface StackFrame3D {
  id: string;
  functionName: string;
  params: Array<{ name: string; value: any }>;
  localVars: Array<{ name: string; value: any; isPointer: boolean }>;
  depth: number;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number };
}

export interface HeapNode3D {
  id: string;
  type: string;
  size: number;
  data: any;
  position: { x: number; y: number };
  references: number;
}

export interface PointerArrow {
  id: string;
  fromStackFrameId: string;
  fromVarName: string;
  toHeapNodeId: string;
  path: BezierPath;
  isActive: boolean;
}

export interface BezierPath {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  controlX1: number;
  controlY1: number;
  controlX2: number;
  controlY2: number;
}

export interface MemorySnapshot {
  timestamp: number;
  stackFrames: StackFrame3D[];
  heapNodes: HeapNode3D[];
  pointers: PointerArrow[];
}

export class CallStackEngine {
  private static stackFrames: Map<string, StackFrame3D> = new Map();
  private static heapNodes: Map<string, HeapNode3D> = new Map();
  private static pointers: Map<string, PointerArrow> = new Map();
  private static snapshots: MemorySnapshot[] = [];
  private static frameCounter = 0;

  // Layout configuration
  private static readonly STACK_X = 50;
  private static readonly STACK_START_Y = 50;
  private static readonly STACK_FRAME_HEIGHT = 80;
  private static readonly STACK_FRAME_WIDTH = 200;
  private static readonly STACK_FRAME_GAP = 10;
  private static readonly HEAP_X = 300;
  private static readonly HEAP_START_Y = 50;
  private static readonly HEAP_NODE_GAP = 20;

  /**
   * Push a new stack frame
   */
  public static pushFrame(
    functionName: string,
    params: Record<string, any> = {},
    localVars: Record<string, any> = {},
  ): StackFrame3D {
    this.frameCounter++;
    const id = `frame-${this.frameCounter}`;
    const depth = this.stackFrames.size + 1;

    const paramArray = Object.entries(params).map(([name, value]) => ({
      name,
      value,
    }));

    const localVarArray = Object.entries(localVars).map(([name, value]) => ({
      name,
      value,
      isPointer: typeof value === "string" && value.startsWith("heap-"),
    }));

    const frame: StackFrame3D = {
      id,
      functionName,
      params: paramArray,
      localVars: localVarArray,
      depth,
      position: {
        x: this.STACK_X,
        y:
          this.STACK_START_Y +
          (depth - 1) * (this.STACK_FRAME_HEIGHT + this.STACK_FRAME_GAP),
        z: depth * 10, // 3D depth effect
      },
      size: {
        width: this.STACK_FRAME_WIDTH,
        height: this.STACK_FRAME_HEIGHT,
      },
    };

    this.stackFrames.set(id, frame);
    this.createSnapshot();
    return frame;
  }

  /**
   * Pop a stack frame
   */
  public static popFrame(): StackFrame3D | null {
    const lastFrame = Array.from(this.stackFrames.values()).pop();
    if (!lastFrame) return null;

    this.stackFrames.delete(lastFrame.id);

    // Remove associated pointers
    for (const [ptrId, ptr] of this.pointers) {
      if (ptr.fromStackFrameId === lastFrame.id) {
        this.pointers.delete(ptrId);
      }
    }

    this.recalculateStackPositions();
    this.createSnapshot();
    return lastFrame;
  }

  /**
   * Allocate heap node
   */
  public static allocateHeapNode(
    type: string,
    size: number,
    data?: any,
  ): HeapNode3D {
    const id = `heap-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const index = this.heapNodes.size;

    const node: HeapNode3D = {
      id,
      type,
      size,
      data: data || null,
      position: {
        x: this.HEAP_X,
        y: this.HEAP_START_Y + index * (size + this.HEAP_NODE_GAP),
      },
      references: 0,
    };

    this.heapNodes.set(id, node);
    this.createSnapshot();
    return node;
  }

  /**
   * Free heap node
   */
  public static freeHeapNode(nodeId: string): boolean {
    if (!this.heapNodes.has(nodeId)) return false;

    this.heapNodes.delete(nodeId);

    // Remove associated pointers
    for (const [ptrId, ptr] of this.pointers) {
      if (ptr.toHeapNodeId === nodeId) {
        this.pointers.delete(ptrId);
      }
    }

    this.recalculateHeapPositions();
    this.createSnapshot();
    return true;
  }

  /**
   * Create pointer from stack frame to heap
   */
  public static createPointer(
    fromStackFrameId: string,
    fromVarName: string,
    toHeapNodeId: string,
  ): PointerArrow | null {
    const frame = this.stackFrames.get(fromStackFrameId);
    const heapNode = this.heapNodes.get(toHeapNodeId);

    if (!frame || !heapNode) return null;

    const ptrId = `ptr-${fromStackFrameId}-${fromVarName}`;

    // Calculate Bezier path
    const startX = frame.position.x + frame.size.width;
    const startY = frame.position.y + frame.size.height / 2;
    const endX = heapNode.position.x;
    const endY = heapNode.position.y + 20;

    const path: BezierPath = {
      startX,
      startY,
      endX,
      endY,
      controlX1: startX + 50,
      controlY1: startY,
      controlX2: endX - 50,
      controlY2: endY,
    };

    const pointer: PointerArrow = {
      id: ptrId,
      fromStackFrameId,
      fromVarName,
      toHeapNodeId,
      path,
      isActive: true,
    };

    this.pointers.set(ptrId, pointer);

    // Update heap node reference count
    heapNode.references++;

    // Update local var to mark as pointer
    const localVar = frame.localVars.find((v) => v.name === fromVarName);
    if (localVar) {
      localVar.isPointer = true;
      localVar.value = toHeapNodeId;
    }

    this.createSnapshot();
    return pointer;
  }

  /**
   * Convert BezierPath to SVG path string
   */
  public static bezierToSvgPath(path: BezierPath): string {
    return `M ${path.startX} ${path.startY} C ${path.controlX1} ${path.controlY1}, ${path.controlX2} ${path.controlY2}, ${path.endX} ${path.endY}`;
  }

  /**
   * Get all pointer paths as SVG strings
   */
  public static getAllPointerPaths(): Array<{
    id: string;
    path: string;
    isActive: boolean;
  }> {
    return Array.from(this.pointers.values()).map((ptr) => ({
      id: ptr.id,
      path: this.bezierToSvgPath(ptr.path),
      isActive: ptr.isActive,
    }));
  }

  /**
   * Get current state
   */
  public static getCurrentState(): MemorySnapshot {
    return {
      timestamp: Date.now(),
      stackFrames: Array.from(this.stackFrames.values()),
      heapNodes: Array.from(this.heapNodes.values()),
      pointers: Array.from(this.pointers.values()),
    };
  }

  /**
   * Get all snapshots
   */
  public static getSnapshots(): MemorySnapshot[] {
    return [...this.snapshots];
  }

  /**
   * Clear all snapshots
   */
  public static clearSnapshots(): void {
    this.snapshots = [];
  }

  /**
   * Reset engine
   */
  public static reset(): void {
    this.stackFrames.clear();
    this.heapNodes.clear();
    this.pointers.clear();
    this.snapshots = [];
    this.frameCounter = 0;
  }

  /**
   * Recalculate stack positions after pop
   */
  private static recalculateStackPositions(): void {
    let depth = 1;
    for (const frame of this.stackFrames.values()) {
      frame.depth = depth;
      frame.position.y =
        this.STACK_START_Y +
        (depth - 1) * (this.STACK_FRAME_HEIGHT + this.STACK_FRAME_GAP);
      frame.position.z = depth * 10;
      depth++;
    }
    this.updatePointerPaths();
  }

  /**
   * Recalculate heap positions after free
   */
  private static recalculateHeapPositions(): void {
    let index = 0;
    for (const node of this.heapNodes.values()) {
      node.position.y =
        this.HEAP_START_Y + index * (node.size + this.HEAP_NODE_GAP);
      index++;
    }
    this.updatePointerPaths();
  }

  /**
   * Update all pointer paths
   */
  private static updatePointerPaths(): void {
    for (const pointer of this.pointers.values()) {
      const frame = this.stackFrames.get(pointer.fromStackFrameId);
      const heapNode = this.heapNodes.get(pointer.toHeapNodeId);

      if (frame && heapNode) {
        pointer.path.startX = frame.position.x + frame.size.width;
        pointer.path.startY = frame.position.y + frame.size.height / 2;
        pointer.path.endX = heapNode.position.x;
        pointer.path.endY = heapNode.position.y + 20;
        pointer.path.controlX1 = pointer.path.startX + 50;
        pointer.path.controlY1 = pointer.path.startY;
        pointer.path.controlX2 = pointer.path.endX - 50;
        pointer.path.controlY2 = pointer.path.endY;
      }
    }
  }

  /**
   * Create snapshot
   */
  private static createSnapshot(): void {
    this.snapshots.push(this.getCurrentState());
  }

  /**
   * Sample scenarios
   */
  public static runSampleScenario(scenario: string): void {
    this.reset();

    switch (scenario) {
      case "function-call": {
        this.pushFrame("main", {}, {});
        const frame1 = this.pushFrame("calculate", { a: 10, b: 20 }, {});
        const heap1 = this.allocateHeapNode("Result", 16, { sum: 30 });
        this.createPointer(frame1.id, "result", heap1.id);
        break;
      }

      case "linked-list": {
        this.pushFrame("createList", {}, {});
        const node1 = this.allocateHeapNode("ListNode", 24, { value: 1 });
        const _node2 = this.allocateHeapNode("ListNode", 24, { value: 2 });
        const _node3 = this.allocateHeapNode("ListNode", 24, { value: 3 });
        this.createPointer("frame-1", "head", node1.id);
        break;
      }

      case "complex": {
        this.pushFrame("main", {}, {});
        const funcFrame = this.pushFrame("processData", { data: "input" }, {});
        const buffer = this.allocateHeapNode("Buffer", 256, null);
        const result = this.allocateHeapNode("Result", 32, { processed: true });
        this.createPointer(funcFrame.id, "buffer", buffer.id);
        this.createPointer(funcFrame.id, "output", result.id);
        break;
      }
    }
  }
}

export default CallStackEngine;
