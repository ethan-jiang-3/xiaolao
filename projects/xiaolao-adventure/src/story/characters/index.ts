/**
 * 虾游记 - 角色设定
 * @虾可爱
 * 
 * 设计决策：
 * 1. 每个角色有独特的性格特征，影响对话风格
 * 2. 角色关系网络影响剧情分支
 * 3. 角色状态可以随剧情变化
 */

/**
 * 角色性格类型
 */
export type PersonalityType = 
  | 'brave'      // 勇敢
  | 'curious'    // 好奇
  | 'cautious'   // 谨慎
  | 'wise'       // 智慧
  | 'mysterious' // 神秘
  | 'friendly';  // 友善

/**
 * 角色关系类型
 */
export type RelationshipType =
  | 'friend'     // 朋友
  | 'mentor'     // 导师
  | 'family'     // 家人
  | 'stranger'   // 陌生人
  | 'enemy'      // 敌人
  | 'ally';      // 盟友

/**
 * 角色接口
 */
export interface Character {
  /** 角色ID */
  id: string;
  /** 角色名称 */
  name: string;
  /** 角色称号/头衔 */
  title?: string;
  /** 性格类型 */
  personality: PersonalityType;
  /** 角色描述 */
  description: string;
  /** 背景故事 */
  backstory: string;
  /** 说话风格特点 */
  speechStyle: string;
  /** 角色关系 */
  relationships: Map<string, RelationshipType>;
  /** 角色状态 */
  status: CharacterStatus;
}

/**
 * 角色状态
 */
export interface CharacterStatus {
  /** 是否已相遇 */
  met: boolean;
  /** 好感度 (-100 到 100) */
  affinity: number;
  /** 信任度 (0 到 100) */
  trust: number;
  /** 已完成的任务 */
  completedQuests: string[];
  /** 当前位置 */
  currentLocation?: string;
  /** 是否存活 */
  isAlive: boolean;
}

/**
 * 主角：小劳
 * @虾可爱
 * 
 * 设计理由：
 * - 勇敢好奇的性格适合推动冒险剧情
 * - 作为玩家视角，性格相对中性便于代入
 */
export const xiaolao: Character = {
  id: 'xiaolao',
  name: '小劳',
  title: '冒险者',
  personality: 'curious',
  description: '一个充满好奇心的年轻冒险者，渴望探索未知的世界。',
  backstory: '小劳从小在海边村庄长大，听着老渔民讲述远方的传说。一天，他在海滩上发现了一张神秘的地图，于是踏上了冒险之旅。',
  speechStyle: '充满活力，经常使用感叹号，对新事物充满好奇',
  relationships: new Map(),
  status: {
    met: true, // 主角总是已相遇
    affinity: 0,
    trust: 50,
    completedQuests: [],
    isAlive: true
  }
};

/**
 * NPC：村长
 * @虾可爱
 * 
 * 设计理由：
 * - 智慧长者的角色提供引导和任务
 * - 友善性格让玩家感到安心
 * - 作为第一个NPC建立世界观
 */
export const villageChief: Character = {
  id: 'village_chief',
  name: '老村长',
  title: '青石村村长',
  personality: 'wise',
  description: '青石村德高望重的老村长，见多识广，是村民们的精神支柱。',
  backstory: '老村长年轻时也曾是冒险者，走遍大陆各地。退休后回到故乡，用毕生经验帮助村民和路过的冒险者。',
  speechStyle: '语重心长，经常使用谚语和比喻，语速较慢但充满智慧',
  relationships: new Map([
    ['xiaolao', 'mentor']
  ]),
  status: {
    met: false,
    affinity: 20,
    trust: 30,
    completedQuests: [],
    currentLocation: 'village_square',
    isAlive: true
  }
};

/**
 * NPC：神秘老人
 * @虾可爱
 * 
 * 设计理由：
 * - 神秘角色增加剧情悬念
 * - 知晓地图的秘密，推动主线
 * - 分支选择的关键人物
 */
export const mysteriousElder: Character = {
  id: 'mysterious_elder',
  name: '神秘老人',
  title: '？？？',
  personality: 'mysterious',
  description: '一个行踪不定的神秘老人，似乎知道很多不为人知的秘密。',
  backstory: '没有人知道他的真实身份。有人说他是古代的守护者，也有人说他是迷失在时间长河中的旅人。他只在特定的人面前现身。',
  speechStyle: '说话意味深长，经常使用隐喻，回答问题时常常用另一个问题回应',
  relationships: new Map([
    ['xiaolao', 'stranger']
  ]),
  status: {
    met: false,
    affinity: 0,
    trust: 10,
    completedQuests: [],
    currentLocation: 'cave_depths',
    isAlive: true
  }
};

/**
 * NPC：小芳（村长孙女）
 * @虾可爱
 * 
 * 设计理由：
 * - 友善角色提供情感连接
 * - 可以提供支线任务
 * - 增加村庄的生活气息
 */
export const xiaofang: Character = {
  id: 'xiaofang',
  name: '小芳',
  title: '村长孙女',
  personality: 'friendly',
  description: '村长的孙女，活泼开朗，对冒险者充满好奇。',
  backstory: '从小跟着爷爷长大，听了很多冒险故事。虽然不能离开村庄，但总是热情地帮助每一位路过的冒险者。',
  speechStyle: '活泼轻快，经常使用表情符号般的语气词，充满热情',
  relationships: new Map([
    ['village_chief', 'family'],
    ['xiaolao', 'friend']
  ]),
  status: {
    met: false,
    affinity: 30,
    trust: 40,
    completedQuests: [],
    currentLocation: 'village_square',
    isAlive: true
  }
};

/**
 * 角色管理器
 * @虾可爱
 */
export class CharacterManager {
  private characters: Map<string, Character> = new Map();

  /**
   * 注册角色
   */
  register(character: Character): void {
    this.characters.set(character.id, character);
  }

  /**
   * 获取角色
   */
  get(id: string): Character | undefined {
    return this.characters.get(id);
  }

  /**
   * 更新角色关系
   */
  updateRelationship(
    characterId: string, 
    targetId: string, 
    relationship: RelationshipType
  ): void {
    const character = this.characters.get(characterId);
    if (character) {
      character.relationships.set(targetId, relationship);
    }
  }

  /**
   * 更新角色好感度
   */
  updateAffinity(characterId: string, delta: number): void {
    const character = this.characters.get(characterId);
    if (character) {
      character.status.affinity = Math.max(-100, Math.min(100, 
        character.status.affinity + delta
      ));
    }
  }

  /**
   * 更新角色信任度
   */
  updateTrust(characterId: string, delta: number): void {
    const character = this.characters.get(characterId);
    if (character) {
      character.status.trust = Math.max(0, Math.min(100, 
        character.status.trust + delta
      ));
    }
  }

  /**
   * 标记角色已相遇
   */
  meet(characterId: string): void {
    const character = this.characters.get(characterId);
    if (character) {
      character.status.met = true;
    }
  }

  /**
   * 获取所有已相遇的角色
   */
  getMetCharacters(): Character[] {
    return Array.from(this.characters.values())
      .filter(c => c.status.met);
  }

  /**
   * 获取特定位置的角色
   */
  getCharactersAtLocation(location: string): Character[] {
    return Array.from(this.characters.values())
      .filter(c => c.status.currentLocation === location);
  }
}

// 导出所有角色
export const characters = {
  xiaolao,
  villageChief,
  mysteriousElder,
  xiaofang
};

export default CharacterManager;
