import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { useAuthStore } from './features/auth/store/useAuthStore'
import { useUserProgressStore } from './features/user-progress/store/useUserProgressStore'

import BaseIcon from './shared/components/BaseIcon.vue'

const app  = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.component('BaseIcon', BaseIcon)

// ── Khởi động auth & progress TRƯỚC khi mount ──────────────────────────────
// Thứ tự quan trọng: auth trước → progress sau (progress cần access token)
const authStore     = useAuthStore()
const progressStore = useUserProgressStore()

authStore.init().then(() => {
  return progressStore.initFromServer()
}).finally(() => {
  app.mount('#app')
})
