/**
 * 经济系统 - 管理金币、交易和商店
 * @虾算盘
 * 
 * 设计决策:
 * - 简单的买卖差价机制 (买100%, 卖60%)
 * - 商店库存动态管理
 * - 支持折扣和特殊事件价格调整
 */

import { Item, ItemType, Equipment, ItemSystem } from './ItemSystem';

export interface ShopItem {
  item: Item;
  stock: number;      // 库存数量 (-1 表示无限)
  priceModifier: number; // 价格调整系数
}

export interface Transaction {
  success: boolean;
  message: string;
  goldChange: number;
  item?: Item;
}

export class EconomySystem {
  private static readonly SELL_RATE = 0.6; // 出售价格为基础价格的60%

  private gold: number;
  private inventory: Map<string, { item: Item; quantity: number }>;
  private shopStock: Map<string, ShopItem>;

  constructor(initialGold: number = 0) {
    this.gold = initialGold;
    this.inventory = new Map();
    this.shopStock = new Map();
  }

  /**
   * 获取当前金币
   */
  getGold(): number {
    return this.gold;
  }

  /**
   * 增加金币
   */
  addGold(amount: number): void {
    this.gold += Math.max(0, amount);
  }

  /**
   * 扣除金币
   * @returns 是否成功
   */
  removeGold(amount: number): boolean {
    if (this.gold >= amount) {
      this.gold -= amount;
      return true;
    }
    return false;
  }

  /**
   * 添加物品到背包
   */
  addToInventory(item: Item, quantity: number = 1): void {
    const existing = this.inventory.get(item.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.inventory.set(item.id, { item, quantity });
    }
  }

  /**
   * 从背包移除物品
   */
  removeFromInventory(itemId: string, quantity: number = 1): boolean {
    const existing = this.inventory.get(itemId);
    if (existing && existing.quantity >= quantity) {
      existing.quantity -= quantity;
      if (existing.quantity === 0) {
        this.inventory.delete(itemId);
      }
      return true;
    }
    return false;
  }

  /**
   * 获取背包物品
   */
  getInventory(): Map<string, { item: Item; quantity: number }> {
    return new Map(this.inventory);
  }

  /**
   * 获取物品数量
   */
  getItemCount(itemId: string): number {
    return this.inventory.get(itemId)?.quantity || 0;
  }

  /**
   * 计算出售价格
   */
  getSellPrice(item: Item): number {
    return Math.floor(item.price * EconomySystem.SELL_RATE);
  }

  /**
   * 计算购买价格
   */
  getBuyPrice(item: Item): number {
    const shopItem = this.shopStock.get(item.id);
    const modifier = shopItem?.priceModifier || 1.0;
    return Math.floor(item.price * modifier);
  }

  /**
   * 添加商店商品
   */
  addShopItem(item: Item, stock: number = -1, priceModifier: number = 1.0): void {
    this.shopStock.set(item.id, { item, stock, priceModifier });
  }

  /**
   * 移除商店商品
   */
  removeShopItem(itemId: string): void {
    this.shopStock.delete(itemId);
  }

  /**
   * 获取商店商品列表
   */
  getShopItems(): ShopItem[] {
    return Array.from(this.shopStock.values());
  }

  /**
   * 购买物品
   */
  buy(itemId: string, quantity: number = 1): Transaction {
    const shopItem = this.shopStock.get(itemId);
    if (!shopItem) {
      return { success: false, message: '商店没有此商品', goldChange: 0 };
    }

    if (shopItem.stock !== -1 && shopItem.stock < quantity) {
      return { success: false, message: '库存不足', goldChange: 0 };
    }

    const totalPrice = this.getBuyPrice(shopItem.item) * quantity;
    if (this.gold < totalPrice) {
      return { success: false, message: '金币不足', goldChange: 0 };
    }

    // 执行交易
    this.gold -= totalPrice;
    this.addToInventory(shopItem.item, quantity);
    
    if (shopItem.stock !== -1) {
      shopItem.stock -= quantity;
    }

    return {
      success: true,
      message: `购买了 ${quantity} 个 ${shopItem.item.name}`,
      goldChange: -totalPrice,
      item: shopItem.item,
    };
  }

  /**
   * 出售物品
   */
  sell(itemId: string, quantity: number = 1): Transaction {
    const inventoryItem = this.inventory.get(itemId);
    if (!inventoryItem || inventoryItem.quantity < quantity) {
      return { success: false, message: '背包中没有足够的物品', goldChange: 0 };
    }

    const totalPrice = this.getSellPrice(inventoryItem.item) * quantity;
    
    // 执行交易
    this.removeFromInventory(itemId, quantity);
    this.gold += totalPrice;

    return {
      success: true,
      message: `出售了 ${quantity} 个 ${inventoryItem.item.name}`,
      goldChange: totalPrice,
      item: inventoryItem.item,
    };
  }

  /**
   * 修理装备
   */
  repair(equipment: Equipment): Transaction {
    const cost = ItemSystem.getRepairCost(equipment);
    if (this.gold < cost) {
      return { success: false, message: '金币不足，无法修理', goldChange: 0 };
    }

    this.gold -= cost;
    ItemSystem.repairEquipment(equipment, equipment.maxDurability);

    return {
      success: true,
      message: `修理了 ${equipment.name}`,
      goldChange: -cost,
    };
  }

  /**
   * 设置商店折扣
   */
  setDiscount(itemId: string, discountPercent: number): void {
    const shopItem = this.shopStock.get(itemId);
    if (shopItem) {
      shopItem.priceModifier = 1 - (discountPercent / 100);
    }
  }

  /**
   * 重置商店价格
   */
  resetPrice(itemId: string): void {
    const shopItem = this.shopStock.get(itemId);
    if (shopItem) {
      shopItem.priceModifier = 1.0;
    }
  }
}
