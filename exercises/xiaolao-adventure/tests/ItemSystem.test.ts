/**
 * ItemSystem 单元测试
 * @虾算盘
 */

import {
  ItemSystem,
  EquipmentSlot,
  Rarity,
  ItemType,
  registerDefaultItems,
} from '../src/battle/ItemSystem';
import { StatsSystem } from '../src/battle/StatsSystem';

describe('ItemSystem', () => {
  beforeEach(() => {
    registerDefaultItems();
  });

  describe('createConsumable', () => {
    it('应该创建正确的消耗品', () => {
      const potion = ItemSystem.createConsumable(
        'test_potion',
        '测试药水',
        '恢复50HP',
        100,
        (target) => StatsSystem.heal(target, 50),
        Rarity.COMMON
      );

      expect(potion.id).toBe('test_potion');
      expect(potion.name).toBe('测试药水');
      expect(potion.type).toBe(ItemType.CONSUMABLE);
      expect(potion.price).toBe(100);
    });
  });

  describe('createEquipment', () => {
    it('应该创建正确的装备', () => {
      const sword = ItemSystem.createEquipment(
        'test_sword',
        '测试剑',
        '测试用剑',
        EquipmentSlot.WEAPON,
        200,
        { atk: 10 },
        100,
        Rarity.RARE
      );

      expect(sword.id).toBe('test_sword');
      expect(sword.slot).toBe(EquipmentSlot.WEAPON);
      expect(sword.atkBonus).toBe(10);
      expect(sword.durability).toBe(100);
    });
  });

  describe('useConsumable', () => {
    it('使用药水应该恢复生命值', () => {
      const stats = StatsSystem.createInitialStats({
        baseHp: 100,
        baseAtk: 10,
        baseDef: 5,
        baseSpd: 10,
      });
      stats.hp = 50;

      const potion = ItemSystem.createConsumable(
        'heal_potion',
        '治疗药水',
        '恢复30HP',
        50,
        (target) => StatsSystem.heal(target, 30)
      );

      const result = ItemSystem.useConsumable(potion, stats);

      expect(result).toBe(true);
      expect(stats.hp).toBe(80);
    });

    it('死亡角色不能使用药水', () => {
      const stats = StatsSystem.createInitialStats({
        baseHp: 100,
        baseAtk: 10,
        baseDef: 5,
        baseSpd: 10,
      });
      stats.hp = 0;

      const potion = ItemSystem.createConsumable(
        'heal_potion',
        '治疗药水',
        '恢复30HP',
        50,
        (target) => StatsSystem.heal(target, 30)
      );

      const result = ItemSystem.useConsumable(potion, stats);

      expect(result).toBe(false);
    });
  });

  describe('equip / unequip', () => {
    it('装备应该正确穿戴', () => {
      const sword = ItemSystem.createEquipment(
        'iron_sword',
        '铁剑',
        '普通的铁剑',
        EquipmentSlot.WEAPON,
        200,
        { atk: 8 },
        100
      );

      const equipped = new Map();
      const oldEquipment = ItemSystem.equip(sword, equipped);

      expect(oldEquipment).toBeNull();
      expect(equipped.get(EquipmentSlot.WEAPON)).toBe(sword);
    });

    it('替换装备应该返回旧装备', () => {
      const sword1 = ItemSystem.createEquipment(
        'sword1',
        '剑1',
        '第一把剑',
        EquipmentSlot.WEAPON,
        100,
        { atk: 5 },
        100
      );

      const sword2 = ItemSystem.createEquipment(
        'sword2',
        '剑2',
        '第二把剑',
        EquipmentSlot.WEAPON,
        200,
        { atk: 10 },
        100
      );

      const equipped = new Map();
      ItemSystem.equip(sword1, equipped);
      const oldEquipment = ItemSystem.equip(sword2, equipped);

      expect(oldEquipment).toBe(sword1);
      expect(equipped.get(EquipmentSlot.WEAPON)).toBe(sword2);
    });

    it('卸下装备应该正确移除', () => {
      const sword = ItemSystem.createEquipment(
        'iron_sword',
        '铁剑',
        '普通的铁剑',
        EquipmentSlot.WEAPON,
        200,
        { atk: 8 },
        100
      );

      const equipped = new Map();
      ItemSystem.equip(sword, equipped);
      const removed = ItemSystem.unequip(EquipmentSlot.WEAPON, equipped);

      expect(removed).toBe(sword);
      expect(equipped.has(EquipmentSlot.WEAPON)).toBe(false);
    });
  });

  describe('calculateEquipmentBonus', () => {
    it('应该正确计算装备加成', () => {
      const sword = ItemSystem.createEquipment(
        'sword',
        '剑',
        '加攻击',
        EquipmentSlot.WEAPON,
        200,
        { atk: 10 },
        100
      );

      const armor = ItemSystem.createEquipment(
        'armor',
        '甲',
        '加防御',
        EquipmentSlot.ARMOR,
        150,
        { def: 5 },
        80
      );

      const equipped = new Map();
      equipped.set(EquipmentSlot.WEAPON, sword);
      equipped.set(EquipmentSlot.ARMOR, armor);

      const bonus = ItemSystem.calculateEquipmentBonus(equipped);

      expect(bonus.atk).toBe(10);
      expect(bonus.def).toBe(5);
      expect(bonus.spd).toBe(0);
      expect(bonus.hp).toBe(0);
    });
  });

  describe('damageEquipment / repairEquipment', () => {
    it('损耗装备耐久', () => {
      const sword = ItemSystem.createEquipment(
        'sword',
        '剑',
        '测试剑',
        EquipmentSlot.WEAPON,
        200,
        { atk: 10 },
        100
      );

      const stillUsable = ItemSystem.damageEquipment(sword, 20);

      expect(stillUsable).toBe(true);
      expect(sword.durability).toBe(80);
    });

    it('耐久归零返回false', () => {
      const sword = ItemSystem.createEquipment(
        'sword',
        '剑',
        '测试剑',
        EquipmentSlot.WEAPON,
        200,
        { atk: 10 },
        10
      );

      const stillUsable = ItemSystem.damageEquipment(sword, 15);

      expect(stillUsable).toBe(false);
      expect(sword.durability).toBe(-5);
    });

    it('修理装备恢复耐久', () => {
      const sword = ItemSystem.createEquipment(
        'sword',
        '剑',
        '测试剑',
        EquipmentSlot.WEAPON,
        200,
        { atk: 10 },
        100
      );

      ItemSystem.damageEquipment(sword, 50);
      ItemSystem.repairEquipment(sword, 30);

      expect(sword.durability).toBe(80);
    });

    it('修理不超过最大耐久', () => {
      const sword = ItemSystem.createEquipment(
        'sword',
        '剑',
        '测试剑',
        EquipmentSlot.WEAPON,
        200,
        { atk: 10 },
        100
      );

      ItemSystem.damageEquipment(sword, 10);
      ItemSystem.repairEquipment(sword, 50);

      expect(sword.durability).toBe(100);
    });
  });

  describe('getRepairCost', () => {
    it('满耐久修理费为0', () => {
      const sword = ItemSystem.createEquipment(
        'sword',
        '剑',
        '测试剑',
        EquipmentSlot.WEAPON,
        200,
        { atk: 10 },
        100
      );

      expect(ItemSystem.getRepairCost(sword)).toBe(0);
    });

    it('50%损坏修理费为基础价格的25%', () => {
      const sword = ItemSystem.createEquipment(
        'sword',
        '剑',
        '测试剑',
        EquipmentSlot.WEAPON,
        200,
        { atk: 10 },
        100
      );

      ItemSystem.damageEquipment(sword, 50);

      expect(ItemSystem.getRepairCost(sword)).toBe(50); // 200 * 0.5 * 0.5
    });
  });

  describe('getItem', () => {
    it('应该能获取已注册的物品', () => {
      const item = ItemSystem.getItem('potion_small');
      expect(item).toBeDefined();
      expect(item?.name).toBe('小生命药水');
    });

    it('未注册物品返回undefined', () => {
      const item = ItemSystem.getItem('non_existent');
      expect(item).toBeUndefined();
    });
  });
});
