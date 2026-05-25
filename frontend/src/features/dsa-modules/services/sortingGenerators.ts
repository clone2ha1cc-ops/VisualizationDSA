import type { AlgorithmResult, FrameDTO, HighlightIndices } from '../types/algorithm.types';

function defaultHighlights(overrides?: Partial<HighlightIndices>): HighlightIndices {
  return { compare: [], swap: [], sorted: [], dimmed: [], active: [], ...overrides };
}

export function generateBubbleSort(inputData: number[]): AlgorithmResult {
  const arr = [...inputData], n = arr.length, frames: FrameDTO[] = [], sortedIndices: number[] = [];
  let stepId = 0;
  const pseudoCode = ['for i from 0 to N-1', '  for j from 0 to N-i-2', '    if A[j] > A[j+1]', '      swap(A[j], A[j+1])'];
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Bắt đầu Bubble Sort.', dataState: [...arr], highlights: defaultHighlights() });
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      frames.push({ stepId: ++stepId, activeLine: 2, explanation: `So sánh A[${j}] (${arr[j]}) và A[${j+1}] (${arr[j+1]})`, dataState: [...arr], highlights: defaultHighlights({ compare: [j, j+1], sorted: [...sortedIndices] }) });
      if (arr[j] > arr[j+1]) { [arr[j], arr[j+1]] = [arr[j+1], arr[j]]; frames.push({ stepId: ++stepId, activeLine: 3, explanation: `Hoán vị A[${j}] và A[${j+1}]`, dataState: [...arr], highlights: defaultHighlights({ swap: [j, j+1], sorted: [...sortedIndices] }) }); }
    }
    sortedIndices.push(n - i - 1);
    frames.push({ stepId: ++stepId, activeLine: 0, explanation: `Phần tử ${arr[n-i-1]} cố định tại index ${n-i-1}.`, dataState: [...arr], highlights: defaultHighlights({ sorted: [...sortedIndices] }) });
  }
  sortedIndices.push(0);
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Mảng đã sắp xếp hoàn chỉnh!', dataState: [...arr], highlights: defaultHighlights({ sorted: [...sortedIndices] }) });
  return { algorithmId: 'bubble-sort', pseudoCode, frames };
}

export function generateSelectionSort(inputData: number[]): AlgorithmResult {
  const arr = [...inputData], n = arr.length, frames: FrameDTO[] = [], sortedIndices: number[] = [];
  let stepId = 0;
  const pseudoCode = ['for i from 0 to N-1', '  minIdx = i', '  for j from i+1 to N-1', '    if A[j] < A[minIdx]', '      minIdx = j', '  swap(A[i], A[minIdx])'];
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Bắt đầu Selection Sort.', dataState: [...arr], highlights: defaultHighlights() });
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    frames.push({ stepId: ++stepId, activeLine: 1, explanation: `minIdx = ${i}, giá trị = ${arr[i]}`, dataState: [...arr], highlights: defaultHighlights({ compare: [i], sorted: [...sortedIndices] }) });
    for (let j = i + 1; j < n; j++) {
      frames.push({ stepId: ++stepId, activeLine: 3, explanation: `So sánh A[${j}] (${arr[j]}) với A[${minIdx}] (${arr[minIdx]})`, dataState: [...arr], highlights: defaultHighlights({ compare: [j, minIdx], sorted: [...sortedIndices] }) });
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) { [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]; frames.push({ stepId: ++stepId, activeLine: 5, explanation: `Hoán đổi A[${i}] và A[${minIdx}]`, dataState: [...arr], highlights: defaultHighlights({ swap: [i, minIdx], sorted: [...sortedIndices] }) }); }
    sortedIndices.push(i);
  }
  sortedIndices.push(n - 1);
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Mảng đã sắp xếp hoàn chỉnh!', dataState: [...arr], highlights: defaultHighlights({ sorted: [...sortedIndices] }) });
  return { algorithmId: 'selection-sort', pseudoCode, frames };
}

