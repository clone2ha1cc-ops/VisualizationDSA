<template>
  <div class="summary-actions">
    <button class="retry-btn" @click="$emit('retry')">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
      <span>Làm lại</span>
    </button>
    <button class="close-btn" @click="$emit('close')">
      <span>Đóng</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ retry: []; close: [] }>();
</script>

<style scoped>
.summary-actions { display: flex; justify-content: center; gap: 10px; }
.retry-btn { display: flex; align-items: center; gap: 6px; padding: 10px 20px; background: rgba(6, 182, 212, 0.12); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 12px; color: #67e8f9; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.retry-btn:hover { background: rgba(6, 182, 212, 0.2); border-color: rgba(6, 182, 212, 0.5); }
.close-btn { padding: 10px 20px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; color: #94a3b8; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.close-btn:hover { background: rgba(255, 255, 255, 0.1); color: #e2e8f0; }
</style>
