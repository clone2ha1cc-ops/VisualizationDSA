import type { AlgorithmResult, HighlightIndices } from '../types/algorithm.types';
import { generateBubbleSort, generateSelectionSort, generateInsertionSort, generateQuickSort, generateMergeSort, generateLinearSearch, generateBinarySearch } from './sortingGenerators';
import { generateStack, generateQueue, generateBST } from './dataStructureGenerators';

function defaultHighlights(overrides?: Partial<HighlightIndices>): HighlightIndices {
  return { compare: [], swap: [], sorted: [], dimmed: [], active: [], ...overrides };
}

const GENERATORS: Record<string, (input: number[]) => AlgorithmResult> = {
  'bubble-sort':    generateBubbleSort,
  'selection-sort': generateSelectionSort,
  'insertion-sort': generateInsertionSort,
  'quick-sort':     generateQuickSort,
  'merge-sort':     generateMergeSort,
  'linear-search':  generateLinearSearch,
  'binary-search':  generateBinarySearch,
  stack:            generateStack,
  queue:            generateQueue,
  bst:              generateBST,
};

export function generateDummyResult(algorithmId: string, inputData: number[]): AlgorithmResult {
  const generator = GENERATORS[algorithmId];
  if (!generator) {
    return {
      algorithmId,
      pseudoCode: ['// Không có mã giả cho thuật toán này'],
      frames: [{ stepId: 1, activeLine: 0, explanation: `Thuật toán '${algorithmId}' chưa có dummy generator.`, dataState: [...inputData], highlights: defaultHighlights() }],
    };
  }
  return generator(inputData);
}
