/**
 * StatsSystem 单元测试
 * @虾算盘
 */

import { StatsSystem, BaseStats } from '../src/battle/StatsSystem';

describe('StatsSystem', () => {
  const baseStats: BaseStats = {
    baseHp: 100,
    baseAtk: 10,
    baseDef: 5,
    baseSpd: 10,
  };

  describe('createInitialStats', () => {
    it('应该创建正确的初始属性', () => {
      const stats = StatsSystem.createInitialStats(baseStats);
      
      expect(stats.hp).toBe(100);
      expect(stats.maxHp).toBe(100);
      expect(stats.atk).toBe(10);
      expect(stats.def).toBe(5);
      expect(stats.spd).toBe(10);
      expect(stats.level).toBe(1);
      expect(stats.exp).toBe(0);
    });
  });

  describe('getExpToLevel', () => {
    it('1级需要100经验', () => {
      expect(StatsSystem.getExpToLevel(1)).toBe(100);
    });

    it('2级需要约282-283经验 (100 * 2^1.5)', () => {
      expect(StatsSystem.getExpToLevel(2)).toBeGreaterThanOrEqual(282);
      expect(StatsSystem.getExpToLevel(2)).toBeLessThanOrEqual(283);
    });

    it('10级需要约3162经验', () => {
      expect(StatsSystem.getExpToLevel(10)).toBe(3162);
    });
  });

  describe('tryLevelUp', () => {
    it('经验不足时不升级', () => {
      const stats = StatsSystem.createInitialStats(baseStats);
      stats.exp = 50;
      
      const result = StatsSystem.tryLevelUp(stats);
      
      expect(result).toBe(false);
      expect(stats.level).toBe(1);
    });

    it('经验足够时升级并增加属性', () => {
      const stats = StatsSystem.createInitialStats(baseStats);
      stats.exp = 100;
      stats.hp = 50; // 先扣点血
      
      const result = StatsSystem.tryLevelUp(stats);
      
      expect(result).toBe(true);
      expect(stats.level).toBe(2);
      expect(stats.maxHp).toBe(120); // +20
      expect(stats.hp).toBe(120); // 升级回满血
      expect(stats.atk).toBe(13); // +3
      expect(stats.def).toBe(7); // +2
      expect(stats.spd).toBe(12); // +2
      expect(stats.exp).toBe(0); // 扣除升级所需经验
    });
  });

  describe('heal', () => {
    it('治疗增加生命值', () => {
      const stats = StatsSystem.createInitialStats(baseStats);
      stats.hp = 50;
      
      StatsSystem.heal(stats, 30);
      
      expect(stats.hp).toBe(80);
    });

    it('治疗不超过最大生命值', () => {
      const stats = StatsSystem.createInitialStats(baseStats);
      stats.hp = 90;
      
      StatsSystem.heal(stats, 30);
      
      expect(stats.hp).toBe(100);
    });
  });

  describe('takeDamage', () => {
    it('受到伤害减少生命值', () => {
      const stats = StatsSystem.createInitialStats(baseStats);
      
      StatsSystem.takeDamage(stats, 30);
      
      expect(stats.hp).toBe(70);
    });

    it('生命值不会低于0', () => {
      const stats = StatsSystem.createInitialStats(baseStats);
      
      StatsSystem.takeDamage(stats, 150);
      
      expect(stats.hp).toBe(0);
    });
  });

  describe('isAlive', () => {
    it('HP>0时存活', () => {
      const stats = StatsSystem.createInitialStats(baseStats);
      expect(StatsSystem.isAlive(stats)).toBe(true);
    });

    it('HP=0时死亡', () => {
      const stats = StatsSystem.createInitialStats(baseStats);
      stats.hp = 0;
      expect(StatsSystem.isAlive(stats)).toBe(false);
    });
  });

  describe('getLevelProgress', () => {
    it('计算升级进度', () => {
      const stats = StatsSystem.createInitialStats(baseStats);
      stats.exp = 50;
      
      expect(StatsSystem.getLevelProgress(stats)).toBe(0.5);
    });
  });
});
