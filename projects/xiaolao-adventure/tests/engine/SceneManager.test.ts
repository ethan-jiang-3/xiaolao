/**
 * SceneManager 单元测试
 * @虾老大
 */

import { SceneManager } from '../../src/engine/SceneManager';

describe('SceneManager', () => {
  test('应该正确切换场景', () => {
    const manager = new SceneManager();

    const currentScene = manager.transitionTo('village');

    expect(currentScene).toBe('village');
    expect(manager.currentScene).toBe('village');
    expect(manager.getTransitionLog()).toHaveLength(1);
  });

  test('应该记录场景历史和上一场景', () => {
    const manager = new SceneManager({ initialScene: 'beach' });
    manager.transitionTo('village');
    manager.transitionTo('cave');

    expect(manager.getHistory()).toEqual(['beach', 'village', 'cave']);
    expect(manager.getPreviousScene()).toBe('village');
  });

  test('应该在超过上限时裁剪场景历史', () => {
    const manager = new SceneManager({ maxHistory: 2 });
    manager.transitionTo('beach');
    manager.transitionTo('village');
    manager.transitionTo('cave');

    expect(manager.getHistory()).toEqual(['village', 'cave']);
    expect(manager.getTransitionLog()).toHaveLength(2);
  });

  test('应该拒绝无效场景 ID', () => {
    const manager = new SceneManager();

    expect(() => manager.transitionTo('   ')).toThrow('场景 ID 不能为空');
  });

  test('reset() 应该重置场景状态', () => {
    const manager = new SceneManager({ initialScene: 'beach' });
    manager.transitionTo('village');

    manager.reset('cave');

    expect(manager.currentScene).toBe('cave');
    expect(manager.getHistory()).toEqual(['cave']);
    expect(manager.getTransitionLog()).toEqual([]);
  });
});
