import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import type { LectureScript, Slide } from '../types/lecture.types';

/**
 * useLectureStore — Pinia Store điều phối bài giảng điện tử E-Lecture.
 * Quản lý luồng chuyển Slide, đồng bộ PLAY_UNTIL với Animation Engine,
 * khóa tương tác timeline khi bài giảng đang mở.
 */
export const useLectureStore = defineStore('lecture', () => {
  const animStore = useAnimationStore();

  // ==========================================
  // 1. STATE
  // ==========================================
  const isActive = ref<boolean>(false);
  const currentLecture = ref<LectureScript | null>(null);
  const currentSlideIndex = ref<number>(0);
  const isWaitingForAnimation = ref<boolean>(false);
  const isMinimized = ref<boolean>(false);

  // ==========================================
  // 2. GETTERS
  // ==========================================
  const activeSlide = computed<Slide | null>(() => {
    if (!currentLecture.value || currentSlideIndex.value >= currentLecture.value.slides.length) return null;
    return currentLecture.value.slides[currentSlideIndex.value];
  });

  const isFirstSlide = computed<boolean>(() => currentSlideIndex.value === 0);

  const isLastSlide = computed<boolean>(() => {
    if (!currentLecture.value) return true;
    return currentSlideIndex.value === currentLecture.value.slides.length - 1;
  });

  const totalSlides = computed<number>(() => {
    if (!currentLecture.value) return 0;
    return currentLecture.value.slides.length;
  });

  const slideProgress = computed<string>(() => {
    if (!currentLecture.value) return '0 / 0';
    return `${currentSlideIndex.value + 1} / ${currentLecture.value.slides.length}`;
  });

  // ==========================================
  // 3. ACTIONS
  // ==========================================

  function startLecture(lectureData: LectureScript): void {
    currentLecture.value = lectureData;
    currentSlideIndex.value = 0;
    isActive.value = true;
    isMinimized.value = false;

    animStore.setInteractionLocked(true);

    if (lectureData.slides.length > 0) {
      executeSlideAction(lectureData.slides[0]);
    }
  }

  async function nextSlide(): Promise<void> {
    if (!currentLecture.value || isLastSlide.value) return;

    if (isWaitingForAnimation.value) {
      animStore.cancelPlayUntil();
      isWaitingForAnimation.value = false;
      isMinimized.value = false;
    }

    currentSlideIndex.value++;
    await executeSlideAction(currentLecture.value.slides[currentSlideIndex.value]);
  }

  async function prevSlide(): Promise<void> {
    if (!currentLecture.value || isFirstSlide.value || isWaitingForAnimation.value) return;

    currentSlideIndex.value--;
    await executeSlideAction(currentLecture.value.slides[currentSlideIndex.value]);
  }

  async function goToSlide(index: number): Promise<void> {
    if (!currentLecture.value || isWaitingForAnimation.value) return;
    if (index < 0 || index >= currentLecture.value.slides.length) return;

    currentSlideIndex.value = index;
    await executeSlideAction(currentLecture.value.slides[index]);
  }

  async function executeSlideAction(slide: Slide): Promise<void> {
    const { command, targetFrame } = slide.action;

    switch (command) {
      case 'RESET_CANVAS':
        isMinimized.value = false;
        animStore.goToFrame(targetFrame);
        animStore.pause();
        break;

      case 'PLAY_UNTIL':
        isWaitingForAnimation.value = true;
        isMinimized.value = true;
        await animStore.playUntilFrame(targetFrame);
        isWaitingForAnimation.value = false;
        isMinimized.value = false;
        break;

      case 'PAUSE':
        isMinimized.value = false;
        animStore.pause();
        break;
    }
  }

  function lockLectureInteraction(): void {
    animStore.pause();
    animStore.setInteractionLocked(true);
  }

  function unlockLectureInteraction(): void {
    animStore.setInteractionLocked(false);
  }

  function resumeLecturePlayback(): void {
    animStore.setInteractionLocked(false);
    if (isActive.value && !isLastSlide.value) {
      nextSlide();
    }
  }

  function exitLecture(): void {
    if (isWaitingForAnimation.value) {
      animStore.cancelPlayUntil();
    }

    isActive.value = false;
    currentLecture.value = null;
    currentSlideIndex.value = 0;
    isWaitingForAnimation.value = false;
    isMinimized.value = false;

    animStore.setInteractionLocked(false);
  }

  return {
    isActive,
    currentLecture,
    currentSlideIndex,
    isWaitingForAnimation,
    isMinimized,

    activeSlide,
    isFirstSlide,
    isLastSlide,
    totalSlides,
    slideProgress,

    startLecture,
    nextSlide,
    prevSlide,
    goToSlide,
    exitLecture,
    lockLectureInteraction,
    unlockLectureInteraction,
    resumeLecturePlayback,
  };
});
