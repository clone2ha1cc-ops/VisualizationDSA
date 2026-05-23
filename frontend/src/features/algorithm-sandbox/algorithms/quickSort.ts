import type { SortFrame } from '../types/sorting.types';

/**
 * quickSort.ts — [ALGORITHM] Frame generator cho Quick Sort (Lomuto partition).
 * Highlight Pivot bằng màu Amber, partitioning bằng màu Cyan.
 */
export function generateQuickSortFrames(inputArray: number[]): SortFrame[] {
  const frames: SortFrame[] = [];
  const arr = [...inputArray];
  const sortedIndices: number[] = [];
  let step = 0;

  frames.push({
    stepIndex: step++,
    arrayState: [...arr],
    comparingIndices: null,
    pivotIndex: null,
    swappedIndices: null,
    sortedIndices: [],
    description: 'Khởi tạo Quick Sort — chọn Pivot từ phần tử cuối mỗi partition',
    algorithm: 'quick',
  });

  function partition(low: number, high: number): number {
    const pivot = arr[high];

    frames.push({
      stepIndex: step++,
      arrayState: [...arr],
      comparingIndices: null,
      pivotIndex: high,
      swappedIndices: null,
      sortedIndices: [...sortedIndices],
      description: `Chọn Pivot = ${pivot} tại chỉ số [${high}]`,
      algorithm: 'quick',
    });

    let i = low - 1;

    for (let j = low; j < high; j++) {
      frames.push({
        stepIndex: step++,
        arrayState: [...arr],
        comparingIndices: [j, high],
        pivotIndex: high,
        swappedIndices: null,
        sortedIndices: [...sortedIndices],
        description: `So sánh arr[${j}]=${arr[j]} với Pivot=${pivot}`,
        algorithm: 'quick',
      });

      if (arr[j] <= pivot) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          frames.push({
            stepIndex: step++,
            arrayState: [...arr],
            comparingIndices: null,
            pivotIndex: high,
            swappedIndices: [i, j],
            sortedIndices: [...sortedIndices],
            description: `arr[${j}]=${arr[j]} ≤ Pivot → Hoán vị arr[${i}]↔arr[${j}]`,
            algorithm: 'quick',
          });
        }
      }
    }

    // Đặt Pivot về đúng vị trí
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    const pivotFinalIdx = i + 1;

    frames.push({
      stepIndex: step++,
      arrayState: [...arr],
      comparingIndices: null,
      pivotIndex: pivotFinalIdx,
      swappedIndices: [i + 1, high],
      sortedIndices: [...sortedIndices],
      description: `Pivot ${pivot} về đúng vị trí [${pivotFinalIdx}] ✓`,
      algorithm: 'quick',
    });

    sortedIndices.push(pivotFinalIdx);
    return pivotFinalIdx;
  }

  function quickSort(low: number, high: number): void {
    if (low < high) {
      const pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    } else if (low === high) {
      // Partition đơn lẻ — cũng đã đứng đúng chỗ
      if (!sortedIndices.includes(low)) {
        sortedIndices.push(low);
      }
    }
  }

  quickSort(0, arr.length - 1);

  // Frame hoàn thành
  frames.push({
    stepIndex: step++,
    arrayState: [...arr],
    comparingIndices: null,
    pivotIndex: null,
    swappedIndices: null,
    sortedIndices: arr.map((_, i) => i),
    description: `✅ Quick Sort hoàn thành! Mảng đã được sắp xếp tăng dần.`,
    algorithm: 'quick',
  });

  return frames;
}
