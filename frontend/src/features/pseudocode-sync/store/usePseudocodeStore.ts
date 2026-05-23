/**
 * usePseudocodeStore — Pinia Setup Store quản lý đồng bộ mã giả đa ngôn ngữ.
 * Lắng nghe useAnimationStore.activeFrame để tính toán dòng highlight
 * và danh sách biến Watch Panel theo thời gian thực.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import { PseudocodeSyncEngine } from '../engine/PseudocodeSyncEngine';
import type {
  SupportedLanguage,
  CodeLine,
  LanguageCode,
  VariableState,
} from '../types/pseudocode.types';

export const usePseudocodeStore = defineStore('pseudocode', () => {
  const animStore = useAnimationStore();

  // ==========================================
  // STATE
  // ==========================================

  const selectedLanguage = ref<SupportedLanguage>('cpp');
  const codeLanguages = ref<LanguageCode[]>([]);

  // ==========================================
  // GETTERS
  // ==========================================

  const activeCodeLines = computed<CodeLine[]>(() => {
    const matched = codeLanguages.value.find(
      (l) => l.language === selectedLanguage.value,
    );
    return matched ? matched.lines : [];
  });

  const availableLanguages = computed<SupportedLanguage[]>(() => {
    return codeLanguages.value.map((l) => l.language);
  });

  const activePhysicalLineNumber = computed<number | null>(() => {
    const frame = animStore.activeFrame;
    if (!frame || !frame.activeLogicalLineId) return null;

    const matchedLine = activeCodeLines.value.find(
      (l) => l.logicalId === frame.activeLogicalLineId,
    );
    return matchedLine ? matchedLine.lineNumber : null;
  });

  const activeLogicalLineId = computed<string | null>(() => {
    const frame = animStore.activeFrame;
    return frame?.activeLogicalLineId ?? null;
  });

  const watchVariablesList = computed<VariableState[]>(() => {
    const frame = animStore.activeFrame;
    if (!frame || !frame.variables) return [];
    return PseudocodeSyncEngine.transformVariablesForWatch(frame.variables);
  });

  const isScriptLoaded = computed<boolean>(() => {
    return codeLanguages.value.length > 0;
  });

  // ==========================================
  // ACTIONS
  // ==========================================

  function changeLanguage(newLang: SupportedLanguage): void {
    selectedLanguage.value = newLang;
  }

  function cycleLanguage(): void {
    const langs = availableLanguages.value;
    if (langs.length === 0) return;
    const currentIdx = langs.indexOf(selectedLanguage.value);
    const nextIdx = (currentIdx + 1) % langs.length;
    selectedLanguage.value = langs[nextIdx];
  }

  function loadPseudocodeScript(languages: LanguageCode[]): void {
    codeLanguages.value = languages;
    if (languages.length > 0 && !languages.find((l) => l.language === selectedLanguage.value)) {
      selectedLanguage.value = languages[0].language;
    }
  }

  function snapToLogicalLine(logicalId: string): void {
    const frames = animStore.frames;
    const syncFrames = frames.map((f, idx) => ({
      frameIndex: idx,
      activeLogicalLineId: f.activeLogicalLineId ?? '',
      variables: f.variables ?? {},
    }));

    const targetIdx = PseudocodeSyncEngine.findFirstFrameIndexForLogicalLine(
      logicalId,
      syncFrames,
    );

    if (targetIdx !== -1) {
      animStore.goToFrame(targetIdx);
      animStore.pause();
    }
  }

  function snapToNextOccurrence(logicalId: string): void {
    const frames = animStore.frames;
    const syncFrames = frames.map((f, idx) => ({
      frameIndex: idx,
      activeLogicalLineId: f.activeLogicalLineId ?? '',
      variables: f.variables ?? {},
    }));

    const nextIdx = PseudocodeSyncEngine.getNextCycleFrameIndex(
      logicalId,
      animStore.currentIndex,
      syncFrames,
    );

    if (nextIdx !== -1) {
      animStore.goToFrame(nextIdx);
      animStore.pause();
    }
  }

  function getOccurrenceInfo(logicalId: string): { current: number; total: number } {
    const frames = animStore.frames;
    const syncFrames = frames.map((f, idx) => ({
      frameIndex: idx,
      activeLogicalLineId: f.activeLogicalLineId ?? '',
      variables: f.variables ?? {},
    }));

    const allIndices = PseudocodeSyncEngine.findAllFrameIndicesForLogicalLine(logicalId, syncFrames);
    const total = allIndices.length;
    if (total === 0) return { current: 0, total: 0 };

    const currentFrameIdx = animStore.currentIndex;
    const currentOccurrence = allIndices.findIndex((idx) => idx >= currentFrameIdx);
    return {
      current: currentOccurrence !== -1 ? currentOccurrence + 1 : total,
      total,
    };
  }

  function resetStore(): void {
    selectedLanguage.value = 'cpp';
    codeLanguages.value = [];
  }

  return {
    selectedLanguage,
    codeLanguages,
    activeCodeLines,
    availableLanguages,
    activePhysicalLineNumber,
    activeLogicalLineId,
    watchVariablesList,
    isScriptLoaded,
    changeLanguage,
    cycleLanguage,
    loadPseudocodeScript,
    snapToLogicalLine,
    snapToNextOccurrence,
    getOccurrenceInfo,
    resetStore,
  };
});
