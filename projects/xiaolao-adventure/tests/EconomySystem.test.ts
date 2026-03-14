/**
 * EconomySystem 单元测试
 * @虾算盘
 */

import { EconomySystem } from '../src/battle/EconomySystem';
import { ItemSystem, ItemType, Rarity, registerDefaultItems } from '../src/battle/ItemSystem';

describe('EconomySystem', () => {
  beforeEach(() => {
    registerDefaultItems();
  });

  describe('金币管理', () => {
    it('应该正确初始化金币', () => {
      const economy = new EconomySystem(100);
      expect(economy.getGold()).toBe(100);
    });

    it('应该正确增加金币', () => {
      const economy = new EconomySystem(100);
      economy.addGold(50);
      expect(economy.getGold()).toBe(150);
    });

    it('增加负数金币无效', () => {
      const economy = new EconomySystem(100);
      economy.addGold(-50);
      expect(economy.getGold()).toBe(100);
    });

    it('应该正确扣除金币', () => {
      const economy = new EconomySystem(100);
      const result = economy.removeGold(50);
      expect(result).toBe(true);
      expect(economy.getGold()).toBe(50);
    });

    it('金币不足时扣除失败', () => {
      const economy = new EconomySystem(100);
      const result = economy.removeGold(150);
      expect(result).toBe(false);
      expect(economy.getGold()).toBe(100);
    });
  });

  describe('背包管理', () => {
    it('应该添加物品到背包', () => {
      const economy = new EconomySystem();
      const item = ItemSystem.getItem('potion_small')!;

      economy.addToInventory(item, 3);

      expect(economy.getItemCount('potion_small')).toBe(3);
    });

    it('应该累加相同物品', () => {
      const economy = new EconomySystem();
      const item = ItemSystem.getItem('potion_small')!;

      economy.addToInventory(item, 2);
      economy.addToInventory(item, 3);

      expect(economy.getItemCount('potion_small')).toBe(5);
    });

    it('应该从背包移除物品', () => {
      const economy = new EconomySystem();
      const item = ItemSystem.getItem('potion_small')!;

      economy.addToInventory(item, 5);
      const result = economy.removeFromInventory('potion_small', 2);

      expect(result).toBe(true);
      expect(economy.getItemCount('potion_small')).toBe(3);
    });

    it('物品不足时移除失败', () => {
      const economy = new EconomySystem();
      const item = ItemSystem.getItem('potion_small')!;

      economy.addToInventory(item, 2);
      const result = economy.removeFromInventory('potion_small', 5);

      expect(result).toBe(false);
      expect(economy.getItemCount('potion_small')).toBe(2);
    });

    it('移除所有物品后从背包删除', () => {
      const economy = new EconomySystem();
      const item = ItemSystem.getItem('potion_small')!;

      economy.addToInventory(item, 2);
      economy.removeFromInventory('potion_small', 2);

      expect(economy.getItemCount('potion_small')).toBe(0);
    });
  });

  describe('商店系统', () => {
    it('应该添加商店商品', () => {
      const economy = new EconomySystem();
      const item = ItemSystem.getItem('potion_small')!;

      economy.addShopItem(item, 10);

      const shopItems = economy.getShopItems();
      expect(shopItems).toHaveLength(1);
      expect(shopItems[0].item.id).toBe('potion_small');
      expect(shopItems[0].stock).toBe(10);
    });

    it('应该移除商店商品', () => {
      const economy = new EconomySystem();
      const item = ItemSystem.getItem('potion_small')!;

      economy.addShopItem(item, 10);
      economy.removeShopItem('potion_small');

      expect(economy.getShopItems()).toHaveLength(0);
    });

    it('无限库存用-1表示', () => {
      const economy = new EconomySystem();
      const item = ItemSystem.getItem('potion_small')!;

      economy.addShopItem(item, -1);

      const shopItems = economy.getShopItems();
      expect(shopItems[0].stock).toBe(-1);
    });
  });

  describe('购买', () => {
    it('应该成功购买物品', () => {
      const economy = new EconomySystem(200);
      const item = ItemSystem.getItem('potion_small')!;
      economy.addShopItem(item, 10);

      const result = economy.buy('potion_small', 2);

      expect(result.success).toBe(true);
      expect(result.goldChange).toBe(-100); // 50 * 2
      expect(economy.getGold()).toBe(100);
      expect(economy.getItemCount('potion_small')).toBe(2);
    });

    it('金币不足时购买失败', () => {
      const economy = new EconomySystem(50);
      const item = ItemSystem.getItem('potion_small')!;
      economy.addShopItem(item, 10);

      const result = economy.buy('potion_small', 2);

      expect(result.success).toBe(false);
      expect(result.message).toBe('金币不足');
      expect(economy.getGold()).toBe(50);
    });

    it('库存不足时购买失败', () => {
      const economy = new EconomySystem(200);
      const item = ItemSystem.getItem('potion_small')!;
      economy.addShopItem(item, 1);

      const result = economy.buy('potion_small', 2);

      expect(result.success).toBe(false);
      expect(result.message).toBe('库存不足');
    });

    it('商品不存在时购买失败', () => {
      const economy = new EconomySystem(200);

      const result = economy.buy('non_existent', 1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('商店没有此商品');
    });

    it('购买应该减少库存', () => {
      const economy = new EconomySystem(200);
      const item = ItemSystem.getItem('potion_small')!;
      economy.addShopItem(item, 5);

      economy.buy('potion_small', 2);

      const shopItems = economy.getShopItems();
      expect(shopItems[0].stock).toBe(3);
    });

    it('无限库存购买不减库存', () => {
      const economy = new EconomySystem(200);
      const item = ItemSystem.getItem('potion_small')!;
      economy.addShopItem(item, -1);

      economy.buy('potion_small', 2);

      const shopItems = economy.getShopItems();
      expect(shopItems[0].stock).toBe(-1);
    });
  });

  describe('出售', () => {
    it('应该成功出售物品', () => {
      const economy = new EconomySystem();
      const item = ItemSystem.getItem('potion_small')!;

      economy.addToInventory(item, 5);
      const result = economy.sell('potion_small', 2);

      expect(result.success).toBe(true);
      expect(result.goldChange).toBe(60); // 50 * 2 * 0.6
      expect(economy.getGold()).toBe(60);
      expect(economy.getItemCount('potion_small')).toBe(3);
    });

    it('物品不足时出售失败', () => {
      const economy = new EconomySystem();
      const item = ItemSystem.getItem('potion_small')!;

      economy.addToInventory(item, 1);
      const result = economy.sell('potion_small', 2);

      expect(result.success).toBe(false);
      expect(result.message).toBe('背包中没有足够的物品');
    });
  });

  describe('价格计算', () => {
    it('出售价格为基础价格的60%', () => {
      const economy = new EconomySystem();
      const item = ItemSystem.getItem('potion_small')!;

      expect(economy.getSellPrice(item)).toBe(30); // 50 * 0.6
    });

    it('购买价格受价格调整系数影响', () => {
      const economy = new EconomySystem();
      const item = ItemSystem.getItem('potion_small')!;

      economy.addShopItem(item, -1, 0.8); // 8折

      expect(economy.getBuyPrice(item)).toBe(40); // 50 * 0.8
    });
  });

  describe('折扣', () => {
    it('应该设置折扣', () => {
      const economy = new EconomySystem();
      const item = ItemSystem.getItem('potion_small')!;

      economy.addShopItem(item, -1);
      economy.setDiscount('potion_small', 20); // 8折

      expect(economy.getBuyPrice(item)).toBe(40); // 50 * 0.8
    });

    it('应该重置价格', () => {
      const economy = new EconomySystem();
      const item = ItemSystem.getItem('potion_small')!;

      economy.addShopItem(item, -1);
      economy.setDiscount('potion_small', 20);
      economy.resetPrice('potion_small');

      expect(economy.getBuyPrice(item)).toBe(50);
    });
  });
});
