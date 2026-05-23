/**
 * DSLEngine - Custom DSL (Domain Specific Language) Compiler
 *
 * Sprint 10: State Inspector Stack-Heap & Custom DSL Compiler
 * - Biên dịch các lệnh đơn giản: ALLOC, PUSH, POP, LINK, FREE
 * - Sinh animation frames từ DSL commands
 */

export type DSLCommandType = 'ALLOC' | 'PUSH' | 'POP' | 'LINK' | 'FREE' | 'CALL' | 'RETURN';

export interface DSLCommand {
  type: DSLCommandType;
  args: string[];
  line: number;
  raw: string;
}

export interface DSLAnimationFrame {
  frameIndex: number;
  command: DSLCommand;
  stackFrames: StackFrame[];
  heapObjects: HeapObject[];
  pointers: Pointer[];
  description: string;
}

export interface StackFrame {
  id: string;
  functionName: string;
  parameters: Record<string, any>;
  localVars: Record<string, any>;
  depth: number;
}

export interface HeapObject {
  id: string;
  type: string;
  size: number;
  data: any;
  references: number;
}

export interface Pointer {
  id: string;
  fromStackFrameId?: string;
  toHeapObjectId?: string;
  fromVarName: string;
  targetId: string;
}

export interface DSLCompileResult {
  success: boolean;
  frames?: DSLAnimationFrame[];
  error?: string;
  commandCount: number;
  executionTimeMs: number;
}

export class DSLEngine {
  private static stackFrames: Map<string, StackFrame> = new Map();
  private static heapObjects: Map<string, HeapObject> = new Map();
  private static pointers: Map<string, Pointer> = new Map();
  private static callStackDepth = 0;

  /**
   * Parse DSL script thành các commands
   */
  public static parseScript(script: string): DSLCommand[] {
    const lines = script.split('\n').map((line) => line.trim()).filter((line) => line && !line.startsWith('#'));

    return lines.map((line, index) => {
      const parts = line.split(/\s+/);
      const type = parts[0].toUpperCase() as DSLCommandType;
      const args = parts.slice(1);

      return {
        type,
        args,
        line: index + 1,
        raw: line,
      };
    });
  }

