import { SceneManager } from './SceneManager';
import { StateManager } from './StateManager';

/**
 * 可替代 localStorage 的存档接口。
 * @虾老大
 */
export interface SaveStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * 存档数据接口。
 * @虾老大
 */
export interface SaveData {
  version: number;
  timestamp: number;
  currentScene: string | null;
  sceneHistory: string[];
  state: Record<string, unknown>;
}

/**
 * 存档管理器配置。
 * @虾老大
 */
export interface SaveManagerOptions {
  storageKey?: string;
  storage?: SaveStorageLike;
}

/**
 * 存档管理器。
 * 负责 JSON 序列化保存与加载。
 * @虾老大
 */
export class SaveManager {
  private readonly stateManager: StateManager;
  private readonly sceneManager: SceneManager;
  private readonly storageKey: string;
  private readonly storage: SaveStorageLike | null;

  constructor(
    stateManager: StateManager,
    sceneManager: SceneManager,
    options: SaveManagerOptions = {},
  ) {
    this.stateManager = stateManager;
    this.sceneManager = sceneManager;
    this.storageKey = options.storageKey ?? 'xiaolao-adventure:save';
    this.storage = options.storage ?? SaveManager.resolveStorage();
  }

  /**
   * 保存当前游戏。
   * @returns JSON 序列化后的存档字符串
   */
  save(): string {
    const serialized = JSON.stringify(this.getSaveData());
    this.storage?.setItem(this.storageKey, serialized);
    return serialized;
  }

  /**
   * 加载存档并恢复当前状态。
   * @虾老大
   */
  load(): SaveData | null {
    const raw = this.storage?.getItem(this.storageKey);
    if (!raw) {
      return null;
    }

    const saveData = JSON.parse(raw) as SaveData;
    return this.applySaveData(saveData);
  }

  /**
   * 获取当前存档数据结构。
   * @虾老大
   */
  getSaveData(): SaveData {
    return {
      version: 1,
      timestamp: Date.now(),
      currentScene: this.sceneManager.currentScene,
      sceneHistory: this.sceneManager.getHistory(),
      state: this.stateManager.getAllState(),
    };
  }

  /**
   * 应用存档数据到当前游戏。
   * @param saveData 存档数据
   */
  applySaveData(saveData: SaveData): SaveData {
    this.stateManager.replaceState(saveData.state);

    if (saveData.sceneHistory.length > 0) {
      this.sceneManager.reset();
      saveData.sceneHistory.forEach(sceneId => {
        this.sceneManager.transitionTo(sceneId);
      });
      return saveData;
    }

    this.sceneManager.reset(saveData.currentScene);
    return saveData;
  }

  /**
   * 解析可用的 localStorage。
   * @虾老大
   */
  private static resolveStorage(): SaveStorageLike | null {
    const runtime = globalThis as typeof globalThis & {
      localStorage?: Partial<SaveStorageLike>;
    };
    const storage = runtime.localStorage;

    if (
      storage &&
      typeof storage.getItem === 'function' &&
      typeof storage.setItem === 'function'
    ) {
      return storage as SaveStorageLike;
    }

    return null;
  }
}
