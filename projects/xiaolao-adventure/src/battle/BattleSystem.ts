/**
 * 战斗系统 - 回合制战斗核心
 * @虾算盘
 * 
 * 设计决策:
 * - 使用事件驱动架构，便于扩展和测试
 * - 行动顺序按速度排序，速度相同则随机
 * - 伤害公式平衡攻防，避免极端情况
 * - 支持逃跑、使用物品等多样行动
 */

import { Stats, StatsSystem } from './StatsSystem';
import { Consumable, Equipment, EquipmentSlot, ItemSystem } from './ItemSystem';

export enum BattleState {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  VICTORY = 'victory',
  DEFEAT = 'defeat',
  ESCAPED = 'escaped',
}

export enum ActionType {
  ATTACK = 'attack',
  SKILL = 'skill',
  ITEM = 'item',
  ESCAPE = 'escape',
}

export interface BattleUnit {
  id: string;
  name: string;
  stats: Stats;
  isPlayer: boolean;
  equipped: Map<EquipmentSlot, Equipment>;
  buffs: Buff[];
}

export interface Buff {
  name: string;
  stat: 'atk' | 'def' | 'spd';
  value: number;
  remainingTurns: number;
}

export interface BattleAction {
  type: ActionType;
  source: BattleUnit;
  target?: BattleUnit;
  item?: Consumable;
}

export interface BattleResult {
  state: BattleState;
  winner?: BattleUnit;
  expGained: number;
  goldGained: number;
  log: BattleLogEntry[];
}

export interface BattleLogEntry {
  turn: number;
  actor: string;
  action: string;
  damage?: number;
  healing?: number;
  message: string;
}

export class BattleSystem {
  private units: BattleUnit[];
  private turn: number;
  private state: BattleState;
  private log: BattleLogEntry[];
  private escapeAttempts: number;

  constructor() {
    this.units = [];
    this.turn = 1;
    this.state = BattleState.PENDING;
    this.log = [];
    this.escapeAttempts = 0;
  }

  /**
   * 开始战斗
   */
  startBattle(player: BattleUnit, enemies: BattleUnit[]): BattleResult {
    this.units = [player, ...enemies];
    this.turn = 1;
    this.state = BattleState.IN_PROGRESS;
    this.log = [];
    this.escapeAttempts = 0;

    this.addLog(0, '系统', '战斗开始', `战斗开始！${player.name} VS ${enemies.map(e => e.name).join(', ')}`);
    
    return this.getResult();
  }

  /**
   * 获取行动顺序（按速度排序）
   */
  getActionOrder(): BattleUnit[] {
    return [...this.units]
      .filter(u => StatsSystem.isAlive(u.stats))
      .sort((a, b) => {
        const spdA = this.getEffectiveStat(a, 'spd');
        const spdB = this.getEffectiveStat(b, 'spd');
        if (spdA !== spdB) return spdB - spdA;
        return Math.random() > 0.5 ? 1 : -1; // 速度相同随机排序
      });
  }

  /**
   * 获取有效属性（含装备和buff加成）
   */
  getEffectiveStat(unit: BattleUnit, stat: 'atk' | 'def' | 'spd'): number {
    let base = unit.stats[stat];
    
    // 装备加成
    const bonus = ItemSystem.calculateEquipmentBonus(unit.equipped);
    if (stat === 'atk') base += bonus.atk;
    if (stat === 'def') base += bonus.def;
    if (stat === 'spd') base += bonus.spd;

    // Buff加成
    for (const buff of unit.buffs) {
      if (buff.stat === stat) {
        base += buff.value;
      }
    }

    return Math.max(1, base);
  }

  /**
   * 执行行动
   */
  executeAction(action: BattleAction): void {
    if (this.state !== BattleState.IN_PROGRESS) return;

    switch (action.type) {
      case ActionType.ATTACK:
        this.executeAttack(action);
        break;
      case ActionType.ITEM:
        this.executeItem(action);
        break;
      case ActionType.ESCAPE:
        this.executeEscape(action);
        break;
    }

    // 更新Buff持续时间
    this.updateBuffs();

    // 检查战斗结束
    this.checkBattleEnd();

    // 进入下一回合
    if (this.state === BattleState.IN_PROGRESS) {
      this.turn++;
    }
  }