export function generateInsertionSort(inputData: number[]): AlgorithmResult {
  const arr = [...inputData], n = arr.length, frames: FrameDTO[] = [];
  let stepId = 0;
  const pseudoCode = ['for i from 1 to N-1', '  key = A[i]', '  j = i - 1', '  while j >= 0 and A[j] > key', '    A[j+1] = A[j]; j--', '  A[j+1] = key'];
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Bắt đầu Insertion Sort.', dataState: [...arr], highlights: defaultHighlights({ sorted: [0] }) });
  for (let i = 1; i < n; i++) {
    const key = arr[i]; let j = i - 1;
    frames.push({ stepId: ++stepId, activeLine: 1, explanation: `key = A[${i}] = ${key}`, dataState: [...arr], highlights: defaultHighlights({ compare: [i] }) });
    while (j >= 0 && arr[j] > key) { arr[j+1] = arr[j]; frames.push({ stepId: ++stepId, activeLine: 4, explanation: `Dịch A[${j}] sang phải`, dataState: [...arr], highlights: defaultHighlights({ swap: [j, j+1] }) }); j--; }
    arr[j+1] = key;
    frames.push({ stepId: ++stepId, activeLine: 5, explanation: `Chèn key = ${key} vào vị trí ${j+1}`, dataState: [...arr], highlights: defaultHighlights({ swap: [j+1] }) });
  }
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Mảng đã sắp xếp hoàn chỉnh!', dataState: [...arr], highlights: defaultHighlights({ sorted: Array.from({ length: n }, (_, i) => i) }) });
  return { algorithmId: 'insertion-sort', pseudoCode, frames };
}

export function generateQuickSort(inputData: number[]): AlgorithmResult {
  const arr = [...inputData], frames: FrameDTO[] = [];
  let stepId = 0;
  const pseudoCode = ['quickSort(A, low, high)', '  if low < high', '    pivotIdx = partition(A, low, high)', '    quickSort(A, low, pivotIdx-1)', '    quickSort(A, pivotIdx+1, high)'];
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Bắt đầu Quick Sort.', dataState: [...arr], highlights: defaultHighlights() });
  function partition(low: number, high: number): number {
    const pivot = arr[high]; let i = low - 1;
    frames.push({ stepId: ++stepId, activeLine: 2, explanation: `Pivot = ${pivot} (index ${high})`, dataState: [...arr], highlights: defaultHighlights({ pivot: high }) });
    for (let j = low; j < high; j++) {
      frames.push({ stepId: ++stepId, activeLine: 2, explanation: `So sánh A[${j}] (${arr[j]}) với Pivot (${pivot})`, dataState: [...arr], highlights: defaultHighlights({ compare: [j], pivot: high }) });
      if (arr[j] < pivot) { i++; [arr[i], arr[j]] = [arr[j], arr[i]]; frames.push({ stepId: ++stepId, activeLine: 2, explanation: `Hoán vị A[${i}] và A[${j}]`, dataState: [...arr], highlights: defaultHighlights({ swap: [i, j], pivot: high }) }); }
    }
    [arr[i+1], arr[high]] = [arr[high], arr[i+1]];
    frames.push({ stepId: ++stepId, activeLine: 2, explanation: `Đưa Pivot về vị trí ${i+1}`, dataState: [...arr], highlights: defaultHighlights({ swap: [i+1, high] }) });
    return i + 1;
  }
  function quickSort(low: number, high: number): void { if (low < high) { const p = partition(low, high); quickSort(low, p-1); quickSort(p+1, high); } }
  quickSort(0, arr.length - 1);
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Mảng đã sắp xếp hoàn chỉnh!', dataState: [...arr], highlights: defaultHighlights({ sorted: Array.from({ length: arr.length }, (_, i) => i) }) });
  return { algorithmId: 'quick-sort', pseudoCode, frames };
}

