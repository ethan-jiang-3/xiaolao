/**
 * StoryManager 集成测试
 * @虾可爱
 */

import { StoryManager } from '../../src/story';

describe('StoryManager 集成测试', () => {
  let manager: StoryManager;

  beforeEach(() => {
    manager = new StoryManager();
  });

  test('应该正确初始化', () => {
    expect(manager.dialogueSystem).toBeDefined();
    expect(manager.characterManager).toBeDefined();
  });

  test('应该注册所有角色', () => {
    expect(manager.characterManager.get('xiaolao')).toBeDefined();
    expect(manager.characterManager.get('village_chief')).toBeDefined();
    expect(manager.characterManager.get('mysterious_elder')).toBeDefined();
    expect(manager.characterManager.get('xiaofang')).toBeDefined();
  });

  test('应该注册所有对话节点', () => {
    expect(manager.dialogueSystem.getNode('beach_start')).toBeDefined();
    expect(manager.dialogueSystem.getNode('village_entrance')).toBeDefined();
    expect(manager.dialogueSystem.getNode('cave_entrance')).toBeDefined();
  });

  test('应该能开始游戏', () => {
    manager.startGame();
    
    expect(manager.dialogueSystem.getIsActive()).toBe(true);
    expect(manager.dialogueSystem.getContext()?.data.playerName).toBe('小劳');
  });

  test('应该能获取状态摘要', () => {
    manager.startGame();
    const status = manager.getStatus();
    
    expect(status.isActive).toBe(true);
    expect(status.currentNodeId).toBeDefined();
    expect(status.visitedNodesCount).toBeGreaterThan(0);
    expect(status.historyLength).toBeGreaterThan(0);
  });

  test('完整游戏流程测试', () => {
    // 开始游戏
    manager.startGame();
    
    // 选择检查补给
    manager.dialogueSystem.selectOption('check_supplies');
    
    // 验证变量设置
    const context = manager.dialogueSystem.getContext();
    expect(context?.data.hasExtraSupplies).toBe(true);
    expect(context?.variables.prepared).toBe(true);
    
    // 验证历史记录
    const history = manager.dialogueSystem.getHistory();
    expect(history.length).toBeGreaterThan(0);
  });
});
