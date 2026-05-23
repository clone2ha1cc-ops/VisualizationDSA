/**
 * UnifiedPlaybackCoordinator — Bộ điều phối phát kép đồng bộ.
 * Nhạc trưởng căn chỉnh tốc độ và đồng bộ tiến trình % giữa 2 Canvas con.
 */

export interface SubStoreState {
  currentFrameIndex: number;
  totalFrames: number;
  isPlaying: boolean;
  goToFrame(frameIdx: number): void;
  setPlaySpeed(speed: number): void;
}

export class UnifiedPlaybackCoordinator {
  private leftStore: SubStoreState;
  private rightStore: SubStoreState;

  constructor(leftStore: SubStoreState, rightStore: SubStoreState) {
    this.leftStore = leftStore;
    this.rightStore = rightStore;
  }

  /**
   * Đồng bộ nhảy mốc thời gian chéo theo phần trăm tiến trình chung (0-100).
   */
  public syncProgressByPercent(percent: number): void {
    if (percent < 0 || percent > 100) return;

    const leftTargetFrame = Math.round(
      (percent / 100) * (this.leftStore.totalFrames - 1),
    );
    const rightTargetFrame = Math.round(
      (percent / 100) * (this.rightStore.totalFrames - 1),
    );

    this.leftStore.goToFrame(
      this.clamp(leftTargetFrame, 0, this.leftStore.totalFrames - 1),
    );
    this.rightStore.goToFrame(
      this.clamp(rightTargetFrame, 0, this.rightStore.totalFrames - 1),
    );
  }

  /**
   * Căn chỉnh tốc độ Aligned Speeds: thuật toán dài hơn giữ tốc độ gốc,
   * thuật toán ngắn hơn giảm tốc tương ứng để cả hai cùng kết thúc đồng thời.
   */
  public calculateAlignedSpeeds(globalSpeed: number): {
    leftSpeed: number;
    rightSpeed: number;
  } {
    const leftTotal = this.leftStore.totalFrames;
    const rightTotal = this.rightStore.totalFrames;

    if (leftTotal === 0 || rightTotal === 0) {
      return { leftSpeed: globalSpeed, rightSpeed: globalSpeed };
    }

    if (leftTotal > rightTotal) {
      return {
        leftSpeed: globalSpeed,
        rightSpeed: Number(
          (globalSpeed * (rightTotal / leftTotal)).toFixed(2),
        ),
      };
    } else if (rightTotal > leftTotal) {
      return {
        leftSpeed: Number(
          (globalSpeed * (leftTotal / rightTotal)).toFixed(2),
        ),
        rightSpeed: globalSpeed,
      };
    }

    return { leftSpeed: globalSpeed, rightSpeed: globalSpeed };
  }

  /**
   * Tính toán tiến trình % chung dựa trên trung bình tiến trình 2 bên.
   */
  public getGlobalProgress(): number {
    const leftTotal = this.leftStore.totalFrames;
    const rightTotal = this.rightStore.totalFrames;

    if (leftTotal <= 1 && rightTotal <= 1) return 0;

    const leftPct =
      leftTotal <= 1
        ? 100
        : (this.leftStore.currentFrameIndex / (leftTotal - 1)) * 100;
    const rightPct =
      rightTotal <= 1
        ? 100
        : (this.rightStore.currentFrameIndex / (rightTotal - 1)) * 100;

    return Math.max(leftPct, rightPct);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