  /**
   * 执行攻击
   */
  private executeAttack(action: BattleAction): void {
    if (!action.target) return;

    const attacker = action.source;
    const defender = action.target;

    const atk = this.getEffectiveStat(attacker, 'atk');
    const def = this.getEffectiveStat(defender, 'def');

    // 伤害公式: max(1, ATK - DEF * 0.5) * 随机浮动
    const baseDamage = Math.max(1, atk - def * 0.5);
    const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 - 1.1
    
    // 暴击判定 (速度影响暴击率)
    const critChance = 0.05 + this.getEffectiveStat(attacker, 'spd') * 0.002;
    const isCrit = Math.random() < critChance;
    const critMultiplier = isCrit ? 1.5 : 1.0;

    const damage = Math.floor(baseDamage * randomFactor * critMultiplier);
    
    StatsSystem.takeDamage(defender.stats, damage);

    // 损耗武器耐久
    const weapon = attacker.equipped.get(EquipmentSlot.WEAPON);
    if (weapon) {
      ItemSystem.damageEquipment(weapon);
    }

    const critText = isCrit ? '（暴击！）' : '';
    this.addLog(
      this.turn,
      attacker.name,
      '攻击',
      `${attacker.name} 攻击 ${defender.name}，造成 ${damage} 点伤害${critText}！`
    );

    if (!StatsSystem.isAlive(defender.stats)) {
      this.addLog(this.turn, '系统', '击败', `${defender.name} 倒下了！`);
    }
  }

  /**
   * 执行使用物品
   */
  private executeItem(action: BattleAction): void {
    if (!action.item || !action.target) return;

    const beforeHp = action.target.stats.hp;
    ItemSystem.useConsumable(action.item, action.target.stats);
    const healed = action.target.stats.hp - beforeHp;

    this.addLog(
      this.turn,
      action.source.name,
      '使用物品',
      `${action.source.name} 使用了 ${action.item.name}，恢复了 ${healed} 点生命值`,
      undefined,
      healed
    );
  }

  /**
   * 执行逃跑
   */
  private executeEscape(action: BattleAction): void {
    this.escapeAttempts++;
    
    // 逃跑成功率: 基础50% + 速度差 * 2% - 尝试次数 * 10%
    const playerSpd = this.getEffectiveStat(action.source, 'spd');
    const enemySpd = Math.max(...this.units
      .filter(u => !u.isPlayer && StatsSystem.isAlive(u.stats))
      .map(u => this.getEffectiveStat(u, 'spd')));
    
    const escapeChance = 0.5 + (playerSpd - enemySpd) * 0.02 - this.escapeAttempts * 0.1;
    
    if (Math.random() < Math.max(0.1, escapeChance)) {
      this.state = BattleState.ESCAPED;
      this.addLog(this.turn, action.source.name, '逃跑', `${action.source.name} 成功逃跑了！`);
    } else {
      this.addLog(this.turn, action.source.name, '逃跑', `${action.source.name} 逃跑失败！`);
    }
  }

  /**
   * 更新Buff持续时间
   */
  private updateBuffs(): void {
    for (const unit of this.units) {
      unit.buffs = unit.buffs.filter(buff => {
        buff.remainingTurns--;
        return buff.remainingTurns > 0;
      });
    }
  }

  /**
   * 检查战斗结束条件
   */
  private checkBattleEnd(): void {
    const player = this.units.find(u => u.isPlayer);
    const enemies = this.units.filter(u => !u.isPlayer);

    if (!player || !StatsSystem.isAlive(player.stats)) {
      this.state = BattleState.DEFEAT;
      this.addLog(this.turn, '系统', '战斗结束', '战斗失败...');
      return;
    }

    const aliveEnemies = enemies.filter(e => StatsSystem.isAlive(e.stats));
    if (aliveEnemies.length === 0) {
      this.state = BattleState.VICTORY;
      this.addLog(this.turn, '系统', '战斗结束', '战斗胜利！');
    }
  }

  /**
   * 计算战斗奖励
   */
  calculateRewards(): { exp: number; gold: number } {
    let exp = 0;
    let gold = 0;

    for (const unit of this.units) {
      if (!unit.isPlayer && !StatsSystem.isAlive(unit.stats)) {
        exp += unit.stats.level * 10 + unit.stats.maxHp * 0.1;
        gold += unit.stats.level * (5 + Math.floor(Math.random() * 11)); // 5-15G per level
      }
    }

    return { exp: Math.floor(exp), gold: Math.floor(gold) };
  }

  /**
   * 添加日志
   */
  private addLog(turn: number, actor: string, action: string, message: string, damage?: number, healing?: number): void {
    this.log.push({ turn, actor, action, message, damage, healing });
  }

  /**
   * 获取战斗结果
   */
  getResult(): BattleResult {
    const rewards = this.state === BattleState.VICTORY ? this.calculateRewards() : { exp: 0, gold: 0 };
    
    return {
      state: this.state,
      expGained: rewards.exp,
      goldGained: rewards.gold,
      log: this.log,
    };
  }

  /**
   * 获取当前状态
   */
  getState(): BattleState {
    return this.state;
  }

  /**
   * 获取当前回合
   */
  getTurn(): number {
    return this.turn;
  }

  /**
   * 获取战斗日志
   */
  getLog(): BattleLogEntry[] {
    return [...this.log];
  }
}
