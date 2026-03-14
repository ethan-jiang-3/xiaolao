/**
 * 物品系统 - 管理物品、装备和消耗品
 * @虾算盘
 * 
 * 设计决策:
 * - 使用枚举定义物品类型，类型安全
 * - 效果使用函数实现，灵活可扩展
 * - 装备有耐久度概念，增加策略性
 */

import { Stats, StatsSystem } from './StatsSystem';

export enum ItemType {
  CONSUMABLE = 'consumable',
  EQUIPMENT = 'equipment',
  MATERIAL = 'material',
}

export enum EquipmentSlot {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
}

export enum Rarity {
  COMMON = 1,
  UNCOMMON = 2,
  RARE = 3,
  EPIC = 4,
  LEGENDARY = 5,
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  price: number;
  rarity: Rarity;
}

export interface Consumable extends Item {
  type: ItemType.CONSUMABLE;
  effect: (target: Stats) => void;
}

export interface Equipment extends Item {
  type: ItemType.EQUIPMENT;
  slot: EquipmentSlot;
  atkBonus?: number;
  defBonus?: number;
  spdBonus?: number;
  hpBonus?: number;
  durability: number;
  maxDurability: number;
}

export interface InventorySlot {
  item: Item;
  quantity: number;
}

export class ItemSystem {
  private static items: Map<string, Item> = new Map();

  /**
   * 注册物品
   */
  static registerItem(item: Item): void {
    this.items.set(item.id, item);
  }

  /**
   * 获取物品
   */
  static getItem(id: string): Item | undefined {
    return this.items.get(id);
  }

  /**
   * 创建消耗品
   */
  static createConsumable(
    id: string,
    name: string,
    description: string,
    price: number,
    effect: (target: Stats) => void,
    rarity: Rarity = Rarity.COMMON
  ): Consumable {
    return {
      id,
      name,
      type: ItemType.CONSUMABLE,
      description,
      price,
      rarity,
      effect,
    };
  }

  /**
   * 创建装备
   */
  static createEquipment(
    id: string,
    name: string,
    description: string,
    slot: EquipmentSlot,
    price: number,
    stats: { atk?: number; def?: number; spd?: number; hp?: number },
    durability: number,
    rarity: Rarity = Rarity.COMMON
  ): Equipment {
    return {
      id,
      name,
      type: ItemType.EQUIPMENT,
      description,
      slot,
      price,
      rarity,
      atkBonus: stats.atk || 0,
      defBonus: stats.def || 0,
      spdBonus: stats.spd || 0,
      hpBonus: stats.hp || 0,
      durability,
      maxDurability: durability,
    };
  }

  /**
   * 使用消耗品
   */
  static useConsumable(item: Consumable, target: Stats): boolean {
    if (StatsSystem.isAlive(target)) {
      item.effect(target);
      return true;
    }
    return false;
  }

  /**
   * 装备装备
   * @returns 被替换下来的旧装备（如果有）
   */
  static equip(equipment: Equipment, equipped: Map<EquipmentSlot, Equipment>): Equipment | null {
    const oldEquipment = equipped.get(equipment.slot);
    equipped.set(equipment.slot, equipment);
    return oldEquipment || null;
  }

  /**
   * 卸下装备
   */
  static unequip(slot: EquipmentSlot, equipped: Map<EquipmentSlot, Equipment>): Equipment | null {
    const equipment = equipped.get(slot);
    if (equipment) {
      equipped.delete(slot);
      return equipment;
    }
    return null;
  }

  /**
   * 计算装备提供的总属性加成
   */
  static calculateEquipmentBonus(equipped: Map<EquipmentSlot, Equipment>): { atk: number; def: number; spd: number; hp: number } {
    let atk = 0, def = 0, spd = 0, hp = 0;
    for (const equipment of equipped.values()) {
      atk += equipment.atkBonus || 0;
      def += equipment.defBonus || 0;
      spd += equipment.spdBonus || 0;
      hp += equipment.hpBonus || 0;
    }
    return { atk, def, spd, hp };
  }

  /**
   * 损耗装备耐久
   */
  static damageEquipment(equipment: Equipment, amount: number = 1): boolean {
    equipment.durability -= amount;
    return equipment.durability > 0;
  }

  /**
   * 修理装备
   */
  static repairEquipment(equipment: Equipment, amount: number): void {
    equipment.durability = Math.min(equipment.maxDurability, equipment.durability + amount);
  }

  /**
   * 获取修理费用
   */
  static getRepairCost(equipment: Equipment): number {
    const damagePercent = 1 - (equipment.durability / equipment.maxDurability);
    return Math.floor(equipment.price * 0.5 * damagePercent);
  }
}

// 注册默认物品
export function registerDefaultItems(): void {
  // 消耗品
  ItemSystem.registerItem(
    ItemSystem.createConsumable(
      'potion_small',
      '小生命药水',
      '恢复30点生命值',
      50,
      (target) => StatsSystem.heal(target, 30),
      Rarity.COMMON
    )
  );

  ItemSystem.registerItem(
    ItemSystem.createConsumable(
      'potion_medium',
      '中生命药水',
      '恢复60点生命值',
      100,
      (target) => StatsSystem.heal(target, 60),
      Rarity.COMMON
    )
  );

  ItemSystem.registerItem(
    ItemSystem.createConsumable(
      'potion_large',
      '大生命药水',
      '恢复100点生命值',
      180,
      (target) => StatsSystem.heal(target, 100),
      Rarity.UNCOMMON
    )
  );

  // 装备
  ItemSystem.registerItem(
    ItemSystem.createEquipment(
      'sword_iron',
      '铁剑',
      '普通的铁制长剑',
      EquipmentSlot.WEAPON,
      200,
      { atk: 8 },
      100,
      Rarity.COMMON
    )
  );

  ItemSystem.registerItem(
    ItemSystem.createEquipment(
      'armor_leather',
      '皮甲',
      '轻便的皮革护甲',
      EquipmentSlot.ARMOR,
      150,
      { def: 5 },
      80,
      Rarity.COMMON
    )
  );

  ItemSystem.registerItem(
    ItemSystem.createEquipment(
      'ring_speed',
      '疾风戒指',
      '提升速度的魔法戒指',
      EquipmentSlot.ACCESSORY,
      500,
      { spd: 5 },
      50,
      Rarity.RARE
    )
  );
}
