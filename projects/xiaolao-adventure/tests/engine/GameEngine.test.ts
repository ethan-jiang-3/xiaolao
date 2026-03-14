/**
 * GameEngine 单元测试
 * @虾老大
 */

import { ActionType, BattleState, BattleUnit } from '../../src/battle/BattleSystem';
import { StatsSystem } from '../../src/battle/StatsSystem';
import { GameEngine, GameLoopState } from '../../src/engine/GameEngine';

function createPlayer(name: string = '小劳'): BattleUnit {
  return {
    id: 'player',
    name,
    stats: StatsSystem.createInitialStats({
      baseHp: 100,
      baseAtk: 20,
      baseDef: 8,
      baseSpd: 12,
    }),
    isPlayer: true,
    equipped: new Map(),
    buffs: [],
  };
}

function createEnemy(name: string = '海蟹'): BattleUnit {
  return {
    id: 'enemy',
    name,
    stats: StatsSystem.createInitialStats({
      baseHp: 40,
      baseAtk: 6,
      baseDef: 2,
      baseSpd: 5,
    }),
    isPlayer: false,
    equipped: new Map(),
    buffs: [],
  };
}

describe('GameEngine', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
  });

  test('start() 应该启动游戏并初始化场景与剧情', () => {
    const snapshot = engine.start('beach');

    expect(snapshot.loopState).toBe(GameLoopState.RUNNING);
    expect(snapshot.tick).toBe(1);
    expect(snapshot.currentScene).toBe('beach');
    expect(snapshot.sceneHistory).toContain('beach');
    expect(snapshot.story.isActive).toBe(true);
    expect(engine.storyManager.dialogueSystem.getIsActive()).toBe(true);
  });

  test('游戏主循环应该推进 tick 并同步状态', () => {
    engine.start('beach');
    const snapshot = engine.gameLoop();

    expect(snapshot.tick).toBe(2);
    expect(snapshot.state['engine.tick']).toBe(2);
    expect(snapshot.state['engine.loopState']).toBe(GameLoopState.RUNNING);
    expect(snapshot.state['scene.current']).toBe('beach');
  });

  test('暂停时主循环不应继续推进，恢复后应继续', () => {
    const started = engine.start('beach');
    engine.pause();

    const pausedSnapshot = engine.gameLoop();
    expect(pausedSnapshot.tick).toBe(started.tick);
    expect(pausedSnapshot.loopState).toBe(GameLoopState.PAUSED);

    const resumedSnapshot = engine.resume();
    expect(resumedSnapshot.loopState).toBe(GameLoopState.RUNNING);
    expect(resumedSnapshot.tick).toBe(started.tick + 1);
  });

  test('停止后再次进入主循环应抛出错误', () => {
    engine.start('beach');
    engine.stop();

    expect(() => engine.gameLoop()).toThrow('游戏已停止');
  });

  test('应该与剧情系统集成并推进对话', () => {
    engine.start('beach');
    const snapshot = engine.progressStory('check_supplies');

    expect(snapshot.tick).toBe(2);
    expect(snapshot.story.historyLength).toBeGreaterThan(0);
    expect(engine.storyManager.dialogueSystem.getContext()?.data.hasExtraSupplies).toBe(true);
    expect(engine.storyManager.dialogueSystem.getContext()?.variables.prepared).toBe(true);
  });

  test('应该与战斗系统集成并同步战斗结果', () => {
    engine.start('beach');
    const player = createPlayer();
    const enemy = createEnemy();
    player.stats.atk = 999;
    enemy.stats.hp = 10;

    const startResult = engine.startBattle(player, [enemy]);
    expect(startResult.state).toBe(BattleState.IN_PROGRESS);
    expect(engine.stateManager.getState('battle.lastResult')).toEqual(startResult);

    engine.battleSystem.executeAction({
      type: ActionType.ATTACK,
      source: player,
      target: enemy,
    });

    const snapshot = engine.gameLoop();
    expect(snapshot.battleState).toBe(BattleState.VICTORY);
    expect(snapshot.battleLogLength).toBeGreaterThan(1);
  });
});
