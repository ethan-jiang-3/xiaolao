/**
 * 可替代 localStorage 的存储接口。
 * @虾老大
 */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * 状态管理器配置。
 * @虾老大
 */
export interface StateManagerOptions {
  storageKey?: string;
  storage?: StorageLike;
}

/**
 * 状态管理器。
 * 负责状态读写与本地持久化。
 * @虾老大
 */
export class StateManager {
  private readonly storageKey: string;
  private readonly storage: StorageLike | null;
  private state: Record<string, unknown>;

  constructor(options: StateManagerOptions = {}) {
    this.storageKey = options.storageKey ?? 'xiaolao-adventure:state';
    this.storage = options.storage ?? StateManager.resolveStorage();
    this.state = {};
    this.hydrate();
  }

  /**
   * 获取状态。
   * @param key 状态键
   */
  getState<T = unknown>(key: string): T | undefined {
    return this.state[key] as T | undefined;
  }

  /**
   * 设置状态并持久化。
   * @param key 状态键
   * @param value 状态值
   */
  setState<T = unknown>(key: string, value: T): T {
    this.state[key] = value;
    this.persist();
    return value;
  }

  /**
   * 批量设置状态。
   * @param partialState 部分状态
   */
  setStates(partialState: Record<string, unknown>): Record<string, unknown> {
    this.state = {
      ...this.state,
      ...partialState,
    };
    this.persist();
    return this.getAllState();
  }

  /**
   * 获取全部状态快照。
   * @虾老大
   */
  getAllState(): Record<string, unknown> {
    return { ...this.state };
  }

  /**
   * 整体替换状态。
   * @param nextState 新状态
   */
  replaceState(nextState: Record<string, unknown>): Record<string, unknown> {
    this.state = { ...nextState };
    this.persist();
    return this.getAllState();
  }

  /**
   * 删除单个状态键。
   * @param key 状态键
   */
  removeState(key: string): void {
    delete this.state[key];
    this.persist();
  }

  /**
   * 清空全部状态。
   * @虾老大
   */
  clear(): void {
    this.state = {};
    this.storage?.removeItem(this.storageKey);
  }

  /**
   * 手动持久化到 localStorage。
   * @虾老大
   */
  persist(): void {
    if (!this.storage) {
      return;
    }

    this.storage.setItem(this.storageKey, JSON.stringify(this.state));
  }

  /**
   * 从 localStorage 还原状态。
   * @虾老大
   */
  hydrate(): Record<string, unknown> {
    if (!this.storage) {
      return this.getAllState();
    }

    const raw = this.storage.getItem(this.storageKey);
    if (!raw) {
      return this.getAllState();
    }

    try {
      this.state = (JSON.parse(raw) as Record<string, unknown>) ?? {};
    } catch {
      this.state = {};
    }

    return this.getAllState();
  }

  /**
   * 解析可用的 localStorage。
   * @虾老大
   */
  private static resolveStorage(): StorageLike | null {
    const runtime = globalThis as typeof globalThis & {
      localStorage?: Partial<StorageLike>;
    };
    const storage = runtime.localStorage;

    if (
      storage &&
      typeof storage.getItem === 'function' &&
      typeof storage.setItem === 'function' &&
      typeof storage.removeItem === 'function'
    ) {
      return storage as StorageLike;
    }

    return null;
  }
}
