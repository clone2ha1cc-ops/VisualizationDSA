import { describe, it, expect } from 'vitest';
import { generateBubbleSortFrames } from '../algorithms/bubbleSort';
import { generateQuickSortFrames } from '../algorithms/quickSort';
import { generateMergeSortFrames } from '../algorithms/mergeSort';
import { generateHeapSortFrames } from '../algorithms/heapSort';

describe('Sprint 2: Sorting Algorithm Frame Generators', () => {
  const testArray = [5, 3, 8, 4, 2];

  describe('Bubble Sort Frame Generator', () => {
    it('should generate valid frames from input array', () => {
      const frames = generateBubbleSortFrames(testArray);
      expect(frames.length).toBeGreaterThan(0);
      
      // Khởi tạo
      expect(frames[0].arrayState).toEqual(testArray);
      expect(frames[0].algorithm).toBe('bubble');
      
      // Hoàn thành
      const finalFrame = frames[frames.length - 1];
      expect(finalFrame.arrayState).toEqual([2, 3, 4, 5, 8]);
      expect(finalFrame.sortedIndices.length).toBe(testArray.length);
    });
  });

  describe('Quick Sort Frame Generator', () => {
    it('should generate partition steps and highlight pivot correctly', () => {
      const frames = generateQuickSortFrames(testArray);
      expect(frames.length).toBeGreaterThan(0);
      
      // Check pivot highlighting in partition
      const partitionFrames = frames.filter(f => f.pivotIndex !== null);
      expect(partitionFrames.length).toBeGreaterThan(0);
      
      const finalFrame = frames[frames.length - 1];
      expect(finalFrame.arrayState).toEqual([2, 3, 4, 5, 8]);
    });
  });

  describe('Merge Sort Frame Generator', () => {
    it('should generate divide and conquer frames and end with sorted array', () => {
      const frames = generateMergeSortFrames(testArray);
      expect(frames.length).toBeGreaterThan(0);
      
      const finalFrame = frames[frames.length - 1];
      expect(finalFrame.arrayState).toEqual([2, 3, 4, 5, 8]);
    });
  });

  describe('Heap Sort Frame Generator', () => {
    it('should build max heap and extract elements iteratively to sort', () => {
      const frames = generateHeapSortFrames(testArray);
      expect(frames.length).toBeGreaterThan(0);
      
      const finalFrame = frames[frames.length - 1];
      expect(finalFrame.arrayState).toEqual([2, 3, 4, 5, 8]);
    });
  });
});
