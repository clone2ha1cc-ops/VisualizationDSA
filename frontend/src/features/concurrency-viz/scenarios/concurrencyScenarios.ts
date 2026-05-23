import type { ConcurrencyScenario, ScenarioStep, ThreadInstance } from '../types/concurrency.types';

function makeThread(id: string, name: string): ThreadInstance {
  return { id, name, state: 'READY', progress: 0, heldLocks: [], waitingForLock: null };
}

const raceConditionSteps: ScenarioStep[] = [
  { threadId: 'T1', action: 'MOVE', progressTarget: 20 },
  { threadId: 'T2', action: 'MOVE', progressTarget: 20 },
  { threadId: 'T1', action: 'MOVE', progressTarget: 40 },
  { threadId: 'T2', action: 'MOVE', progressTarget: 40 },
  { threadId: 'T1', action: 'ACQUIRE_LOCK', lockId: 'MUTEX' },
  { threadId: 'T1', action: 'MOVE', progressTarget: 50 },
  { threadId: 'T2', action: 'ACQUIRE_LOCK', lockId: 'MUTEX' },
  { threadId: 'T1', action: 'READ_COUNTER' },
  { threadId: 'T1', action: 'INCREMENT_COUNTER' },
  { threadId: 'T1', action: 'MOVE', progressTarget: 60 },
  { threadId: 'T1', action: 'READ_COUNTER' },
  { threadId: 'T1', action: 'INCREMENT_COUNTER' },
  { threadId: 'T1', action: 'MOVE', progressTarget: 80 },
  { threadId: 'T1', action: 'RELEASE_LOCK', lockId: 'MUTEX' },
  { threadId: 'T1', action: 'MOVE', progressTarget: 100 },
  { threadId: 'T2', action: 'MOVE', progressTarget: 50 },
  { threadId: 'T2', action: 'READ_COUNTER' },
  { threadId: 'T2', action: 'INCREMENT_COUNTER' },
  { threadId: 'T2', action: 'MOVE', progressTarget: 60 },
  { threadId: 'T2', action: 'READ_COUNTER' },
  { threadId: 'T2', action: 'INCREMENT_COUNTER' },
  { threadId: 'T2', action: 'MOVE', progressTarget: 80 },
  { threadId: 'T2', action: 'RELEASE_LOCK', lockId: 'MUTEX' },
  { threadId: 'T2', action: 'MOVE', progressTarget: 100 },
];

const deadlockDemoSteps: ScenarioStep[] = [
  { threadId: 'T1', action: 'MOVE', progressTarget: 20 },
  { threadId: 'T2', action: 'MOVE', progressTarget: 20 },
  { threadId: 'T1', action: 'MOVE', progressTarget: 40 },
  { threadId: 'T2', action: 'MOVE', progressTarget: 40 },
  { threadId: 'T1', action: 'ACQUIRE_LOCK', lockId: 'L1' },
  { threadId: 'T2', action: 'ACQUIRE_LOCK', lockId: 'L2' },
  { threadId: 'T1', action: 'MOVE', progressTarget: 60 },
  { threadId: 'T2', action: 'MOVE', progressTarget: 60 },
  { threadId: 'T1', action: 'MOVE', progressTarget: 70 },
  { threadId: 'T2', action: 'MOVE', progressTarget: 70 },
  { threadId: 'T1', action: 'ACQUIRE_LOCK', lockId: 'L2' },
  { threadId: 'T2', action: 'ACQUIRE_LOCK', lockId: 'L1' },
];

const producerConsumerSteps: ScenarioStep[] = [
  { threadId: 'P1', action: 'MOVE', progressTarget: 20 },
  { threadId: 'C1', action: 'MOVE', progressTarget: 20 },
  { threadId: 'P1', action: 'ACQUIRE_LOCK', lockId: 'BUFFER_LOCK' },
  { threadId: 'P1', action: 'MOVE', progressTarget: 40 },
  { threadId: 'P1', action: 'INCREMENT_COUNTER' },
  { threadId: 'P1', action: 'MOVE', progressTarget: 60 },
  { threadId: 'P1', action: 'INCREMENT_COUNTER' },
  { threadId: 'P1', action: 'RELEASE_LOCK', lockId: 'BUFFER_LOCK' },
  { threadId: 'P1', action: 'MOVE', progressTarget: 80 },
  { threadId: 'C1', action: 'ACQUIRE_LOCK', lockId: 'BUFFER_LOCK' },
  { threadId: 'C1', action: 'MOVE', progressTarget: 40 },
  { threadId: 'C1', action: 'READ_COUNTER' },
  { threadId: 'C1', action: 'MOVE', progressTarget: 60 },
  { threadId: 'C1', action: 'READ_COUNTER' },
  { threadId: 'C1', action: 'RELEASE_LOCK', lockId: 'BUFFER_LOCK' },
  { threadId: 'C1', action: 'MOVE', progressTarget: 80 },
  { threadId: 'P1', action: 'MOVE', progressTarget: 100 },
  { threadId: 'C1', action: 'MOVE', progressTarget: 100 },
];

