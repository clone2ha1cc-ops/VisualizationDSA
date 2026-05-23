<template>
  <div class="flex flex-col h-full w-full gap-3 p-4 bg-slate-900/80 overflow-auto">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2.5" class="text-amber-500">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
      <span class="text-xs font-bold uppercase tracking-wider text-slate-300">Custom Input</span>
    </div>

    <!-- TextArea -->
    <div class="flex flex-col gap-1.5">
      <label class="text-[11px] text-slate-400">
        Nhập mảng số nguyên (cách nhau bằng dấu phẩy):
      </label>
      <textarea
        v-model="inputStore.rawText"
        :readonly="inputStore.isLoading"
        :placeholder="'Ví dụ: 14, 25, 38, 9, 4'"
        rows="3"
        class="w-full rounded-lg px-3 py-2 text-sm font-mono text-white placeholder-slate-600 outline-none resize-none transition-all duration-200"
        :class="textareaClasses"
        @keydown="onKeydown"
      ></textarea>

      <!-- Status Bar -->
      <div class="flex items-center justify-between text-[11px]">
        <span :class="counterClasses">
          {{ inputStore.elementCount }} / {{ inputStore.maxLimit }} phần tử
        </span>
        <span v-if="statusText" :class="statusClasses">{{ statusText }}</span>
      </div>

      <!-- Error Message -->
      <div v-if="errorText" class="text-[11px] font-mono text-rose-400">
        {{ errorText }}
      </div>
      <div v-if="inputStore.apiErrorMessage" class="text-[11px] font-mono text-rose-400">
        {{ inputStore.apiErrorMessage }}
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center gap-2 flex-wrap">
      <!-- Random Generate Dropdown -->
      <div class="relative" ref="dropdownRef">
        <button
          class="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-colors flex items-center gap-1.5"
          @click="showDropdown = !showDropdown"
        >
          <span class="text-base leading-none">&#x1F3B2;</span>
          <span>Sinh Ngẫu Nhiên</span>
          <svg class="w-3 h-3 transition-transform" :class="{ 'rotate-180': showDropdown }"
            viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Dropdown Menu -->
        <Transition name="dropdown">
          <div
            v-if="showDropdown"
            class="absolute left-0 top-full mt-1 w-52 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden"
          >
            <button
              v-for="opt in generationOptions"
              :key="opt.type"
              class="w-full text-left px-3 py-2 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              @click="onGenerate(opt.type)"
            >
              {{ opt.label }}
            </button>
          </div>
        </Transition>
      </div>

      <!-- Clear -->
      <button
        class="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
        @click="inputStore.clear()"
      >
        Xóa Trắng
      </button>

      <!-- Execute -->
      <button
        :disabled="!inputStore.canExecute"
        class="ml-auto px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5"
        :class="executeButtonClasses"
        @click="onExecute"
      >
        <svg v-if="inputStore.isLoading" class="w-3 h-3 animate-spin" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="3">
          <circle cx="12" cy="12" r="10" class="opacity-25" />
          <path d="M4 12a8 8 0 018-8" class="opacity-75" />
        </svg>
        <span v-else class="text-base leading-none">&#x26A1;</span>
        <span>{{ inputStore.isLoading ? 'Đang xử lý...' : 'Chạy Trực Quan' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useInputStore } from '../store/useInputStore';
import type { GenerationType } from '../store/useInputStore';

const inputStore = useInputStore();
const showDropdown = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const generationOptions: { type: GenerationType; label: string }[] = [
  { type: 'random', label: 'Ngẫu nhiên hoàn toàn (Random 100%)' },
  { type: 'nearly-sorted', label: 'Gần như đã sắp xếp (Nearly Sorted)' },
  { type: 'reversed', label: 'Đảo ngược hoàn toàn (Reversed 100%)' },
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
    case 'valid':
      return `${base} border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]`;
    case 'format-error':
      return `${base} border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]`;
    case 'limit-error':
      return `${base} border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]`;
    default:
      return `${base} border-slate-700`;
  }
});

const counterClasses = computed(() => {
  if (!inputStore.isWithinLimit) return 'text-amber-400 font-bold';
  return 'text-slate-500';
});

const statusText = computed<string>(() => {
  switch (formState.value) {
    case 'valid': return 'Hợp lệ';
    case 'format-error': return 'Lỗi cú pháp';
    case 'limit-error': return 'Vượt giới hạn';
    default: return '';
  }
});

const statusClasses = computed(() => {
  switch (formState.value) {
    case 'valid': return 'text-emerald-400';
    case 'format-error': return 'text-red-400';
    case 'limit-error': return 'text-amber-400';
    default: return 'text-slate-500';
  }
});

const errorText = computed<string>(() => {
  switch (formState.value) {
    case 'format-error':
      return 'Lỗi: Chỉ cho phép số nguyên cách nhau bằng dấu phẩy.';
    case 'limit-error':
      return `Cảnh báo: Kích thước mảng vượt quá giới hạn an toàn (Tối đa ${inputStore.maxLimit} phần tử).`;
    default:
      return '';
  }
});

const executeButtonClasses = computed(() => {
  if (!inputStore.canExecute) {
    return 'bg-slate-700 text-slate-500 cursor-not-allowed';
  }
  return 'bg-cyan-600 text-white hover:bg-cyan-500 active:scale-95 cursor-pointer';
});

function onGenerate(type: GenerationType): void {
  inputStore.generateRandomInput(type, 10);
  showDropdown.value = false;
}

function onExecute(): void {
  inputStore.submitCustomInput('bubble-sort');
}

function onKeydown(e: KeyboardEvent): void {
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    if (inputStore.canExecute) {
      onExecute();
    }
  }
  if (e.ctrlKey && e.shiftKey && (e.key === 'R' || e.key === 'r')) {
    e.preventDefault();
    inputStore.generateRandomInput('random', 10);
  }
  if (e.key === 'Escape') {
    e.preventDefault();
    inputStore.clear();
  }
}

function onClickOutside(e: MouseEvent): void {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    showDropdown.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside);
});
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
