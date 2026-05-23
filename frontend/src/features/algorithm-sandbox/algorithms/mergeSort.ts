import type { SortFrame } from '../types/sorting.types';

/**
 * mergeSort.ts — [ALGORITHM] Frame generator cho Merge Sort (top-down).
 * Highlight các vùng đang merge với màu Purple.
 */
export function generateMergeSortFrames(inputArray: number[]): SortFrame[] {
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
    description: 'Khởi tạo Merge Sort — chia đôi mảng đệ quy rồi gộp lại',
    algorithm: 'merge',
  });

  function merge(left: number, mid: number, right: number): void {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;

    while (i < leftArr.length && j < rightArr.length) {
      frames.push({
        stepIndex: step++,
        arrayState: [...arr],
        comparingIndices: [left + i, mid + 1 + j],
        pivotIndex: mid, // dùng pivotIndex để highlight điểm chia
        swappedIndices: null,
        sortedIndices: [...sortedIndices],
        description: `So sánh L[${i}]=${leftArr[i]} với R[${j}]=${rightArr[j]}`,
        algorithm: 'merge',
      });

      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        i++;
      } else {
        arr[k] = rightArr[j];
        j++;
      }

      frames.push({
        stepIndex: step++,
        arrayState: [...arr],
        comparingIndices: null,
        pivotIndex: mid,
        swappedIndices: [k, k], // đánh dấu vị trí vừa ghi
        sortedIndices: [...sortedIndices],
        description: `Ghi arr[${k}] = ${arr[k]} vào đúng thứ tự`,
        algorithm: 'merge',
      });
      k++;
    }

    // Copy phần còn lại
    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      frames.push({
        stepIndex: step++,
        arrayState: [...arr],
        comparingIndices: null,
        pivotIndex: mid,
        swappedIndices: null,
        sortedIndices: [...sortedIndices],
        description: `Copy phần tử còn lại L[${i}]=${leftArr[i]} → arr[${k}]`,
        algorithm: 'merge',
      });
      i++; k++;
    }
    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      frames.push({
        stepIndex: step++,
        arrayState: [...arr],
        comparingIndices: null,
        pivotIndex: mid,
        swappedIndices: null,
        sortedIndices: [...sortedIndices],
        description: `Copy phần tử còn lại R[${j}]=${rightArr[j]} → arr[${k}]`,
        algorithm: 'merge',
      });
      j++; k++;
    }

    // Đánh dấu vùng [left..right] đã merge xong
    for (let x = left; x <= right; x++) {
      if (!sortedIndices.includes(x)) sortedIndices.push(x);
    }
  }

  function mergeSort(left: number, right: number): void {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);

    frames.push({
      stepIndex: step++,
      arrayState: [...arr],
      comparingIndices: null,
      pivotIndex: mid,
      swappedIndices: null,
      sortedIndices: [...sortedIndices],
      description: `Chia: arr[${left}..${right}] → [${left}..${mid}] + [${mid + 1}..${right}]`,
      algorithm: 'merge',
    });

    mergeSort(left, mid);
    mergeSort(mid + 1, right);
    merge(left, mid, right);
  }

  mergeSort(0, arr.length - 1);

  frames.push({
    stepIndex: step++,
    arrayState: [...arr],
    comparingIndices: null,
    pivotIndex: null,
    swappedIndices: null,
    sortedIndices: arr.map((_, i) => i),
    description: `✅ Merge Sort hoàn thành! Mảng đã được sắp xếp tăng dần.`,
    algorithm: 'merge',
  });

  return frames;
}
