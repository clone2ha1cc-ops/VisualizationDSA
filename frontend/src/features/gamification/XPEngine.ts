/**
 * XPEngine - Gamification Reward Engine & Level Progression
 *
 * Sprint 12: Gamification Rewards & Embed Widget Generator
 * - XP accumulation from quiz completion
 * - Level progression with badges
 * - Embed widget code generation
 */

export interface UserProgress {
  userId: string;
  totalXP: number;
  currentLevel: number;
  xpInCurrentLevel: number;
  xpToNextLevel: number;
  badges: Badge[];
  completedModules: string[];
  streakDays: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: number;
}

export interface LevelConfig {
  level: number;
  name: string;
  xpRequired: number;
  color: string;
}

export interface XPEvent {
  type: 'QUIZ_COMPLETE' | 'MODULE_FINISH' | 'STREAK_BONUS' | 'ACHIEVEMENT';
  xpAmount: number;
  description: string;
  timestamp: number;
}

export interface EmbedConfig {
  widgetType: 'array-visualizer' | 'sorting-algo' | 'graph-playground' | 'oop-sandbox';
  width: number;
  height: number;
  theme: 'dark' | 'light';
  autoPlay: boolean;
  showControls: boolean;
}

export class XPEngine {
  private static readonly LEVELS: LevelConfig[] = [
    { level: 1, name: 'Novice', xpRequired: 0, color: '#64748b' },
    { level: 2, name: 'Explorer', xpRequired: 100, color: '#22c55e' },
    { level: 3, name: 'Learner', xpRequired: 300, color: '#3b82f6' },
    { level: 4, name: 'Practitioner', xpRequired: 600, color: '#8b5cf6' },
    { level: 5, name: 'Expert', xpRequired: 1000, color: '#f59e0b' },
    { level: 6, name: 'Master', xpRequired: 1500, color: '#ef4444' },
    { level: 7, name: 'Grandmaster', xpRequired: 2200, color: '#ec4899' },
    { level: 8, name: 'Legend', xpRequired: 3000, color: '#f97316' },
  ];

  private static readonly BADGE_DEFINITIONS: Omit<Badge, 'earnedAt'>[] = [
    { id: 'first-steps', name: 'First Steps', description: 'Hoàn thành bài trắc nghiệm đầu tiên', icon: '🎯', color: '#22c55e' },
    { id: 'sorting-wizard', name: 'Sorting Wizard', description: 'Hoàn thành 4 thuật toán sắp xếp', icon: '⚡', color: '#3b82f6' },
    { id: 'oop-guru', name: 'OOP Guru', description: 'Hiểu rõ Encapsulation & Inheritance', icon: '🔐', color: '#8b5cf6' },
    { id: 'solid-master', name: 'SOLID Master', description: 'Áp dụng đúng 5 nguyên lý SOLID', icon: '🏛️', color: '#f59e0b' },
    { id: 'pattern-hunter', name: 'Pattern Hunter', description: 'Sử dụng 3 Design Patterns', icon: '🎨', color: '#ec4899' },
    { id: 'streak-keeper', name: 'Streak Keeper', description: 'Học liên tục 7 ngày', icon: '🔥', color: '#ef4444' },
    { id: 'system-architect', name: 'System Architect', description: 'Thiết kế hệ thống phân tán', icon: '🏗️', color: '#f97316' },
    { id: 'dsa-champion', name: 'DSA Champion', description: 'Hoàn thành toàn bộ khóa học', icon: '👑', color: '#eab308' },
  ];

  private userProgress: UserProgress;
  private xpHistory: XPEvent[] = [];
  private onLevelUpCallback?: (newLevel: number) => void;
  private onBadgeEarnedCallback?: (badge: Badge) => void;

  constructor(
    userId: string = 'guest',
    onLevelUp?: (newLevel: number) => void,
    onBadgeEarned?: (badge: Badge) => void
  ) {
    this.userProgress = this.createInitialProgress(userId);
    this.onLevelUpCallback = onLevelUp;
    this.onBadgeEarnedCallback = onBadgeEarned;
  }

  /**
   * Create initial progress for new user
   */
  private createInitialProgress(userId: string): UserProgress {
    return {
      userId,
      totalXP: 0,
      currentLevel: 1,
      xpInCurrentLevel: 0,
      xpToNextLevel: 100,
      badges: [],
      completedModules: [],
      streakDays: 1,
    };
  }

  /**
   * Award XP for completing an activity
   */
  public awardXP(event: Omit<XPEvent, 'timestamp'>): { leveledUp: boolean; newBadges: Badge[] } {
    const timestamp = Date.now();
    const fullEvent: XPEvent = { ...event, timestamp };

    this.xpHistory.push(fullEvent);

    // Add XP
    this.userProgress.totalXP += event.xpAmount;
    this.userProgress.xpInCurrentLevel += event.xpAmount;

    // Check for level up
    let leveledUp = false;
    while (this.checkLevelUp()) {
      leveledUp = true;
    }

    // Check for new badges
    const newBadges = this.checkNewBadges();

    return { leveledUp, newBadges };
  }

