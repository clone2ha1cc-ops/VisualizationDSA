import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Algorithm, AlgorithmMetadata } from '../types/algorithm.types';
import { ALGORITHM_CATALOG } from '../services/algorithmCatalog';
import { LOCAL_METADATA } from './algorithmLocalMetadata';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5050';

export const useAlgorithmStore = defineStore('algorithm', () => {
  const algorithms = ref<Algorithm[]>([]);
  const currentAlgorithm = ref<Algorithm | null>(null);
  const metadata = ref<AlgorithmMetadata | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string>('');
  const searchQuery = ref<string>('');

  const filteredAlgorithms = computed<Algorithm[]>(() => {
    if (!searchQuery.value.trim()) return algorithms.value;
    const q = searchQuery.value.toLowerCase();
    return algorithms.value.filter(
      (a) => a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q),
    );
  });

  const categories = computed<string[]>(() => {
    const cats = new Set(algorithms.value.map((a) => a.category));
    return Array.from(cats);
  });

  async function fetchAlgorithms(): Promise<void> {
    isLoading.value = true;
    error.value = '';
    try {
      const response = await fetch(`${API_BASE}/api/v1/algorithms`);
      if (!response.ok) throw new Error('Không thể tải danh sách thuật toán từ máy chủ.');
      algorithms.value = await response.json();
    } catch {
      algorithms.value = ALGORITHM_CATALOG;
    } finally {
      isLoading.value = false;
    }
  }

  async function loadAlgorithmDetails(algoId: string): Promise<void> {
    isLoading.value = true;
    error.value = '';
    const matched = algorithms.value.find((a) => a.id === algoId);
    if (matched) currentAlgorithm.value = matched;
    try {
      const response = await fetch(`${API_BASE}/api/v1/algorithms/${algoId}/metadata`);
      if (!response.ok) throw new Error('Không thể tải siêu dữ liệu chi tiết của giải thuật.');
      metadata.value = await response.json();
    } catch {
      metadata.value = LOCAL_METADATA[algoId] ?? null;
    } finally {
      isLoading.value = false;
    }
  }

  function selectAlgorithm(algo: Algorithm): void {
    currentAlgorithm.value = algo;
    metadata.value = LOCAL_METADATA[algo.id] ?? null;
  }

  function clearActive(): void {
    currentAlgorithm.value = null;
    metadata.value = null;
    error.value = '';
  }

  function setSearchQuery(query: string): void {
    searchQuery.value = query;
  }

  return {
    algorithms, currentAlgorithm, metadata, isLoading, error, searchQuery,
    filteredAlgorithms, categories,
    fetchAlgorithms, loadAlgorithmDetails, selectAlgorithm, clearActive, setSearchQuery,
  };
});