  /**
   * Biên dịch DSL script thành animation frames
   */
  public static compile(script: string): DSLCompileResult {
    const startTime = performance.now();

    try {
      // Reset state
      this.reset();

      const commands = this.parseScript(script);
      const frames: DSLAnimationFrame[] = [];

      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        const frame = this.executeCommand(command, i);
        frames.push(frame);
      }

      const endTime = performance.now();

      return {
        success: true,
        frames,
        commandCount: commands.length,
        executionTimeMs: endTime - startTime,
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown compilation error',
        commandCount: 0,
        executionTimeMs: endTime - startTime,
      };
    }
  }

  /**
   * Thực thi một command và tạo frame
   */
  private static executeCommand(command: DSLCommand, frameIndex: number): DSLAnimationFrame {
    let description = '';

    switch (command.type) {
      case 'CALL': {
        // CALL functionName [param1 param2 ...]
        const funcName = command.args[0] || 'anonymous';
        const params: Record<string, any> = {};
        for (let i = 1; i < command.args.length; i += 2) {
          if (command.args[i + 1]) {
            params[command.args[i]] = command.args[i + 1];
          }
        }

        this.callStackDepth++;
        const frameId = `frame-${this.callStackDepth}`;
        const stackFrame: StackFrame = {
          id: frameId,
          functionName: funcName,
          parameters: params,
          localVars: {},
          depth: this.callStackDepth,
        };
        this.stackFrames.set(frameId, stackFrame);
        description = `Gọi hàm ${funcName} với ${Object.keys(params).length} tham số`;
        break;
      }

      case 'ALLOC': {
        // ALLOC nodeId size [type]
        const nodeId = command.args[0];
        const size = parseInt(command.args[1]) || 12;
        const type = command.args[2] || 'object';

        if (!nodeId) throw new Error('ALLOC requires nodeId');

        const heapObject: HeapObject = {
          id: nodeId,
          type,
          size,
          data: null,
          references: 0,
        };
        this.heapObjects.set(nodeId, heapObject);
        description = `Cấp phát ${type} kích thước ${size} bytes trên Heap`;
        break;
      }

      case 'PUSH': {
        // PUSH stackFrameId varName value
        const frameId = command.args[0] || `frame-${this.callStackDepth}`;
        const varName = command.args[1];
        const value = command.args[2];

        const frame = this.stackFrames.get(frameId);
        if (frame && varName) {
          frame.localVars[varName] = value;
          description = `Push ${varName} = ${value} vào stack frame ${frame.functionName}`;
        }
        break;
      }

      case 'POP': {
        // POP stackFrameId
        const frameId = command.args[0] || `frame-${this.callStackDepth}`;

        if (this.stackFrames.has(frameId)) {
          const frame = this.stackFrames.get(frameId)!;
          description = `Pop stack frame ${frame.functionName}`;
          this.stackFrames.delete(frameId);
          if (this.callStackDepth > 0) this.callStackDepth--;
        }
        break;
      }

      case 'LINK': {
        // LINK stackFrameId.varName -> heapObjectId
        const linkExpr = command.args.join(' ');
        const match = linkExpr.match(/(\w+)\.?(\w+)?\s*->\s*(\w+)/);

        if (match) {
          const frameId = match[1];
          const varName = match[2] || 'ptr';
          const heapId = match[3];

          const pointer: Pointer = {
            id: `ptr-${frameId}-${varName}`,
            fromStackFrameId: frameId,
            toHeapObjectId: heapId,
            fromVarName: varName,
            targetId: heapId,
          };
          this.pointers.set(pointer.id, pointer);

          // Increase reference count
          const heapObj = this.heapObjects.get(heapId);
          if (heapObj) {
            heapObj.references++;
          }

          description = `Tạo pointer từ ${frameId}.${varName} -> ${heapId}`;
        }
        break;
      }

      case 'FREE': {
        // FREE heapObjectId
        const heapId = command.args[0];

        if (heapId && this.heapObjects.has(heapId)) {
          this.heapObjects.delete(heapId);

          // Remove associated pointers
          for (const [ptrId, ptr] of this.pointers) {
            if (ptr.toHeapObjectId === heapId) {
              this.pointers.delete(ptrId);
            }
          }

          description = `Giải phóng bộ nhớ ${heapId}`;
        }
        break;
      }

      case 'RETURN': {
        // RETURN value
        const returnValue = command.args[0];
        description = `Return ${returnValue || 'void'}`;

        // Pop current frame
        if (this.callStackDepth > 0) {
          const currentFrameId = `frame-${this.callStackDepth}`;
          if (this.stackFrames.has(currentFrameId)) {
            this.stackFrames.delete(currentFrameId);
            this.callStackDepth--;
          }
        }
        break;
      }

      default:
        description = `Unknown command: ${command.type}`;
    }

    // Create frame snapshot
    return {
      frameIndex,
      command,
      stackFrames: Array.from(this.stackFrames.values()),
      heapObjects: Array.from(this.heapObjects.values()),
      pointers: Array.from(this.pointers.values()),
      description,
    };
  }

  /**
   * Reset engine state
   */
  public static reset(): void {
    this.stackFrames.clear();
    this.heapObjects.clear();
    this.pointers.clear();
    this.callStackDepth = 0;
  }

  /**
   * Sample DSL scripts
   */
  public static getSampleScripts(): Record<string, string> {
    return {
      'Simple Function Call': `CALL main
PUSH frame-1 x 42
PUSH frame-1 y "hello"
ALLOC node1 16 Node
LINK frame-1.ptr -> node1
RETURN node1
POP frame-1`,

      'Linked List Creation': `CALL createList
ALLOC head 12 ListNode
PUSH frame-1 head head
ALLOC node2 12 ListNode
LINK head.next -> node2
ALLOC node3 12 ListNode
LINK node2.next -> node3
RETURN head
POP frame-1`,

      'Memory Management': `CALL allocateMemory
ALLOC buffer1 256 Buffer
ALLOC buffer2 128 Buffer
LINK frame-1.b1 -> buffer1
LINK frame-1.b2 -> buffer2
FREE buffer1
RETURN buffer2
POP frame-1`,
    };
  }
}

export default DSLEngine;
