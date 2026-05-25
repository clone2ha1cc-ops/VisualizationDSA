import { watch, type WatchStopHandle } from 'vue';
import { MonacoGutterClickInterceptor } from './MonacoGutterClickInterceptor';
import { PseudocodeSyncer } from './PseudocodeSyncer';

export class MonacoLineSyncerCoordinator {
  private editorInstance: any = null;
  private vcrStore: any = null;
  private clickInterceptor: MonacoGutterClickInterceptor | null = null;
  private previousDecorations: string[] = [];
  private stopWatch: WatchStopHandle | null = null;

  constructor(editor: any, vcrStore: any) {
    this.editorInstance = editor;
    this.vcrStore = vcrStore;
    this.setupSyncing();
  }

  private setupSyncing(): void {
    if (!this.editorInstance || !this.vcrStore) return;

    // 1. Setup Click-to-Snap (Reverse Sync)
    this.clickInterceptor = new MonacoGutterClickInterceptor(
      this.editorInstance,
      (lineNum) => {
        // Tìm frame đầu tiên tương ứng với dòng code này
        const targetFrameIndex = this.vcrStore.playbackFrames.findIndex(
          (f: any) => f.lineNumber === lineNum
        );
        if (targetFrameIndex !== -1) {
          this.vcrStore.jumpToFrame(targetFrameIndex);
        }
      }
    );

    // 2. Setup Active Line Highlighting (Forward Sync)
    this.stopWatch = watch(
      () => this.vcrStore.currentLineNumber,
      (newLineNum) => {
        this.syncLineToEditor(newLineNum);
      },
      { immediate: true }
    );
  }

  public syncLineToEditor(lineNumber: number): void {
    if (!this.editorInstance) return;

    if (lineNumber > 0) {
      this.previousDecorations = PseudocodeSyncer.highlightMonacoLine(
        this.editorInstance,
        lineNumber,
        this.previousDecorations
      );
    } else if (this.previousDecorations.length > 0) {
      this.previousDecorations = this.editorInstance.deltaDecorations(
        this.previousDecorations,
        []
      );
    }
  }

  public destroy(): void {
    if (this.stopWatch) {
      this.stopWatch();
      this.stopWatch = null;
    }
    if (this.clickInterceptor) {
      this.clickInterceptor.destroy();
      this.clickInterceptor = null;
    }
    if (this.editorInstance && this.previousDecorations.length > 0) {
      this.editorInstance.deltaDecorations(this.previousDecorations, []);
      this.previousDecorations = [];
    }
    this.editorInstance = null;
    this.vcrStore = null;
  }
}