const diningPhilosophersSteps: ScenarioStep[] = [
  { threadId: 'P0', action: 'MOVE', progressTarget: 20 },
  { threadId: 'P1', action: 'MOVE', progressTarget: 20 },
  { threadId: 'P2', action: 'MOVE', progressTarget: 20 },
  { threadId: 'P3', action: 'MOVE', progressTarget: 20 },
  { threadId: 'P4', action: 'MOVE', progressTarget: 20 },
  { threadId: 'P0', action: 'ACQUIRE_LOCK', lockId: 'F0' },
  { threadId: 'P1', action: 'ACQUIRE_LOCK', lockId: 'F1' },
  { threadId: 'P2', action: 'ACQUIRE_LOCK', lockId: 'F2' },
  { threadId: 'P3', action: 'ACQUIRE_LOCK', lockId: 'F3' },
  { threadId: 'P4', action: 'ACQUIRE_LOCK', lockId: 'F4' },
  { threadId: 'P0', action: 'MOVE', progressTarget: 50 },
  { threadId: 'P1', action: 'MOVE', progressTarget: 50 },
  { threadId: 'P2', action: 'MOVE', progressTarget: 50 },
  { threadId: 'P3', action: 'MOVE', progressTarget: 50 },
  { threadId: 'P4', action: 'MOVE', progressTarget: 50 },
  { threadId: 'P0', action: 'ACQUIRE_LOCK', lockId: 'F1' },
  { threadId: 'P1', action: 'ACQUIRE_LOCK', lockId: 'F2' },
  { threadId: 'P2', action: 'ACQUIRE_LOCK', lockId: 'F3' },
  { threadId: 'P3', action: 'ACQUIRE_LOCK', lockId: 'F4' },
  { threadId: 'P4', action: 'ACQUIRE_LOCK', lockId: 'F0' },
];

export const CONCURRENCY_SCENARIOS: ConcurrencyScenario[] = [
  {
    id: 'race-condition',
    title: 'Race Condition',
    description: 'Hai luồng cùng cộng Counter dùng chung. Bật Mutex để xem khóa bảo vệ.',
    threads: [
      makeThread('T1', 'Luồng A (Cộng Counter)'),
      makeThread('T2', 'Luồng B (Cộng Counter)'),
    ],
    lockIds: ['MUTEX'],
    lockNames: { MUTEX: 'Mutex Lock' },
    mutexEnabled: true,
    pseudocode: `// Race Condition Demo
shared int counter = 0;

thread A {
  lock(mutex);      // Bước vào vùng găng
  int temp = counter;
  temp = temp + 1;
  counter = temp;   // Ghi lại
  unlock(mutex);    // Rời vùng găng
}

thread B {
  lock(mutex);
  int temp = counter;
  temp = temp + 1;
  counter = temp;
  unlock(mutex);
}`,
    steps: raceConditionSteps,
  },
  {
    id: 'deadlock-demo',
    title: 'Deadlock Circle',
    description: 'Luồng A giữ L1 đòi L2, Luồng B giữ L2 đòi L1 — tắc nghẽn vòng tròn.',
    threads: [
      makeThread('T1', 'Luồng A (Giữ L1 đòi L2)'),
      makeThread('T2', 'Luồng B (Giữ L2 đòi L1)'),
    ],
    lockIds: ['L1', 'L2'],
    lockNames: { L1: 'Khóa L1', L2: 'Khóa L2' },
    mutexEnabled: true,
    pseudocode: `// Deadlock Demo
thread A {
  lock(L1);    // Chiếm khóa L1
  // ... xử lý ...
  lock(L2);    // Đòi khóa L2 -> BLOCKED!
  unlock(L2);
  unlock(L1);
}

thread B {
  lock(L2);    // Chiếm khóa L2
  // ... xử lý ...
  lock(L1);    // Đòi khóa L1 -> BLOCKED!
  unlock(L1);
  unlock(L2);
}`,
    steps: deadlockDemoSteps,
  },
  {
    id: 'producer-consumer',
    title: 'Producer - Consumer',
    description: 'Nhà sản xuất ghi vào buffer, Người tiêu dùng đọc ra — đồng bộ bằng Mutex.',
    threads: [
      makeThread('P1', 'Producer (Sản xuất)'),
      makeThread('C1', 'Consumer (Tiêu dùng)'),
    ],
    lockIds: ['BUFFER_LOCK'],
    lockNames: { BUFFER_LOCK: 'Buffer Lock' },
    mutexEnabled: true,
    pseudocode: `// Producer-Consumer
shared buffer[5];
mutex bufferLock;

producer() {
  lock(bufferLock);
  buffer.push(item);
  unlock(bufferLock);
}

consumer() {
  lock(bufferLock);
  item = buffer.pop();
  unlock(bufferLock);
}`,
    steps: producerConsumerSteps,
  },
  {
    id: 'dining-philosophers',
    title: 'Dining Philosophers',
    description: '5 triết gia tranh chấp 5 chiếc đũa — nguy cơ Deadlock vòng tròn.',
    threads: [
      makeThread('P0', 'Triết gia 0'),
      makeThread('P1', 'Triết gia 1'),
      makeThread('P2', 'Triết gia 2'),
      makeThread('P3', 'Triết gia 3'),
      makeThread('P4', 'Triết gia 4'),
    ],
    lockIds: ['F0', 'F1', 'F2', 'F3', 'F4'],
    lockNames: { F0: 'Đũa 0', F1: 'Đũa 1', F2: 'Đũa 2', F3: 'Đũa 3', F4: 'Đũa 4' },
    mutexEnabled: true,
    pseudocode: `// Dining Philosophers
// 5 triết gia ngồi quanh bàn tròn
// Mỗi người cần 2 đũa (trái + phải)

philosopher(i) {
  think();
  lock(fork[i]);       // Lấy đũa bên trái
  lock(fork[(i+1)%5]); // Lấy đũa bên phải
  eat();
  unlock(fork[(i+1)%5]);
  unlock(fork[i]);
}`,
    steps: diningPhilosophersSteps,
  },
];

export function getScenarioById(id: string): ConcurrencyScenario | undefined {
  return CONCURRENCY_SCENARIOS.find(s => s.id === id);
}
