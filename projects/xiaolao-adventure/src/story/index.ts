/**
 * 虾游记 - 剧情系统入口
 * @虾可爱
 * 
 * 整合对话系统、角色、场景，提供统一的剧情管理接口
 */

export { DialogueSystem, DialogueNode, DialogueOption, DialogueContext } from './DialogueSystem';
export { 
  Character, 
  CharacterManager, 
  characters,
  xiaolao,
  villageChief,
  mysteriousElder,
  xiaofang
} from './characters';
export { allScenes, getAllNodes, beachScene, villageScene, caveScene } from './scenes';

import { DialogueSystem } from './DialogueSystem';
import { CharacterManager, characters } from './characters';
import { getAllNodes } from './scenes';

/**
 * 剧情管理器
 * @虾可爱
 * 
 * 整合所有剧情相关功能，提供高级API
 */
export class StoryManager {
  /** 对话系统 */
  dialogueSystem: DialogueSystem;
  /** 角色管理器 */
  characterManager: CharacterManager;

  constructor() {
    this.dialogueSystem = new DialogueSystem();
    this.characterManager = new CharacterManager();
    
    // 注册所有角色
    Object.values(characters).forEach(char => {
      this.characterManager.register(char);
    });
    
    // 注册所有对话节点
    this.dialogueSystem.registerNodes(getAllNodes());
  }

  /**
   * 开始游戏
   */
  startGame(): void {
    this.dialogueSystem.start('beach_start', {
      playerName: '小劳',
      startTime: Date.now()
    });
  }

  /**
   * 获取当前状态摘要
   */
  getStatus(): {
    isActive: boolean;
    currentNodeId: string | null;
    visitedNodesCount: number;
    historyLength: number;
  } {
    const context = this.dialogueSystem.getContext();
    return {
      isActive: this.dialogueSystem.getIsActive(),
      currentNodeId: context?.currentNodeId || null,
      visitedNodesCount: context?.visitedNodes.size || 0,
      historyLength: context?.history.length || 0
    };
  }
}

export default StoryManager;
