export class MonacoGutterClickInterceptor {
  private editorInstance: any = null;
  private onLineClickCallback: (lineNumber: number) => void;
  private mouseDownListener: { dispose(): void } | null = null;

  constructor(editor: any, onLineClick: (lineNumber: number) => void) {
    this.editorInstance = editor;
    this.onLineClickCallback = onLineClick;
    this.setupListeners();
  }

  private setupListeners(): void {
    if (!this.editorInstance) return;

    // Lắng nghe sự kiện click chuột trên Monaco Editor
    this.mouseDownListener = this.editorInstance.onMouseDown((e: any) => {
      // e.target.type: 3 = Gutter (Lề trái số dòng), 4 = Gutter Margin
      if (e.target.type === 3 || e.target.type === 4) {
        const lineNumber = e.target.position?.lineNumber;
        if (lineNumber !== undefined) {
          this.onLineClickCallback(lineNumber);
        }
      }
    });
  }

  public destroy(): void {
    if (this.mouseDownListener) {
      this.mouseDownListener.dispose();
      this.mouseDownListener = null;
    }
    this.editorInstance = null;
  }
}
