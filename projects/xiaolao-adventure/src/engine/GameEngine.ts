import { BattleResult, BattleSystem, BattleUnit } from '../battle';
import { StoryManager } from '../story';
import { SaveManager } from './SaveManager';
import { SceneManager } from './SceneManager';
import { StateManager } from './StateManager';

/**
 * 游戏运行阶段。
 * @虾老大
 */
export enum GameLoopState {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  STOPPED = 'stopped',
}

/**
 * 游戏快照接口。
 * @虾老大
 */
export interface GameEngineSnapshot {
  loopState: GameLoopState;
  tick: number;
  currentScene: string | null;
  sceneHistory: string[];
  state: Record<string, unknown>;
  story: ReturnType<StoryManager['getStatus']>;
  battleState: ReturnType<BattleSystem['getState']>;
  battleTurn: number;
  battleLogLength: number;
}

/**
 * 游戏引擎配置。
 * @虾老大
 */
export interface GameEngineOptions {
  storyManager?: StoryManager;
  battleSystem?: BattleSystem;
  sceneManager?: SceneManager;
  stateManager?: StateManager;
  saveManager?: SaveManager;
  onTick?: (snapshot: GameEngineSnapshot) => void;
}

/**
 * 游戏主引擎。
 * 负责调度剧情系统、战斗系统、场景系统和存档系统。
 * @虾老大
 */
export class GameEngine {
  /** 剧情管理器 */
  readonly storyManager: StoryManager;
  /** 战斗系统 */
  readonly battleSystem: BattleSystem;
  /** 场景管理器 */
  readonly sceneManager: SceneManager;
  /** 状态管理器 */
  readonly stateManager: StateManager;
  /** 存档管理器 */
  readonly saveManager: SaveManager;

  private loopState: GameLoopState;
  private tickCount: number;
  private onTick?: (snapshot: GameEngineSnapshot) => void;

  constructor(options: GameEngineOptions = {}) {
    this.storyManager = options.storyManager ?? new StoryManager();
    this.battleSystem = options.battleSystem ?? new BattleSystem();
    this.sceneManager = options.sceneManager ?? new SceneManager();
    this.stateManager = options.stateManager ?? new StateManager();
    this.saveManager =
      options.saveManager ?? new SaveManager(this.stateManager, this.sceneManager);
    this.loopState = GameLoopState.IDLE;
    this.tickCount = 0;
    this.onTick = options.onTick;
  }

  /**
   * 启动游戏。
   * 会初始化起始场景并启动剧情系统。
   * @param startSceneId 可选的起始场景 ID
   */
  start(startSceneId?: string): GameEngineSnapshot {
    if (startSceneId) {
      this.sceneManager.transitionTo(startSceneId);
    }

    if (!this.storyManager.dialogueSystem.getIsActive()) {
      this.storyManager.startGame();
    }

    this.loopState = GameLoopState.RUNNING;
    return this.gameLoop();
  }

  /**
   * 游戏主循环。
   * 每次调用都会推进一次引擎状态同步。
   * @虾老大
   */
  gameLoop(): GameEngineSnapshot {
    if (this.loopState === GameLoopState.STOPPED) {
      throw new Error('游戏已停止，无法继续运行主循环');
    }

    if (this.loopState === GameLoopState.PAUSED) {
      return this.getSnapshot();
    }

    if (this.loopState === GameLoopState.IDLE) {
      this.loopState = GameLoopState.RUNNING;
    }

    this.tickCount += 1;
    this.syncState();

    const snapshot = this.getSnapshot();
    this.onTick?.(snapshot);
    return snapshot;
  }

  /**
   * 暂停游戏主循环。
   * @虾老大
   */
  pause(): void {
    if (this.loopState === GameLoopState.RUNNING) {
      this.loopState = GameLoopState.PAUSED;
      this.stateManager.setState('engine.loopState', this.loopState);
    }
  }

  /**
   * 恢复游戏主循环。
   * @虾老大
   */
  resume(): GameEngineSnapshot {
    if (this.loopState === GameLoopState.PAUSED) {
      this.loopState = GameLoopState.RUNNING;
    }

    return this.gameLoop();
  }

  /**
   * 停止游戏。
   * @虾老大
   */
  stop(): void {
    this.loopState = GameLoopState.STOPPED;
    this.stateManager.setState('engine.loopState', this.loopState);
  }

  /**
   * 协调剧情系统推进。
   * @param optionId 对话选项 ID
   */
  progressStory(optionId: string): GameEngineSnapshot {
    this.storyManager.dialogueSystem.selectOption(optionId);
    return this.gameLoop();
  }

  /**
   * 协调战斗系统启动。
   * @param player 玩家单位
   * @param enemies 敌方单位列表
   */
  startBattle(player: BattleUnit, enemies: BattleUnit[]): BattleResult {
    const result = this.battleSystem.startBattle(player, enemies);
    this.stateManager.setState('battle.lastResult', result);
    this.gameLoop();
    return result;
  }

  /**
   * 获取当前引擎快照。
   * @虾老大
   */
  getSnapshot(): GameEngineSnapshot {
    return {
      loopState: this.loopState,
      tick: this.tickCount,
      currentScene: this.sceneManager.currentScene,
      sceneHistory: this.sceneManager.getHistory(),
      state: this.stateManager.getAllState(),
      story: this.storyManager.getStatus(),
      battleState: this.battleSystem.getState(),
      battleTurn: this.battleSystem.getTurn(),
      battleLogLength: this.battleSystem.getLog().length,
    };
  }

  /**
   * 同步主循环的运行状态到状态管理器。
   * @虾老大
   */
  private syncState(): void {
    this.stateManager.setState('engine.tick', this.tickCount);
    this.stateManager.setState('engine.loopState', this.loopState);
    this.stateManager.setState('scene.current', this.sceneManager.currentScene);
    this.stateManager.setState('scene.history', this.sceneManager.getHistory());
    this.stateManager.setState('story.status', this.storyManager.getStatus());
    this.stateManager.setState('battle.state', this.battleSystem.getState());
    this.stateManager.setState('battle.turn', this.battleSystem.getTurn());
  }
}
