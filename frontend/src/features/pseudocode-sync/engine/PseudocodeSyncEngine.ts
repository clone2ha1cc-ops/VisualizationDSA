/**
 * PseudocodeSyncEngine — Bộ máy đồng bộ dòng mã giả đa ngôn ngữ.
 * Ánh xạ logicalId sang dòng vật lý, Click-to-Snap reverse lookup,
 * và chuyển đổi biến Frame sang Watch Panel.
 */

import type { CodeLine, LanguageCode, VariableState } from '../types/pseudocode.types';

export interface AnimationFrameForSync {
  frameIndex: number;
  activeLogicalLineId: string;
  variables: Record<string, string | number>;
}

export class PseudocodeSyncEngine {
  /**
   * Ánh xạ logicalId sang dòng vật lý cụ thể của ngôn ngữ hiện tại.
   */
  static getPhysicalLineNumber(
    logicalLineId: string,
    language: string,
    codeLanguages: LanguageCode[],
  ): number | null {
    const matchedLanguage = codeLanguages.find((lang) => lang.language === language);
    if (!matchedLanguage) return null;

    const matchedLine = matchedLanguage.lines.find((line) => line.logicalId === logicalLineId);
    return matchedLine ? matchedLine.lineNumber : null;
  }

  /**
   * Click-to-Snap: Tìm khung hình đầu tiên thực thi dòng logic được click.
   */
  static findFirstFrameIndexForLogicalLine(
    logicalLineId: string,
    frames: AnimationFrameForSync[],
  ): number {
    return frames.findIndex((frame) => frame.activeLogicalLineId === logicalLineId);
  }

  /**
   * Tìm tất cả frame indices thực thi một logicalId (cho Cycle navigation).
   */
  static findAllFrameIndicesForLogicalLine(
    logicalLineId: string,
    frames: AnimationFrameForSync[],
  ): number[] {
    const indices: number[] = [];
    frames.forEach((frame, idx) => {
      if (frame.activeLogicalLineId === logicalLineId) {
        indices.push(idx);
      }
    });
    return indices;
  }

  /**
   * Chuyển đổi Record biến từ Frame sang mảng VariableState cho Watch Panel.
   * Ẩn giá trị undefined/null (Out of Scope).
   */
  static transformVariablesForWatch(
    variables: Record<string, string | number>,
  ): VariableState[] {
    return Object.entries(variables)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([name, value]) => ({
        name,
        value:
          typeof value === 'number' && !Number.isInteger(value)
            ? Number(value.toFixed(2))
            : value,
      }));
  }

  /**
   * Tìm số lần thực thi (occurrence count) của một logicalId trong toàn bộ frames.
   */
  static getOccurrenceCount(
    logicalLineId: string,
    frames: AnimationFrameForSync[],
  ): number {
    return frames.filter((f) => f.activeLogicalLineId === logicalLineId).length;
  }

  /**
   * Cycle navigation: Tìm frame index tiếp theo trong chu kỳ thực thi.
   */
  static getNextCycleFrameIndex(
    logicalLineId: string,
    currentFrameIndex: number,
    frames: AnimationFrameForSync[],
  ): number {
    const allIndices = PseudocodeSyncEngine.findAllFrameIndicesForLogicalLine(logicalLineId, frames);
    if (allIndices.length === 0) return -1;

    const nextIdx = allIndices.find((idx) => idx > currentFrameIndex);
    return nextIdx !== undefined ? nextIdx : allIndices[0];
  }

  /**
   * Tìm CodeLine khớp logicalId trong ngôn ngữ hiện tại.
   */
  static findCodeLineByLogicalId(
    logicalLineId: string,
    lines: CodeLine[],
  ): CodeLine | null {
    return lines.find((line) => line.logicalId === logicalLineId) ?? null;
  }
}
