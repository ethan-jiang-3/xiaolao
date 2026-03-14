/**
 * 角色系统单元测试
 * @虾可爱
 */

import { CharacterManager, characters, xiaolao, villageChief } from '../../src/story/characters';

describe('CharacterManager', () => {
  let manager: CharacterManager;

  beforeEach(() => {
    manager = new CharacterManager();
  });

  describe('角色注册', () => {
    test('应该能注册角色', () => {
      manager.register(xiaolao);
      expect(manager.get('xiaolao')).toBeDefined();
    });

    test('获取不存在的角色应返回undefined', () => {
      expect(manager.get('nonexistent')).toBeUndefined();
    });
  });

  describe('角色状态管理', () => {
    beforeEach(() => {
      manager.register(villageChief);
    });

    test('应该能标记角色已相遇', () => {
      manager.meet('village_chief');
      const chief = manager.get('village_chief');
      expect(chief?.status.met).toBe(true);
    });

    test('应该能更新好感度', () => {
      manager.updateAffinity('village_chief', 20);
      const chief = manager.get('village_chief');
      expect(chief?.status.affinity).toBe(40); // 初始20 + 20
    });

    test('好感度不能超过100', () => {
      manager.updateAffinity('village_chief', 100);
      const chief = manager.get('village_chief');
      expect(chief?.status.affinity).toBe(100);
    });

    test('好感度不能低于-100', () => {
      manager.updateAffinity('village_chief', -200);
      const chief = manager.get('village_chief');
      expect(chief?.status.affinity).toBe(-100);
    });

    test('应该能更新信任度', () => {
      manager.updateTrust('village_chief', 20);
      const chief = manager.get('village_chief');
      expect(chief?.status.trust).toBe(50); // 初始30 + 20
    });

    test('信任度不能超过100', () => {
      manager.updateTrust('village_chief', 100);
      const chief = manager.get('village_chief');
      expect(chief?.status.trust).toBe(100);
    });

    test('信任度不能低于0', () => {
      // 先重置信任度到0，再尝试减到负数
      const chief = manager.get('village_chief');
      if (chief) chief.status.trust = 10; // 设置一个较小的值
      manager.updateTrust('village_chief', -50);
      expect(chief?.status.trust).toBe(0);
    });
  });

  describe('角色关系', () => {
    beforeEach(() => {
      manager.register(xiaolao);
      manager.register(villageChief);
    });

    test('应该能更新角色关系', () => {
      manager.updateRelationship('village_chief', 'xiaolao', 'friend');
      const chief = manager.get('village_chief');
      expect(chief?.relationships.get('xiaolao')).toBe('friend');
    });
  });

  describe('查询功能', () => {
    beforeEach(() => {
      Object.values(characters).forEach(char => {
        manager.register(char);
      });
    });

    test('应该能获取所有已相遇的角色', () => {
      manager.meet('xiaolao');
      manager.meet('village_chief');

      const metCharacters = manager.getMetCharacters();
      expect(metCharacters.length).toBe(2);
      expect(metCharacters.map(c => c.id)).toContain('xiaolao');
      expect(metCharacters.map(c => c.id)).toContain('village_chief');
    });

    test('应该能获取特定位置的角色', () => {
      const villageCharacters = manager.getCharactersAtLocation('village_square');
      expect(villageCharacters.length).toBe(2); // 村长和小芳
      expect(villageCharacters.map(c => c.id)).toContain('village_chief');
      expect(villageCharacters.map(c => c.id)).toContain('xiaofang');
    });
  });
});

describe('角色数据', () => {
  test('小劳应该有正确的初始状态', () => {
    expect(xiaolao.id).toBe('xiaolao');
    expect(xiaolao.name).toBe('小劳');
    expect(xiaolao.personality).toBe('curious');
    expect(xiaolao.status.met).toBe(true);
  });

  test('村长应该有正确的初始状态', () => {
    expect(villageChief.id).toBe('village_chief');
    expect(villageChief.name).toBe('老村长');
    expect(villageChief.personality).toBe('wise');
    expect(villageChief.status.currentLocation).toBe('village_square');
  });
});
