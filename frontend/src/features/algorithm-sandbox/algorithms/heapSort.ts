import type { SortFrame } from '../types/sorting.types';

/**
 * heapSort.ts — [ALGORITHM] Frame generator cho Heap Sort.
 * Phase 1: Build Max-Heap. Phase 2: Extract-Max liên tiếp.
 */
export function generateHeapSortFrames(inputArray: number[]): SortFrame[] {
  const frames: SortFrame[] = [];
  const arr = [...inputArray];
  const n = arr.length;
  const sortedIndices: number[] = [];
  let step = 0;

  frames.push({
    stepIndex: step++,
    arrayState: [...arr],
    comparingIndices: null,
    pivotIndex: null,
    swappedIndices: null,
    sortedIndices: [],
    description: 'Khởi tạo Heap Sort — Phase 1: xây dựng Max-Heap',
    algorithm: 'heap',
  });

  function heapify(heapSize: number, rootIdx: number): void {
    let largest = rootIdx;
    const left = 2 * rootIdx + 1;
    const right = 2 * rootIdx + 2;

    if (left < heapSize) {
      frames.push({
        stepIndex: step++,
        arrayState: [...arr],
        comparingIndices: [largest, left],
        pivotIndex: rootIdx,
        swappedIndices: null,
        sortedIndices: [...sortedIndices],
        description: `So sánh node[${rootIdx}]=${arr[rootIdx]} với left[${left}]=${arr[left]}`,
        algorithm: 'heap',
      });
      if (arr[left] > arr[largest]) largest = left;
    }

    if (right < heapSize) {
      frames.push({
        stepIndex: step++,
        arrayState: [...arr],
        comparingIndices: [largest, right],
        pivotIndex: rootIdx,
        swappedIndices: null,
        sortedIndices: [...sortedIndices],
        description: `So sánh node[${largest}]=${arr[largest]} với right[${right}]=${arr[right]}`,
        algorithm: 'heap',
      });
      if (arr[right] > arr[largest]) largest = right;
    }

    if (largest !== rootIdx) {
      [arr[rootIdx], arr[largest]] = [arr[largest], arr[rootIdx]];
      frames.push({
        stepIndex: step++,
        arrayState: [...arr],
        comparingIndices: null,
        pivotIndex: rootIdx,
        swappedIndices: [rootIdx, largest],
        sortedIndices: [...sortedIndices],
        description: `Hoán vị arr[${rootIdx}]=${arr[rootIdx]} ↔ arr[${largest}]=${arr[largest]}`,
        algorithm: 'heap',
      });
      heapify(heapSize, largest);
    }
  }

  // Phase 1: Build Max-Heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    frames.push({
      stepIndex: step++,
      arrayState: [...arr],
      comparingIndices: null,
      pivotIndex: i,
      swappedIndices: null,
      sortedIndices: [...sortedIndices],
      description: `Build Max-Heap: Heapify từ node [${i}]`,
      algorithm: 'heap',
    });
    heapify(n, i);
  }

  frames.push({
    stepIndex: step++,
    arrayState: [...arr],
    comparingIndices: null,
    pivotIndex: 0,
    swappedIndices: null,
    sortedIndices: [],
    description: `Max-Heap hoàn thành! Root = ${arr[0]} (phần tử lớn nhất)`,
    algorithm: 'heap',
  });

  // Phase 2: Extract-Max liên tiếp
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    sortedIndices.push(i);

    frames.push({
      stepIndex: step++,
      arrayState: [...arr],
      comparingIndices: null,
      pivotIndex: null,
      swappedIndices: [0, i],
      sortedIndices: [...sortedIndices],
      description: `Đưa max=${arr[i]} về vị trí [${i}] ✓`,
      algorithm: 'heap',
    });

    heapify(i, 0);
  }

  sortedIndices.push(0);
  frames.push({
    stepIndex: step++,
    arrayState: [...arr],
    comparingIndices: null,
    pivotIndex: null,
    swappedIndices: null,
    sortedIndices: arr.map((_, i) => i),
    description: `✅ Heap Sort hoàn thành! Mảng đã được sắp xếp tăng dần.`,
    algorithm: 'heap',
  });

  return frames;
}