  /**
   * Check if user should level up
   */
  private checkLevelUp(): boolean {
    const nextLevel = XPEngine.LEVELS.find((l) => l.level === this.userProgress.currentLevel + 1);
    if (!nextLevel) return false;

    if (this.userProgress.xpInCurrentLevel >= nextLevel.xpRequired) {
      this.userProgress.currentLevel++;
      this.userProgress.xpInCurrentLevel = 0;
      this.userProgress.xpToNextLevel = XPEngine.LEVELS.find(
        (l) => l.level === this.userProgress.currentLevel + 1
      )?.xpRequired || Infinity;

      this.onLevelUpCallback?.(this.userProgress.currentLevel);
      return true;
    }
    return false;
  }

  /**
   * Check and award new badges
   */
  private checkNewBadges(): Badge[] {
    const newBadges: Badge[] = [];

    for (const badgeDef of XPEngine.BADGE_DEFINITIONS) {
      if (this.userProgress.badges.find((b) => b.id === badgeDef.id)) continue;

      if (this.shouldAwardBadge(badgeDef.id)) {
        const badge: Badge = {
          ...badgeDef,
          earnedAt: Date.now(),
        };
        this.userProgress.badges.push(badge);
        newBadges.push(badge);
        this.onBadgeEarnedCallback?.(badge);
      }
    }

    return newBadges;
  }

  /**
   * Determine if badge should be awarded based on criteria
   */
  private shouldAwardBadge(badgeId: string): boolean {
    switch (badgeId) {
      case 'first-steps':
        return this.xpHistory.filter((e) => e.type === 'QUIZ_COMPLETE').length >= 1;
      case 'sorting-wizard':
        return this.userProgress.completedModules.includes('bubble-sort') &&
               this.userProgress.completedModules.includes('quick-sort') &&
               this.userProgress.completedModules.includes('merge-sort') &&
               this.userProgress.completedModules.includes('heap-sort');
      case 'oop-guru':
        return this.userProgress.completedModules.includes('oop-encapsulation') &&
               this.userProgress.completedModules.includes('oop-inheritance');
      case 'solid-master':
        return this.userProgress.completedModules.filter((m) => m.startsWith('solid-')).length >= 5;
      case 'pattern-hunter':
        return this.userProgress.completedModules.filter((m) => m.startsWith('pattern-')).length >= 3;
      case 'streak-keeper':
        return this.userProgress.streakDays >= 7;
      case 'system-architect':
        return this.userProgress.completedModules.includes('load-balancer');
      case 'dsa-champion':
        return this.userProgress.currentLevel >= 5;
      default:
        return false;
    }
  }

  /**
   * Mark module as completed
   */
  public completeModule(moduleId: string): void {
    if (!this.userProgress.completedModules.includes(moduleId)) {
      this.userProgress.completedModules.push(moduleId);
    }
  }

  /**
   * Get current progress
   */
  public getProgress(): UserProgress {
    return { ...this.userProgress };
  }

  /**
   * Get level info
   */
  public getCurrentLevelInfo(): LevelConfig {
    return (
      XPEngine.LEVELS.find((l) => l.level === this.userProgress.currentLevel) ||
      XPEngine.LEVELS[XPEngine.LEVELS.length - 1]
    );
  }

  /**
   * Get XP history
   */
  public getXPHistory(): XPEvent[] {
    return [...this.xpHistory];
  }

  /**
   * Get all available badges
   */
  public static getAllBadges(): Omit<Badge, 'earnedAt'>[] {
    return [...this.BADGE_DEFINITIONS];
  }

  /**
   * Get all levels
   */
  public static getAllLevels(): LevelConfig[] {
    return [...this.LEVELS];
  }

  /**
   * Generate embed code for widget
   */
  public static generateEmbedCode(config: EmbedConfig): string {
    const { widgetType, width, height, theme, autoPlay, showControls } = config;

    const params = new URLSearchParams({
      type: widgetType,
      theme,
      autoPlay: autoPlay.toString(),
      controls: showControls.toString(),
    });

    const baseUrl = 'https://visualization-dsa.example.com/embed';

    return `<iframe
  src="${baseUrl}?${params.toString()}"
  width="${width}"
  height="${height}"
  frameborder="0"
  allowfullscreen
  style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
  title="DSA Visualization"
></iframe>`;
  }

  /**
   * Calculate progress percentage in current level
   */
  public getLevelProgressPercent(): number {
    const currentLevelInfo = this.getCurrentLevelInfo();
    const nextLevelInfo = XPEngine.LEVELS.find(
      (l) => l.level === this.userProgress.currentLevel + 1
    );

    if (!nextLevelInfo) return 100;

    const xpNeeded = nextLevelInfo.xpRequired - currentLevelInfo.xpRequired;
    const xpProgress = this.userProgress.xpInCurrentLevel;

    return Math.min(100, Math.round((xpProgress / xpNeeded) * 100));
  }

  /**
   * Get stats summary
   */
  public getStats(): {
    totalXP: number;
    level: number;
    badgesEarned: number;
    modulesCompleted: number;
    quizzesTaken: number;
    currentStreak: number;
  } {
    return {
      totalXP: this.userProgress.totalXP,
      level: this.userProgress.currentLevel,
      badgesEarned: this.userProgress.badges.length,
      modulesCompleted: this.userProgress.completedModules.length,
      quizzesTaken: this.xpHistory.filter((e) => e.type === 'QUIZ_COMPLETE').length,
      currentStreak: this.userProgress.streakDays,
    };
  }
}

export default XPEngine;
