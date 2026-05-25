<template>
  <div class="bg-[#070b13] rounded-xl border border-slate-800/60 p-3.5 flex flex-col gap-2.5">
    <div class="text-[11px] font-bold uppercase tracking-widest text-slate-500">
      Các hàm tương tác trực quan:
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
      <div class="flex flex-col gap-0.5 bg-[#090f19] p-2 rounded-lg border border-slate-800/30">
        <span class="text-amber-400 font-bold">compare(i, j)</span>
        <span class="text-slate-400 font-sans text-[11px]">So sánh & nhấp nháy 2 phần tử</span>
      </div>
      <div class="flex flex-col gap-0.5 bg-[#090f19] p-2 rounded-lg border border-slate-800/30">
        <span class="text-rose-400 font-bold">swap(i, j)</span>
        <span class="text-slate-400 font-sans text-[11px]">Hoán vị trí hai phần tử</span>
      </div>
      <div class="flex flex-col gap-0.5 bg-[#090f19] p-2 rounded-lg border border-slate-800/30">
        <span class="text-emerald-400 font-bold">highlight(i)</span>
        <span class="text-slate-400 font-sans text-[11px]">Đánh dấu đã xếp xong</span>
      </div>
    </div>
  </div>
</template>
