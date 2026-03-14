/**
 * SaveManager 单元测试
 * @虾老大
 */

import { SaveManager, SaveStorageLike } from '../../src/engine/SaveManager';
import { SceneManager } from '../../src/engine/SceneManager';
import { StateManager, StorageLike } from '../../src/engine/StateManager';

function createMemoryStorage(initial: Record<string, string> = {}): SaveStorageLike & StorageLike {
  const data = new Map<string, string>(Object.entries(initial));

  return {
    getItem(key: string): string | null {
      return data.has(key) ? data.get(key)! : null;
    },
    setItem(key: string, value: string): void {
      data.set(key, value);
    },
    removeItem(key: string): void {
      data.delete(key);
    },
  };
}

describe('SaveManager', () => {
  test('应该能够保存并加载游戏', () => {
    const storage = createMemoryStorage();
    const stateManager = new StateManager({ storageKey: 'state', storage });
    const sceneManager = new SceneManager();
    const saveManager = new SaveManager(stateManager, sceneManager, {
      storageKey: 'save',
      storage,
    });

    sceneManager.transitionTo('village');
    stateManager.setStates({ level: 5, gold: 120 });
    saveManager.save();

    sceneManager.transitionTo('cave');
    stateManager.setState('gold', 1);

    const loaded = saveManager.load();

    expect(loaded).not.toBeNull();
    expect(sceneManager.currentScene).toBe('village');
    expect(sceneManager.getHistory()).toEqual(['village']);
    expect(stateManager.getAllState()).toEqual({ level: 5, gold: 120 });
  });

  test('save() 应该返回合法的 JSON 序列化结果', () => {
    const storage = createMemoryStorage();
    const stateManager = new StateManager({ storageKey: 'state-json', storage });
    const sceneManager = new SceneManager({ initialScene: 'beach' });
    const saveManager = new SaveManager(stateManager, sceneManager, {
      storageKey: 'save-json',
      storage,
    });

    stateManager.setState('prepared', true);
    const serialized = saveManager.save();
    const parsed = JSON.parse(serialized);

    expect(parsed.version).toBe(1);
    expect(parsed.currentScene).toBe('beach');
    expect(parsed.state.prepared).toBe(true);
  });

  test('无存档时 load() 应返回 null', () => {
    const storage = createMemoryStorage();
    const saveManager = new SaveManager(
      new StateManager({ storageKey: 'state-empty', storage }),
      new SceneManager(),
      { storageKey: 'save-empty', storage },
    );

    expect(saveManager.load()).toBeNull();
  });

  test('损坏的 JSON 存档应抛出错误', () => {
    const storage = createMemoryStorage({ 'save-broken': '{bad-json' });
    const saveManager = new SaveManager(
      new StateManager({ storageKey: 'state-broken', storage }),
      new SceneManager(),
      { storageKey: 'save-broken', storage },
    );

    expect(() => saveManager.load()).toThrow();
  });

  test('应该支持应用没有历史记录的存档', () => {
    const storage = createMemoryStorage();
    const stateManager = new StateManager({ storageKey: 'state-apply', storage });
    const sceneManager = new SceneManager();
    const saveManager = new SaveManager(stateManager, sceneManager, {
      storageKey: 'save-apply',
      storage,
    });

    saveManager.applySaveData({
      version: 1,
      timestamp: Date.now(),
      currentScene: 'harbor',
      sceneHistory: [],
      state: { hp: 77 },
    });

    expect(sceneManager.currentScene).toBe('harbor');
    expect(stateManager.getAllState()).toEqual({ hp: 77 });
  });
});
