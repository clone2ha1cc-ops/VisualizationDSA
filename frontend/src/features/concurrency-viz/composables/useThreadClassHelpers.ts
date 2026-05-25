import type { ThreadInstance } from '../types/concurrency.types';

export function threadLabelClass(thread: ThreadInstance): string {
  switch (thread.state) {
    case 'RUNNING':  return 'bg-cyan-900/50 text-cyan-300 border border-cyan-700/50';
    case 'BLOCKED':  return 'bg-amber-900/50 text-amber-300 border border-amber-700/50';
    case 'FINISHED': return 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50';
    default: return 'bg-slate-800 text-slate-400 border border-slate-700';
  }
}

export function threadNodeClass(thread: ThreadInstance): string {
  if (thread.state === 'BLOCKED')  return 'thread-runner-node status-blocked';
  if (thread.state === 'FINISHED') return 'thread-runner-node status-finished';
  return 'thread-runner-node';
}

export function stateBadgeClass(thread: ThreadInstance): string {
  switch (thread.state) {
    case 'RUNNING':  return 'bg-cyan-900/30 text-cyan-400';
    case 'BLOCKED':  return 'bg-amber-900/30 text-amber-400';
    case 'FINISHED': return 'bg-emerald-900/30 text-emerald-400';
    default: return 'bg-slate-800 text-slate-500';
  }
}

export function isThreadHoldingAnyLock(thread: ThreadInstance): boolean {
  return thread.heldLocks.length > 0;
}

export function lockIconClass(thread: ThreadInstance): string {
  return thread.heldLocks.length > 0 ? 'mutex-lock-icon state-locked' : 'mutex-lock-icon';
}

export function lockTextClass(thread: ThreadInstance): string {
  return thread.heldLocks.length > 0 ? 'text-amber-400' : 'text-cyan-400/60';
}

export function getLockStatusText(thread: ThreadInstance): string {
  if (thread.heldLocks.length > 0) return thread.heldLocks.join(', ');
  if (thread.waitingForLock) return `Đợi ${thread.waitingForLock}`;
  return '';
}
