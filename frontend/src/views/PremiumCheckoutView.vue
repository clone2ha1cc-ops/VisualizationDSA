<template>
  <div class="checkout-container flex items-center justify-center min-h-screen px-4 py-8">
    <div class="glass-panel main-card w-full max-w-4xl overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0 relative">
      <!-- Decorative background glows -->
      <div class="absolute -top-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
      <div class="absolute -bottom-40 -right-40 w-80 h-80 bg-rose-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

      <!-- Left Column: Marketing / Pricing -->
      <PremiumMarketingCard />

      <!-- Right Column: Interactive payment handler -->
      <div class="col-span-12 md:col-span-7 p-8 flex flex-col justify-center min-h-[480px]">
        <!-- Screen 1: Idle -->
        <CheckoutIdleScreen
          v-if="state === 'idle'"
          :is-loading="isLoading"
          :error="error"
          @start="initiatePayment"
        />

        <!-- Screen 2: QR Payment -->
        <QrPaymentPanel
          v-else-if="state === 'paying'"
          :order="order"
          :formattedTime="formattedTime"
          :isExpired="isExpired"
          :isWarningTime="isWarningTime"
          @retry="initiatePayment"
        />

        <!-- Screen 3: Success -->
        <CheckoutSuccessScreen v-else-if="state === 'success'" @finish="finishCheckout" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../features/auth/store/useAuthStore';
import * as paymentApi from '../features/payment/services/paymentApi';
import type { OrderDto } from '../features/payment/services/paymentApi';
import PremiumMarketingCard from '../features/payment/components/PremiumMarketingCard.vue';
import QrPaymentPanel from '../features/payment/components/QrPaymentPanel.vue';
import CheckoutIdleScreen from '../features/payment/components/CheckoutIdleScreen.vue';
import CheckoutSuccessScreen from '../features/payment/components/CheckoutSuccessScreen.vue';
import { usePaymentTimer } from '../features/payment/composables/usePaymentTimer';
import { usePaymentPolling } from '../features/payment/composables/usePaymentPolling';

type CheckoutState = 'idle' | 'paying' | 'success';

const router    = useRouter();
const authStore = useAuthStore();
const state     = ref<CheckoutState>('idle');
const isLoading = ref(false);
const error     = ref<string | null>(null);
const order     = ref<OrderDto | null>(null);

const { isExpired, isWarningTime, formattedTime, startTimer, stopTimer } = usePaymentTimer(900);
const { startPolling, stopPolling } = usePaymentPolling();

async function initiatePayment(): Promise<void> {
  const token = authStore.getAccessToken();
  if (!token) { error.value = 'Bạn cần đăng nhập để thực hiện giao dịch.'; return; }
  isLoading.value = true;
  error.value = null;
  try {
    const res = await paymentApi.createOrder(token);
    order.value  = res;
    state.value  = 'paying';
    startTimer(900);
    startPolling(res.id, token, () => {
      stopTimer();
      if (authStore.currentUser) authStore.currentUser.isPremium = true;
      state.value = 'success';
    });
  } catch (err: any) {
    error.value = err instanceof Error ? err.message : 'Không thể khởi tạo hóa đơn.';
  } finally {
    isLoading.value = false;
  }
}

function finishCheckout(): void { router.push('/sorting'); }

onUnmounted(() => { stopTimer(); stopPolling(); });
</script>

<style scoped>
.checkout-container { background: radial-gradient(circle at center, #0e1726 0%, #070b13 100%); min-height: 100vh; }
.main-card { border-color: var(--border-color); box-shadow: 0 0 50px -15px rgba(6,182,212,0.15); }
</style>
