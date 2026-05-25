<template>
  <Transition name="lecture-fade">
    <div v-if="lectureStore.isActive" class="lecture-backdrop" :class="{ 'backdrop-dimmed': !lectureStore.isMinimized }">
      <div class="lecture-panel" :class="{ 'panel-minimized': lectureStore.isMinimized, 'panel-visible': !lectureStore.isMinimized }">
        <!-- Header -->
        <div class="panel-header">
          <div class="header-left">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="header-icon">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M6 6h10" /><path d="M6 10h10" />
            </svg>
            <span class="header-title">E-Lecture</span>
            <span class="slide-counter">{{ lectureStore.slideProgress }}</span>
          </div>
          <button class="close-btn" @click="lectureStore.exitLecture()" title="Thoát bài giảng (Esc)">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <!-- Lecture Title -->
        <div v-if="lectureStore.currentLecture" class="lecture-title-row">
          <h2 class="lecture-title">{{ lectureStore.currentLecture.title }}</h2>
        </div>

        <!-- Slide Content -->
        <div v-if="activeSlide" class="slide-content-area">
          <div class="slide-badge" :class="slideBadgeClass">{{ slideBadgeText }}</div>
          <div class="slide-html-content" v-html="activeSlide.content" />
        </div>

        <!-- Waiting Indicator -->
        <div v-if="lectureStore.isWaitingForAnimation" class="waiting-indicator">
          <div class="spinner" />
          <span class="waiting-text">Đang phát hoạt ảnh minh họa...</span>
        </div>

        <!-- Navigation -->
        <LectureNavigation
          :slides="lectureStore.currentLecture?.slides ?? []"
          :current-slide-index="lectureStore.currentSlideIndex"
          :is-first-slide="lectureStore.isFirstSlide"
          :is-last-slide="lectureStore.isLastSlide"
          :is-waiting="lectureStore.isWaitingForAnimation"
          @prev="lectureStore.prevSlide()"
          @next="lectureStore.nextSlide()"
          @exit="lectureStore.exitLecture()"
          @go-to="lectureStore.goToSlide"
        />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useLectureStore } from '../store/useLectureStore';
import LectureNavigation from './LectureNavigation.vue';

const lectureStore = useLectureStore();
const activeSlide  = computed(() => lectureStore.activeSlide);

const slideBadgeClass = computed(() => {
  if (!activeSlide.value) return '';
  return { theory: 'badge-theory', 'guided-animation': 'badge-animation', 'interactive-check': 'badge-interactive' }[activeSlide.value.type] ?? '';
});

const slideBadgeText = computed(() => {
  if (!activeSlide.value) return '';
  return { theory: 'Lý thuyết', 'guided-animation': 'Hoạt họa dẫn dắt', 'interactive-check': 'Điểm kiểm tra' }[activeSlide.value.type] ?? '';
});

function handleKeydown(e: KeyboardEvent): void {
  if (!lectureStore.isActive) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); lectureStore.nextSlide(); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); lectureStore.prevSlide(); }
  else if (e.key === 'Escape') { e.preventDefault(); lectureStore.exitLecture(); }
}

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<style scoped>
.lecture-backdrop { position: absolute; inset: 0; z-index: 900; transition: background-color .4s cubic-bezier(.25,.8,.25,1); }
.backdrop-dimmed { background: rgba(15,23,42,.4); }
.lecture-panel { position: absolute; top: 10%; left: 5%; width: 380px; min-height: 250px; padding: 20px; background: rgba(30,41,59,.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,.1); border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,.3), 0 10px 10px -5px rgba(0,0,0,.2); z-index: 1000; display: flex; flex-direction: column; gap: 14px; transition: all .4s cubic-bezier(.25,.8,.25,1); }
.panel-visible   { opacity: 1; transform: scale(1) translate(0,0); pointer-events: auto; }
.panel-minimized { opacity: .15; transform: scale(.88) translate(-20px,0); pointer-events: none; }
.panel-header { display: flex; align-items: center; justify-content: space-between; }
.header-left  { display: flex; align-items: center; gap: 8px; }
.header-icon  { color: #06b6d4; width: 16px; height: 16px; }
.header-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: #06b6d4; }
.slide-counter { font-size: 11px; font-weight: 600; color: #94a3b8; background: rgba(15,23,42,.6); border: 1px solid #1e293b; padding: 2px 8px; border-radius: 6px; }
.close-btn { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; border: 1px solid #334155; background: rgba(15,23,42,.6); color: #94a3b8; cursor: pointer; transition: all .15s; }
.close-btn:hover { background: #334155; color: #f1f5f9; border-color: #475569; }
.lecture-title-row { padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,.06); }
.lecture-title { font-size: 15px; font-weight: 700; color: #f1f5f9; line-height: 1.4; margin: 0; }
.slide-content-area { display: flex; flex-direction: column; gap: 10px; flex: 1; }
.slide-badge { display: inline-flex; align-self: flex-start; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; padding: 3px 10px; border-radius: 6px; }
.badge-theory      { background: rgba(99,102,241,.15); border: 1px solid rgba(99,102,241,.3); color: #a5b4fc; }
.badge-animation   { background: rgba(6,182,212,.15);  border: 1px solid rgba(6,182,212,.3);  color: #67e8f9; }
.badge-interactive { background: rgba(16,185,129,.15); border: 1px solid rgba(16,185,129,.3); color: #6ee7b7; }
.slide-html-content { font-size: 13px; color: #cbd5e1; line-height: 1.65; }
.slide-html-content :deep(h3) { font-size: 15px; font-weight: 700; color: #f1f5f9; margin: 0 0 6px; }
.slide-html-content :deep(p)  { margin: 0 0 8px; }
.slide-html-content :deep(b)  { color: #e2e8f0; font-weight: 600; }
.slide-html-content :deep(em) { color: #94a3b8; font-style: italic; }
.slide-html-content :deep(ul) { margin: 4px 0 8px; padding-left: 18px; }
.slide-html-content :deep(li) { margin-bottom: 4px; }
.waiting-indicator { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(6,182,212,.08); border: 1px solid rgba(6,182,212,.2); border-radius: 10px; }
.spinner { width: 16px; height: 16px; border: 2px solid rgba(6,182,212,.3); border-top-color: #06b6d4; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.waiting-text { font-size: 12px; color: #67e8f9; font-weight: 500; }
.lecture-fade-enter-active, .lecture-fade-leave-active { transition: opacity .35s ease; }
.lecture-fade-enter-active .lecture-panel, .lecture-fade-leave-active .lecture-panel { transition: transform .35s cubic-bezier(.25,.8,.25,1), opacity .35s ease; }
.lecture-fade-enter-from { opacity: 0; }
.lecture-fade-enter-from .lecture-panel, .lecture-fade-leave-to .lecture-panel { opacity: 0; transform: scale(.9) translateY(20px); }
.lecture-fade-leave-to { opacity: 0; }
</style>
