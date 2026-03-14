/**
 * 属性系统 - 管理角色基础属性
 * @虾算盘
 * 
 * 设计决策:
 * - 使用接口定义属性结构，便于扩展
 * - 等级成长采用线性公式，简单直观
 * - 派生属性实时计算，避免数据不一致
 */

export interface Stats {
  hp: number;      // 当前生命值
  maxHp: number;   // 最大生命值
  atk: number;     // 攻击力
  def: number;     // 防御力
  spd: number;     // 速度
  level: number;   // 等级
  exp: number;     // 当前经验
}

export interface BaseStats {
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  baseSpd: number;
}

export class StatsSystem {
  // 每级成长值
  private static readonly HP_GROWTH = 20;
  private static readonly ATK_GROWTH = 3;
  private static readonly DEF_GROWTH = 2;
  private static readonly SPD_GROWTH = 2;

  /**
   * 创建初始属性
   */
  static createInitialStats(base: BaseStats): Stats {
    return {
      hp: base.baseHp,
      maxHp: base.baseHp,
      atk: base.baseAtk,
      def: base.baseDef,
      spd: base.baseSpd,
      level: 1,
      exp: 0,
    };
  }

  /**
   * 计算升级所需经验
   * 公式: 100 * level^1.5
   * 设计: 1.5次方曲线让后期升级变慢
   */
  static getExpToLevel(level: number): number {
    return Math.floor(100 * Math.pow(level, 1.5));
  }

  /**
   * 尝试升级
   * @returns 是否升级成功
   */
  static tryLevelUp(stats: Stats): boolean {
    const required = this.getExpToLevel(stats.level);
    if (stats.exp >= required) {
      stats.exp -= required;
      stats.level++;
      
      // 属性成长
      stats.maxHp += this.HP_GROWTH;
      stats.hp = stats.maxHp; // 升级回满血
      stats.atk += this.ATK_GROWTH;
      stats.def += this.DEF_GROWTH;
      stats.spd += this.SPD_GROWTH;
      
      return true;
    }
    return false;
  }

  /**
   * 治疗
   */
  static heal(stats: Stats, amount: number): void {
    stats.hp = Math.min(stats.maxHp, stats.hp + amount);
  }

  /**
   * 受到伤害
   */
  static takeDamage(stats: Stats, damage: number): void {
    stats.hp = Math.max(0, stats.hp - damage);
  }

  /**
   * 检查是否存活
   */
  static isAlive(stats: Stats): boolean {
    return stats.hp > 0;
  }

  /**
   * 获取升级进度 (0-1)
   */
  static getLevelProgress(stats: Stats): number {
    const required = this.getExpToLevel(stats.level);
    return stats.exp / required;
  }
}
