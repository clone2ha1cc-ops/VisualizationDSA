<template>
  <div class="flex flex-col gap-4">
    <!-- Input Array Section -->
    <div class="flex flex-col gap-2">
      <label class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
        <span>Mảng Số Tự Chọn (Array Input)</span>
        <span class="text-[10px] text-slate-500 font-normal">Tối đa 20 phần tử, cách nhau bằng dấu phẩy</span>
      </label>
      <div class="flex gap-2">
        <input
          type="text"
          :value="arrayInputText"
          @input="$emit('update:arrayInputText', ($event.target as HTMLInputElement).value)"
          placeholder="Ví dụ: 12, 5, 8, 20"
          class="flex-1 bg-[#070b13] border border-slate-700/80 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs font-mono text-white outline-none transition-all"
        />
        <button
          @click="$emit('loadArray')"
          :disabled="!!arrayError"
          class="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold text-xs rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
        >
          <span>Nạp Mảng</span>
        </button>
      </div>
      <div v-if="arrayError" class="text-[11px] font-mono text-rose-400 mt-1 flex items-center gap-1">
        <BaseIcon name="warning" class="w-3.5 h-3.5" />
        {{ arrayError }}
      </div>
      <div
        v-else-if="parsedArray.length > 0"
        class="text-[11px] font-mono text-emerald-400 mt-1 flex items-center gap-1.5"
      >
        <BaseIcon name="success" class="w-3.5 h-3.5" />
        <span>Mảng hợp lệ:</span>
        <span class="bg-[#070b13] px-2 py-0.5 rounded border border-slate-800 text-slate-200">
          [ {{ parsedArray.join(", ") }} ]
        </span>
      </div>
    </div>

    <!-- Divider -->
    <div class="h-px bg-slate-800"></div>

    <!-- Graph Adjacency List Section -->
    <div class="flex flex-col gap-2">
      <label class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
        <span>Đường nối Đồ thị (Adjacency List)</span>
        <span class="text-[10px] text-slate-500 font-normal">Định dạng: Source-Target:Weight</span>
      </label>
      <textarea
        :value="graphInputText"
        @input="$emit('update:graphInputText', ($event.target as HTMLTextAreaElement).value)"
        placeholder="Ví dụ: A-B:10, B-C:20, A-C:50"
        rows="2"
        class="w-full bg-[#070b13] border border-slate-700/80 focus:border-cyan-500 rounded-xl p-3 text-xs font-mono text-white placeholder-slate-600 outline-none transition-all resize-none"
      ></textarea>
      <div v-if="graphError" class="text-[11px] font-mono text-rose-400 mt-1 flex items-center gap-1">
        <BaseIcon name="warning" class="w-3.5 h-3.5" />
        {{ graphError }}
      </div>
      <div v-else-if="parsedGraphNodes.length > 0" class="text-[11px] font-mono text-cyan-400 mt-1 flex items-center gap-1.5">
        <BaseIcon name="success" class="w-3.5 h-3.5 text-cyan-400" />
        <span>Đồ thị hợp lệ: <strong>{{ parsedGraphNodes.length }}</strong> đỉnh, <strong>{{ parsedGraphEdges.length }}</strong> liên kết.</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  arrayInputText: string;
  graphInputText: string;
  arrayError: string | null;
  graphError: string | null;
  parsedArray: number[];
  parsedGraphNodes: any[];
  parsedGraphEdges: any[];
}>();

defineEmits<{
  (e: 'update:arrayInputText', val: string): void;
  (e: 'update:graphInputText', val: string): void;
  (e: 'loadArray'): void;
}>();
</script>
