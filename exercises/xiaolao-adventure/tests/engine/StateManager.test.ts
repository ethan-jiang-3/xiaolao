/**
 * StateManager 单元测试
 * @虾老大
 */

import { StateManager, StorageLike } from '../../src/engine/StateManager';

function createMemoryStorage(initial: Record<string, string> = {}): StorageLike {
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

describe('StateManager', () => {
  test('应该支持 getState/setState', () => {
    const storage = createMemoryStorage();
    const manager = new StateManager({ storageKey: 'test-state', storage });

    manager.setState('player.level', 3);

    expect(manager.getState<number>('player.level')).toBe(3);
  });

  test('应该将状态持久化到存储中', () => {
    const storage = createMemoryStorage();
    const manager = new StateManager({ storageKey: 'persist-state', storage });

    manager.setState('gold', 88);

    const restored = new StateManager({ storageKey: 'persist-state', storage });
    expect(restored.getState<number>('gold')).toBe(88);
  });

  test('应该支持批量更新状态', () => {
    const storage = createMemoryStorage();
    const manager = new StateManager({ storageKey: 'batch-state', storage });

    const snapshot = manager.setStates({ hp: 100, mp: 50, prepared: true });

    expect(snapshot).toEqual({ hp: 100, mp: 50, prepared: true });
    expect(manager.getAllState()).toEqual({ hp: 100, mp: 50, prepared: true });
  });

  test('应该支持替换、删除和清空状态', () => {
    const storage = createMemoryStorage();
    const manager = new StateManager({ storageKey: 'mutate-state', storage });

    manager.setStates({ hp: 100, mp: 50 });
    manager.replaceState({ hp: 1, mode: 'hard' });
    manager.removeState('mode');

    expect(manager.getAllState()).toEqual({ hp: 1 });

    manager.clear();
    expect(manager.getAllState()).toEqual({});
  });

  test('遇到损坏的持久化数据时应该安全回退为空状态', () => {
    const storage = createMemoryStorage({ 'broken-state': '{not-json' });

    const manager = new StateManager({ storageKey: 'broken-state', storage });

    expect(manager.getAllState()).toEqual({});
  });

  test('无存储环境下也应该正常工作', () => {
    const manager = new StateManager({ storageKey: 'memory-only' });

    manager.setState('scene', 'beach');

    expect(manager.getState<string>('scene')).toBe('beach');
  });
});
