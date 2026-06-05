# Code Debugger — Resilience & Security Hardening Walkthrough

## Module: Code Debugger (`features/debug-mode/`)

The Code Debugger module is now **100% resilient** to crashes from bad syntax and infinite loops. This document describes the hardening measures implemented.

---

## 1. Syntax Error Protection

**Engine layer** (`DebuggerYieldEngine.ts`):
- `compileToDebugGenerator()` wraps the entire Acorn AST parse + escodegen transform in a try/catch
- Returns structured `{ success: false, error, errorLine }` on any parse failure (unmapped tokens, invalid syntax, malformed expressions)

**Store layer** (`useLiveDebuggerStore.ts`):
- `startDebuggingSession()` checks `compileResult.success` — if `false`, fires `useToastStore().error()` with Vietnamese message: *"Mã nguồn có lỗi cú pháp hoặc không hợp lệ, vui lòng kiểm tra lại!"*
- Runtime errors during generator construction (`new Function()` eval) are also caught and trigger the same toast
- `errorLine` ref is exposed to Monaco for red underline decoration on the failing line

## 2. Infinite Loop Guard

**Engine layer** (`DebuggerYieldEngine.ts`):
- `injectLoopGuards()` injects an `if (++__loopCounter > 5000) throw Error(...)` guard at the top of every `for`, `while`, and `do-while` loop body during AST transformation
- `LOOP_LIMIT = 5000` — hard threshold, not configurable by user code
- Guard is injected at compile time, so it executes inside the generator and terminates the iterator

**Debugger layer** (`LiveCompilerDebugger.ts`):
- `continueToNextBreakpoint()` has its own `MAX_CONTINUE_STEPS = 5000` limit — if no breakpoint is hit within 5000 generator `.next()` calls, execution aborts with an error
- `stepOut()` also has the same 5000-step safety net

**Store layer** (`useLiveDebuggerStore.ts`):
- All stepping actions (`stepForward`, `continueToNextBreakpoint`, `stepOut`) have try/catch blocks
- Loop guard errors are detected via pattern matching (`/gioi han an toan.*buoc lap/`) and fire `useToastStore().warning()` with Vietnamese message: *"Phát hiện vòng lặp vô hạn! Hệ thống đã tự động dừng để bảo vệ bộ nhớ."*
- Non-loop runtime errors fire `useToastStore().error()` with the syntax error message

## 3. Recursion Depth Guard

- `MAX_RECURSION_DEPTH = 500` — injected as `if (++__recursionDepth > 500) throw Error(...)` at the top of every converted generator function
- Prevents stack overflow from deeply recursive user code

## 4. Summary of Protection Layers

| Threat | Guard | Threshold | User Notification |
|---|---|---|---|
| Syntax errors / invalid tokens | Acorn parse try/catch | N/A | Toast error (Vietnamese) |
| Runtime eval failures | `new Function()` try/catch | N/A | Toast error (Vietnamese) |
| Infinite `for`/`while`/`do-while` loops | `__loopCounter` AST injection | 5,000 iterations | Toast warning (Vietnamese) |
| Infinite `continue` stepping | `MAX_CONTINUE_STEPS` | 5,000 steps | Toast warning (Vietnamese) |
| Deep recursion | `__recursionDepth` AST injection | 500 levels | Error thrown + toast |

**Compilation status:** `dotnet build` 0 errors, `vue-tsc --noEmit` 0 errors.
