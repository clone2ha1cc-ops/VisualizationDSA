import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useInputStore } from '../store/useInputStore';
import type { GenerationType } from '../store/useInputStore';

export function useCustomInputForm() {
  const inputStore = useInputStore();
  const showDropdown = ref(false);
  const dropdownRef = ref<HTMLElement | null>(null);

  const generationOptions: { type: GenerationType; label: string }[] = [
    { type: 'random',        label: 'Ngẫu nhiên hoàn toàn (Random 100%)' },
    { type: 'nearly-sorted', label: 'Gần như đã sắp xếp (Nearly Sorted)' },
    { type: 'reversed',      label: 'Đảo ngược hoàn toàn (Reversed 100%)' },
  ];

  const formState = computed<'empty' | 'valid' | 'format-error' | 'limit-error'>(() => {
    if (inputStore.rawText.trim() === '') return 'empty';
    if (!inputStore.isValidFormat) return 'format-error';
    if (!inputStore.isWithinLimit) return 'limit-error';
    return 'valid';
  });

  const textareaClasses = computed(() => {
    const base = 'bg-[#070b13] border';
    switch (formState.value) {
      case 'valid':         return `${base} border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]`;
      case 'format-error':  return `${base} border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]`;
      case 'limit-error':   return `${base} border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]`;
      default: return `${base} border-slate-700`;
    }
  });

  const counterClasses = computed(() =>
    !inputStore.isWithinLimit ? 'text-amber-400 font-bold' : 'text-slate-500'
  );

  const statusText = computed<string>(() => {
    const map: Record<string, string> = { valid: 'Hợp lệ', 'format-error': 'Lỗi cú pháp', 'limit-error': 'Vượt giới hạn' };
    return map[formState.value] ?? '';
  });

  const statusClasses = computed(() => {
    const map: Record<string, string> = { valid: 'text-emerald-400', 'format-error': 'text-red-400', 'limit-error': 'text-amber-400' };
    return map[formState.value] ?? 'text-slate-500';
  });

  const errorText = computed<string>(() => {
    if (formState.value === 'format-error') return 'Lỗi: Chỉ cho phép số nguyên cách nhau bằng dấu phẩy.';
    if (formState.value === 'limit-error') return `Cảnh báo: Kích thước mảng vượt quá giới hạn an toàn (Tối đa ${inputStore.maxLimit} phần tử).`;
    return '';
  });

  const executeButtonClasses = computed(() =>
    !inputStore.canExecute
      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
      : 'bg-cyan-600 text-white hover:bg-cyan-500 active:scale-95 cursor-pointer'
  );

  function onGenerate(type: GenerationType): void {
    inputStore.generateRandomInput(type, 10);
    showDropdown.value = false;
  }

  function onExecute(): void {
    inputStore.submitCustomInput('bubble-sort');
  }

  function onKeydown(e: KeyboardEvent): void {
    if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); if (inputStore.canExecute) onExecute(); }
    if (e.ctrlKey && e.shiftKey && (e.key === 'R' || e.key === 'r')) { e.preventDefault(); inputStore.generateRandomInput('random', 10); }
    if (e.key === 'Escape') { e.preventDefault(); inputStore.clear(); }
  }

  function onClickOutside(e: MouseEvent): void {
    if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) showDropdown.value = false;
  }

  onMounted(() => document.addEventListener('click', onClickOutside));
  onBeforeUnmount(() => document.removeEventListener('click', onClickOutside));

  return {
    inputStore, showDropdown, dropdownRef, generationOptions,
    formState, textareaClasses, counterClasses, statusText, statusClasses, errorText, executeButtonClasses,
    onGenerate, onExecute, onKeydown,
  };
}
