/**
 * 场景切换记录。
 * @虾老大
 */
export interface SceneTransitionRecord {
  from: string | null;
  to: string;
  timestamp: number;
}

/**
 * 场景管理器配置。
 * @虾老大
 */
export interface SceneManagerOptions {
  initialScene?: string | null;
  maxHistory?: number;
}

/**
 * 场景管理器。
 * 管理当前场景、切换流程与历史记录。
 * @虾老大
 */
export class SceneManager {
  /** 当前场景 ID */
  currentScene: string | null;

  private readonly maxHistory: number;
  private readonly history: string[];
  private readonly transitionLog: SceneTransitionRecord[];

  constructor(options: SceneManagerOptions = {}) {
    this.currentScene = options.initialScene ?? null;
    this.maxHistory = options.maxHistory ?? 50;
    this.history = this.currentScene ? [this.currentScene] : [];
    this.transitionLog = [];
  }

  /**
   * 切换到指定场景。
   * @param sceneId 场景 ID
   */
  transitionTo(sceneId: string): string {
    if (!sceneId.trim()) {
      throw new Error('场景 ID 不能为空');
    }

    const previousScene = this.currentScene;
    this.currentScene = sceneId;
    this.history.push(sceneId);

    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    this.transitionLog.push({
      from: previousScene,
      to: sceneId,
      timestamp: Date.now(),
    });

    if (this.transitionLog.length > this.maxHistory) {
      this.transitionLog.shift();
    }

    return this.currentScene;
  }

  /**
   * 获取场景历史记录。
   * @虾老大
   */
  getHistory(): string[] {
    return [...this.history];
  }

  /**
   * 获取完整切换日志。
   * @虾老大
   */
  getTransitionLog(): SceneTransitionRecord[] {
    return [...this.transitionLog];
  }

  /**
   * 获取上一个场景。
   * @虾老大
   */
  getPreviousScene(): string | null {
    if (this.history.length < 2) {
      return null;
    }

    return this.history[this.history.length - 2] ?? null;
  }

  /**
   * 重置场景管理器。
   * @param sceneId 重置后保留的场景 ID
   */
  reset(sceneId: string | null = null): void {
    this.currentScene = sceneId;
    this.history.length = 0;
    this.transitionLog.length = 0;

    if (sceneId) {
      this.history.push(sceneId);
    }
  }
}
