import type { AlgorithmMetadata } from '../types/algorithm.types';

export const LOCAL_METADATA: Record<string, AlgorithmMetadata> = {
  'bubble-sort': {
    timeComplexity: 'O(N²)',
    spaceComplexity: 'O(1)',
    description:
      'Bubble Sort so sánh hai phần tử liền kề và hoán đổi nếu chúng không đúng thứ tự. Lặp lại cho đến khi mảng được sắp xếp hoàn toàn.',
    pseudoCode: [
      'for i from 0 to N-1',
      '  for j from 0 to N-i-2',
      '    if A[j] > A[j+1]',
      '      swap(A[j], A[j+1])',
    ],
  },
  'selection-sort': {
    timeComplexity: 'O(N²)',
    spaceComplexity: 'O(1)',
    description:
      'Selection Sort tìm phần tử nhỏ nhất trong phần chưa sắp xếp và hoán đổi với phần tử đầu tiên của phần chưa sắp xếp.',
    pseudoCode: [
      'for i from 0 to N-1',
      '  minIdx = i',
      '  for j from i+1 to N-1',
      '    if A[j] < A[minIdx]',
      '      minIdx = j',
      '  swap(A[i], A[minIdx])',
    ],
  },
  'insertion-sort': {
    timeComplexity: 'O(N²)',
    spaceComplexity: 'O(1)',
    description:
      'Insertion Sort chèn từng phần tử vào đúng vị trí trong phần đã sắp xếp, giống cách sắp xếp bài trên tay.',
    pseudoCode: [
      'for i from 1 to N-1',
      '  key = A[i]',
      '  j = i - 1',
      '  while j >= 0 and A[j] > key',
      '    A[j+1] = A[j]; j--',
      '  A[j+1] = key',
    ],
  },
  'quick-sort': {
    timeComplexity: 'O(N log N)',
    spaceComplexity: 'O(log N)',
    description:
      'Quick Sort chọn phần tử chốt (Pivot) và phân hoạch mảng thành hai nửa, sau đó đệ quy sắp xếp từng nửa.',
    pseudoCode: [
      'quickSort(A, low, high)',
      '  if low < high',
      '    pivotIdx = partition(A, low, high)',
      '    quickSort(A, low, pivotIdx - 1)',
      '    quickSort(A, pivotIdx + 1, high)',
    ],
  },
  'merge-sort': {
    timeComplexity: 'O(N log N)',
    spaceComplexity: 'O(N)',
    description:
      'Merge Sort chia mảng thành hai nửa đệ quy và trộn các nửa đã sắp xếp lại với nhau.',
    pseudoCode: [
      'mergeSort(A, left, right)',
      '  if left < right',
      '    mid = (left + right) / 2',
      '    mergeSort(A, left, mid)',
      '    mergeSort(A, mid+1, right)',
      '    merge(A, left, mid, right)',
    ],
  },
  'linear-search': {
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    description:
      'Linear Search duyệt tuần tự từng phần tử trong mảng từ đầu đến cuối để tìm giá trị mục tiêu.',
    pseudoCode: [
      'linearSearch(A, target)',
      '  for i from 0 to N-1',
      '    if A[i] == target',
      '      return i',
      '  return -1',
    ],
  },
  'binary-search': {
    timeComplexity: 'O(log N)',
    spaceComplexity: 'O(1)',
    description:
      'Binary Search chia đôi phạm vi tìm kiếm bằng cách so sánh giá trị giữa với target. Yêu cầu mảng đã sắp xếp.',
    pseudoCode: [
      'binarySearch(A, target)',
      '  low = 0, high = N-1',
      '  while low <= high',
      '    mid = (low + high) / 2',
      '    if A[mid] == target: return mid',
      '    else if A[mid] < target: low = mid + 1',
      '    else: high = mid - 1',
    ],
  },
  stack: {
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(N)',
    description:
      'Ngăn xếp (Stack) hoạt động theo nguyên tắc LIFO — Vào sau ra trước. Push đẩy vào đỉnh, Pop lấy ở đỉnh ra.',
    pseudoCode: [
      'stack = []',
      'push(value):',
      '  stack.append(value)',
      'pop():',
      '  return stack.removeLast()',
    ],
  },
  queue: {
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(N)',
    description:
      'Hàng đợi (Queue) hoạt động theo nguyên tắc FIFO — Vào trước ra trước. Enqueue thêm vào cuối, Dequeue lấy ở đầu.',
    pseudoCode: [
      'queue = []',
      'enqueue(value):',
      '  queue.append(value)',
      'dequeue():',
      '  return queue.removeFirst()',
    ],
  },
  bst: {
    timeComplexity: 'O(log N)',
    spaceComplexity: 'O(N)',
    description:
      'Cây tìm kiếm nhị phân (BST) lưu trữ dữ liệu sao cho node trái nhỏ hơn, node phải lớn hơn node cha.',
    pseudoCode: [
      'insert(root, value):',
      '  if root is null: return new Node(value)',
      '  if value < root.value:',
      '    root.left = insert(root.left, value)',
      '  else:',
      '    root.right = insert(root.right, value)',
      '  return root',
    ],
  },
};