export function generateMergeSort(inputData: number[]): AlgorithmResult {
  const arr = [...inputData], frames: FrameDTO[] = [];
  let stepId = 0;
  const pseudoCode = ['mergeSort(A, left, right)', '  if left < right', '    mid = (left+right)/2', '    mergeSort(A, left, mid)', '    mergeSort(A, mid+1, right)', '    merge(A, left, mid, right)'];
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Bắt đầu Merge Sort.', dataState: [...arr], highlights: defaultHighlights() });
  function merge(left: number, mid: number, right: number): void {
    const L = arr.slice(left, mid+1), R = arr.slice(mid+1, right+1);
    let i = 0, j = 0, k = left;
    while (i < L.length && j < R.length) {
      frames.push({ stepId: ++stepId, activeLine: 5, explanation: `Trộn: so sánh ${L[i]} và ${R[j]}`, dataState: [...arr], highlights: defaultHighlights({ compare: [k] }) });
      if (L[i] <= R[j]) { arr[k] = L[i]; i++; } else { arr[k] = R[j]; j++; }
      frames.push({ stepId: ++stepId, activeLine: 5, explanation: `Đặt ${arr[k]} tại index ${k}`, dataState: [...arr], highlights: defaultHighlights({ swap: [k] }) });
      k++;
    }
    while (i < L.length) { arr[k] = L[i]; i++; k++; }
    while (j < R.length) { arr[k] = R[j]; j++; k++; }
  }
  function mergeSort(left: number, right: number): void {
    if (left < right) { const mid = Math.floor((left+right)/2); frames.push({ stepId: ++stepId, activeLine: 2, explanation: `Chia tại mid = ${mid}`, dataState: [...arr], highlights: defaultHighlights({ compare: [mid] }) }); mergeSort(left, mid); mergeSort(mid+1, right); merge(left, mid, right); }
  }
  mergeSort(0, arr.length - 1);
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Mảng đã sắp xếp hoàn chỉnh!', dataState: [...arr], highlights: defaultHighlights({ sorted: Array.from({ length: arr.length }, (_, i) => i) }) });
  return { algorithmId: 'merge-sort', pseudoCode, frames };
}

export function generateLinearSearch(inputData: number[]): AlgorithmResult {
  const target = inputData[inputData.length - 1], arr = inputData.slice(0, -1), frames: FrameDTO[] = [];
  let stepId = 0;
  const pseudoCode = ['linearSearch(A, target)', '  for i from 0 to N-1', '    if A[i] == target', '      return i', '  return -1'];
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: `Tìm kiếm target = ${target}`, dataState: [...arr], highlights: defaultHighlights() });
  let found = false;
  for (let i = 0; i < arr.length; i++) {
    const dimmed = Array.from({ length: i }, (_, k) => k);
    frames.push({ stepId: ++stepId, activeLine: 2, explanation: `Kiểm tra A[${i}] = ${arr[i]}`, dataState: [...arr], highlights: defaultHighlights({ compare: [i], dimmed }) });
    if (arr[i] === target) { frames.push({ stepId: ++stepId, activeLine: 3, explanation: `Tìm thấy! A[${i}] = ${target}`, dataState: [...arr], highlights: defaultHighlights({ found: i, dimmed }) }); found = true; break; }
  }
  if (!found) frames.push({ stepId: ++stepId, activeLine: 4, explanation: `Không tìm thấy ${target}`, dataState: [...arr], highlights: defaultHighlights({ dimmed: Array.from({ length: arr.length }, (_, i) => i) }) });
  return { algorithmId: 'linear-search', pseudoCode, frames };
}

export function generateBinarySearch(inputData: number[]): AlgorithmResult {
  const target = inputData[inputData.length - 1], arr = inputData.slice(0, -1), frames: FrameDTO[] = [];
  let stepId = 0;
  const pseudoCode = ['binarySearch(A, target)', '  low=0, high=N-1', '  while low <= high', '    mid = (low+high)/2', '    if A[mid]==target: return mid', '    else if A[mid]<target: low=mid+1', '    else: high=mid-1'];
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: `Binary Search target = ${target}`, dataState: [...arr], highlights: defaultHighlights() });
  let low = 0, high = arr.length - 1, found = false;
  while (low <= high) {
    const mid = Math.floor((low+high)/2);
    const dimmed: number[] = [];
    for (let i = 0; i < arr.length; i++) { if (i < low || i > high) dimmed.push(i); }
    frames.push({ stepId: ++stepId, activeLine: 3, explanation: `low=${low}, mid=${mid}, high=${high}. A[mid]=${arr[mid]}`, dataState: [...arr], highlights: defaultHighlights({ compare: [mid], low, mid, high, dimmed }) });
    if (arr[mid] === target) { frames.push({ stepId: ++stepId, activeLine: 4, explanation: `Tìm thấy! A[${mid}] = ${target}`, dataState: [...arr], highlights: defaultHighlights({ found: mid, low, mid, high, dimmed }) }); found = true; break; }
    else if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  if (!found) frames.push({ stepId: ++stepId, activeLine: 6, explanation: `Không tìm thấy ${target}`, dataState: [...arr], highlights: defaultHighlights() });
  return { algorithmId: 'binary-search', pseudoCode, frames };
}
