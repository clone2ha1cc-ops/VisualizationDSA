<template>
  <div class="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
    <!-- QR Code Left -->
    <div class="sm:col-span-5 flex flex-col items-center">
      <div class="qr-wrapper p-2 bg-white rounded-lg shadow-lg relative border border-slate-200">
        <img :src="order?.qrUrl" alt="VietQR Pay Code" class="w-40 h-40 object-contain" />
        <!-- Status Overlay if timeout -->
        <div v-if="isExpired" class="absolute inset-0 bg-slate-950/90 rounded-lg flex flex-col items-center justify-center p-2 text-center">
          <BaseIcon name="clock" class="w-6 h-6 text-rose-400 mb-2" />
          <span class="text-xs font-semibold text-rose-400">Mã hết hạn</span>
          <button @click="$emit('retry')" class="mt-2 text-[10px] px-2 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-500 transition">Thử lại</button>
        </div>
      </div>
      
      <div class="mt-3 text-center">
        <div class="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Thời gian còn lại</div>
        <div class="text-sm font-bold font-mono" :class="isWarningTime ? 'text-rose-400 animate-pulse' : 'text-cyan-400'">
          {{ formattedTime }}
        </div>
      </div>
    </div>

    <!-- Instructions Right -->
    <div class="sm:col-span-7 space-y-4">
      <div class="text-xs font-semibold uppercase tracking-wider text-cyan-400">Hướng dẫn chuyển khoản</div>
      
      <div class="space-y-2 text-xs bg-slate-900/50 p-4 rounded-[var(--radius-lg)] border border-[var(--border-color)]">
        <div class="flex justify-between">
          <span class="text-[var(--text-muted)]">Ngân hàng:</span>
          <span class="font-bold text-[var(--text-primary)]">{{ order?.bankId }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-[var(--text-muted)]">Số tài khoản:</span>
          <span class="font-bold text-[var(--text-primary)] font-mono">{{ order?.bankAccount }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-[var(--text-muted)]">Chủ tài khoản:</span>
          <span class="font-bold text-[var(--text-primary)]">{{ order?.accountName }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-[var(--text-muted)]">Số tiền:</span>
          <span class="font-bold text-[var(--color-gold)] font-mono">{{ formatCurrency(order?.amount ?? 0) }}</span>
        </div>
        
        <div class="border-t border-[var(--border-color)] pt-3 mt-3">
          <div class="text-[10px] text-[var(--text-muted)] uppercase mb-1 font-semibold">Nội dung chuyển khoản chính xác:</div>
          <div class="flex items-center justify-between gap-2 bg-slate-950 p-2 rounded border border-amber-500/30">
            <span class="font-mono text-sm font-extrabold text-[var(--color-gold)] tracking-wider">{{ order?.paymentCode }}</span>
            <button @click="copyCode" class="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-cyan-400 active:scale-95 transition">
              {{ isCopied ? 'Đã copy' : 'Copy' }}
            </button>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-[var(--radius-md)]">
        <BaseIcon name="refresh" class="animate-spin w-4 h-4 text-emerald-400" />
        <p class="text-[10px] text-[var(--text-secondary)] leading-relaxed">
          Hệ thống đang kiểm tra tự động giao dịch. Tài khoản của bạn sẽ tự mở khóa ngay khi ngân hàng nhận tiền.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface OrderInfo {
  qrUrl: string;
  bankId: string;
  bankAccount: string;
  accountName: string;
  amount: number;
  paymentCode: string;
}

const props = defineProps<{
  order: OrderInfo | null;
  formattedTime: string;
  isExpired: boolean;
  isWarningTime: boolean; // vd: timerSeconds < 60
}>();

defineEmits<{
  (e: 'retry'): void;
}>();

const isCopied = ref(false);

function copyCode() {
  if (!props.order) return;
  navigator.clipboard.writeText(props.order.paymentCode);
  isCopied.value = true;
  setTimeout(() => {
    isCopied.value = false;
  }, 2000);
}

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
}
</script>

<style scoped>
.qr-wrapper {
  background: white;
  padding: 8px;
  border-radius: var(--radius-lg);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.05);
}
</style>
