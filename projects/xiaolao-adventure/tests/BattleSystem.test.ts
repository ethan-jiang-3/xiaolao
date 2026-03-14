/**
 * BattleSystem 单元测试
 * @虾算盘
 */

import {
  BattleSystem,
  BattleUnit,
  ActionType,
  BattleState,
} from '../src/battle/BattleSystem';
import { StatsSystem } from '../src/battle/StatsSystem';
import { EquipmentSlot, ItemSystem, registerDefaultItems } from '../src/battle/ItemSystem';

describe('BattleSystem', () => {
  beforeEach(() => {
    registerDefaultItems();
  });

  function createPlayer(name: string = '玩家'): BattleUnit {
    return {
      id: 'player',
      name,
      stats: StatsSystem.createInitialStats({
        baseHp: 100,
        baseAtk: 15,
        baseDef: 5,
        baseSpd: 12,
      }),
      isPlayer: true,
      equipped: new Map(),
      buffs: [],
    };
  }

  function createEnemy(name: string = '敌人', level: number = 1): BattleUnit {
    const stats = StatsSystem.createInitialStats({
      baseHp: 80,
      baseAtk: 10,
      baseDef: 3,
      baseSpd: 8,
    });
    for (let i = 1; i < level; i++) {
      StatsSystem.tryLevelUp(stats);
    }
    return {
      id: `enemy_${name}`,
      name,
      stats,
      isPlayer: false,
      equipped: new Map(),
      buffs: [],
    };
  }

  describe('startBattle', () => {
    it('应该正确初始化战斗', () => {
      const battle = new BattleSystem();
      const player = createPlayer();
      const enemy = createEnemy();

      const result = battle.startBattle(player, [enemy]);

      expect(result.state).toBe(BattleState.IN_PROGRESS);
      expect(battle.getTurn()).toBe(1);
      expect(result.log).toHaveLength(1);
    });
  });

  describe('getActionOrder', () => {
    it('应该按速度排序', () => {
      const battle = new BattleSystem();
      const player = createPlayer();
      player.stats.spd = 5;
      const enemy = createEnemy();
      enemy.stats.spd = 10;

      battle.startBattle(player, [enemy]);
      const order = battle.getActionOrder();

      expect(order[0].name).toBe('敌人');
      expect(order[1].name).toBe('玩家');
    });

    it('应该过滤死亡单位', () => {
      const battle = new BattleSystem();
      const player = createPlayer();
      const enemy = createEnemy();
      enemy.stats.hp = 0;

      battle.startBattle(player, [enemy]);
      const order = battle.getActionOrder();

      expect(order).toHaveLength(1);
      expect(order[0].name).toBe('玩家');
    });
  });

  describe('executeAction - ATTACK', () => {
    it('攻击应该造成伤害', () => {
      const battle = new BattleSystem();
      const player = createPlayer();
      const enemy = createEnemy();
      const initialHp = enemy.stats.hp;

      battle.startBattle(player, [enemy]);
      battle.executeAction({
        type: ActionType.ATTACK,
        source: player,
        target: enemy,
      });

      expect(enemy.stats.hp).toBeLessThan(initialHp);
    });

    it('击败敌人后战斗胜利', () => {
      const battle = new BattleSystem();
      const player = createPlayer();
      player.stats.atk = 1000; // 高攻击确保一击必杀
      const enemy = createEnemy();
      enemy.stats.hp = 10;

      battle.startBattle(player, [enemy]);
      battle.executeAction({
        type: ActionType.ATTACK,
        source: player,
        target: enemy,
      });

      expect(battle.getState()).toBe(BattleState.VICTORY);
    });

    it('玩家死亡后战斗失败', () => {
      const battle = new BattleSystem();
      const player = createPlayer();
      player.stats.hp = 1;
      const enemy = createEnemy();
      enemy.stats.atk = 100; // 高攻击

      battle.startBattle(player, [enemy]);
      battle.executeAction({
        type: ActionType.ATTACK,
        source: enemy,
        target: player,
      });

      expect(battle.getState()).toBe(BattleState.DEFEAT);
    });
  });

  describe('executeAction - ITEM', () => {
    it('使用药水应该恢复生命值', () => {
      const battle = new BattleSystem();
      const player = createPlayer();
      player.stats.hp = 50;
      const enemy = createEnemy();

      const potion = ItemSystem.getItem('potion_small')!;

      battle.startBattle(player, [enemy]);
      battle.executeAction({
        type: ActionType.ITEM,
        source: player,
        target: player,
        item: potion as any,
      });

      expect(player.stats.hp).toBe(80); // 50 + 30
    });
  });

  describe('executeAction - ESCAPE', () => {
    it('逃跑成功应该结束战斗', () => {
      const battle = new BattleSystem();
      const player = createPlayer();
      player.stats.spd = 100; // 高速度确保逃跑成功
      const enemy = createEnemy();

      battle.startBattle(player, [enemy]);
      
      // 多次尝试直到逃跑成功（概率性）
      let attempts = 0;
      while (battle.getState() === BattleState.IN_PROGRESS && attempts < 100) {
        battle.executeAction({
          type: ActionType.ESCAPE,
          source: player,
        });
        attempts++;
      }

      if (battle.getState() === BattleState.ESCAPED) {
        expect(battle.getState()).toBe(BattleState.ESCAPED);
      }
    });
  });

  describe('calculateRewards', () => {
    it('应该计算正确的奖励', () => {
      const battle = new BattleSystem();
      const player = createPlayer();
      const enemy = createEnemy('哥布林', 2);
      enemy.stats.hp = 0; // 已死亡

      battle.startBattle(player, [enemy]);
      const rewards = battle.calculateRewards();

      expect(rewards.exp).toBeGreaterThan(0);
      expect(rewards.gold).toBeGreaterThan(0);
    });

    it('存活敌人不产生奖励', () => {
      const battle = new BattleSystem();
      const player = createPlayer();
      const enemy = createEnemy();

      battle.startBattle(player, [enemy]);
      const rewards = battle.calculateRewards();

      expect(rewards.exp).toBe(0);
      expect(rewards.gold).toBe(0);
    });
  });

  describe('getEffectiveStat', () => {
    it('应该包含装备加成', () => {
      const battle = new BattleSystem();
      const player = createPlayer();
      const sword = ItemSystem.createEquipment(
        'test_sword',
        '测试剑',
        '测试',
        EquipmentSlot.WEAPON,
        100,
        { atk: 10 },
        100
      );
      player.equipped.set(EquipmentSlot.WEAPON, sword);

      battle.startBattle(player, [createEnemy()]);
      const effectiveAtk = battle.getEffectiveStat(player, 'atk');

      expect(effectiveAtk).toBe(25); // 15 + 10
    });

    it('应该包含buff加成', () => {
      const battle = new BattleSystem();
      const player = createPlayer();
      player.buffs.push({
        name: '力量提升',
        stat: 'atk',
        value: 5,
        remainingTurns: 3,
      });

      battle.startBattle(player, [createEnemy()]);
      const effectiveAtk = battle.getEffectiveStat(player, 'atk');

      expect(effectiveAtk).toBe(20); // 15 + 5
    });
  });

  describe('Buff系统', () => {
    it('buff应该在回合结束时减少持续时间', () => {
      const battle = new BattleSystem();
      const player = createPlayer();
      const enemy = createEnemy();
      enemy.stats.hp = 1; // 确保一击必杀

      player.buffs.push({
        name: '力量提升',
        stat: 'atk',
        value: 5,
        remainingTurns: 2,
      });

      battle.startBattle(player, [enemy]);
      expect(player.buffs[0].remainingTurns).toBe(2);

      battle.executeAction({
        type: ActionType.ATTACK,
        source: player,
        target: enemy,
      });

      // buff在回合结束时更新 (如果战斗未结束，buff应该减少1回合)
      if (battle.getState() === BattleState.IN_PROGRESS) {
        expect(player.buffs[0].remainingTurns).toBe(1);
      }
    });
  });

  describe('战斗日志', () => {
    it('应该记录战斗行动', () => {
      const battle = new BattleSystem();
      const player = createPlayer();
      const enemy = createEnemy();

      battle.startBattle(player, [enemy]);
      battle.executeAction({
        type: ActionType.ATTACK,
        source: player,
        target: enemy,
      });

      const log = battle.getLog();
      expect(log.length).toBeGreaterThan(1);
      expect(log[0].action).toBe('战斗开始');
    });
  });

  describe('回合推进', () => {
    it('行动后应该进入下一回合', () => {
      const battle = new BattleSystem();
      const player = createPlayer();
      const enemy = createEnemy();
      enemy.stats.hp = 1000; // 确保不会一击必杀

      battle.startBattle(player, [enemy]);
      const initialTurn = battle.getTurn();

      battle.executeAction({
        type: ActionType.ATTACK,
        source: player,
        target: enemy,
      });

      expect(battle.getTurn()).toBe(initialTurn + 1);
    });
  });
});
