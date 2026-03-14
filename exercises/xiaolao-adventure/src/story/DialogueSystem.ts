/**
 * 虾游记 - 对话系统
 * @虾可爱
 * 
 * 设计决策：
 * 1. 使用事件驱动架构，便于扩展和测试
 * 2. 对话节点使用树形结构，支持无限嵌套分支
 * 3. 使用 TypeScript 泛型支持自定义对话数据
 * 4. 分离对话逻辑和渲染，便于适配不同UI
 */

/**
 * 对话选项接口
 */
export interface DialogueOption {
  /** 选项ID */
  id: string;
  /** 显示文本 */
  text: string;
  /** 选项条件（可选） */
  condition?: (context: DialogueContext) => boolean;
  /** 选择后的回调 */
  onSelect?: (context: DialogueContext) => void;
  /** 下一个节点ID */
  nextNodeId?: string;
  /** 是否结束对话 */
  isEnd?: boolean;
}

/**
 * 对话节点接口
 */
export interface DialogueNode {
  /** 节点ID */
  id: string;
  /** 说话者ID */
  speakerId: string;
  /** 对话内容 */
  content: string;
  /** 可选分支 */
  options?: DialogueOption[];
  /** 自动跳转到下一个节点（无分支时使用） */
  nextNodeId?: string;
  /** 是否结束对话 */
  isEnd?: boolean;
  /** 进入节点时的回调 */
  onEnter?: (context: DialogueContext) => void;
}

/**
 * 对话上下文接口
 * 存储对话过程中的状态和数据
 */
export interface DialogueContext {
  /** 当前节点ID */
  currentNodeId: string;
  /** 已访问的节点记录 */
  visitedNodes: Set<string>;
  /** 对话历史 */
  history: DialogueRecord[];
  /** 自定义数据存储 */
  data: Record<string, any>;
  /** 变量存储（用于条件判断） */
  variables: Record<string, boolean | number | string>;
}

/**
 * 对话记录
 */
export interface DialogueRecord {
  /** 节点ID */
  nodeId: string;
  /** 说话者 */
  speakerId: string;
  /** 内容 */
  content: string;
  /** 时间戳 */
  timestamp: number;
  /** 选择的选项ID（如果是玩家回复） */
  selectedOptionId?: string;
}

/**
 * 对话事件类型
 */
export type DialogueEventType = 
  | 'dialogue:start'
  | 'dialogue:end'
  | 'node:enter'
  | 'node:exit'
  | 'option:select'
  | 'history:update';

/**
 * 对话事件
 */
export interface DialogueEvent {
  type: DialogueEventType;
  context: DialogueContext;
  data?: any;
}

/**
 * 事件监听器类型
 */
type EventListener = (event: DialogueEvent) => void;

/**
 * 对话系统主类
 * @虾可爱
 */
export class DialogueSystem {
  /** 对话节点映射表 */
  private nodes: Map<string, DialogueNode> = new Map();
  
  /** 当前上下文 */
  private context: DialogueContext | null = null;
  
  /** 事件监听器映射 */
  private listeners: Map<DialogueEventType, Set<EventListener>> = new Map();
  
  /** 是否正在进行对话 */
  private isActive: boolean = false;

  /**
   * 注册对话节点
   * @param node 对话节点
   */
  registerNode(node: DialogueNode): void {
    this.nodes.set(node.id, node);
  }

  /**
   * 批量注册对话节点
   * @param nodes 对话节点数组
   */
  registerNodes(nodes: DialogueNode[]): void {
    nodes.forEach(node => this.registerNode(node));
  }

  /**
   * 获取节点
   * @param nodeId 节点ID
   */
  getNode(nodeId: string): DialogueNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * 开始对话
   * @param startNodeId 起始节点ID
   * @param initialData 初始数据
   */
  start(startNodeId: string, initialData: Record<string, any> = {}): DialogueContext {
    if (!this.nodes.has(startNodeId)) {
      throw new Error(`起始节点不存在: ${startNodeId}`);
    }

    this.context = {
      currentNodeId: startNodeId,
      visitedNodes: new Set(),
      history: [],
      data: initialData,
      variables: {}
    };

    this.isActive = true;
    this.emit('dialogue:start', { context: this.context });
    
    // 进入起始节点
    this.enterNode(startNodeId);
    
    return this.context;
  }

  /**
   * 进入节点
   * @param nodeId 节点ID
   */
  private enterNode(nodeId: string): void {
    if (!this.context) return;

    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`节点不存在: ${nodeId}`);
    }

    // 更新上下文
    this.context.currentNodeId = nodeId;
    this.context.visitedNodes.add(nodeId);

    // 记录历史
    this.context.history.push({
      nodeId,
      speakerId: node.speakerId,
      content: node.content,
      timestamp: Date.now()
    });

    // 触发节点进入事件
    this.emit('node:enter', { 
      context: this.context,
      data: { node }
    });

    // 执行节点回调
    if (node.onEnter) {
      node.onEnter(this.context);
    }

    // 检查是否自动跳转
    if (node.isEnd) {
      this.end();
    } else if (node.nextNodeId && !node.options) {
      // 自动跳转到下一个节点
      this.enterNode(node.nextNodeId);
    }
  }

  /**
   * 获取当前节点
   */
  getCurrentNode(): DialogueNode | null {
    if (!this.context) return null;
    return this.nodes.get(this.context.currentNodeId) || null;
  }

  /**
   * 获取当前上下文
   */
  getContext(): DialogueContext | null {
    return this.context;
  }

  /**
   * 获取可用的选项
   * 过滤掉不满足条件的选项
   */
  getAvailableOptions(): DialogueOption[] {
    const node = this.getCurrentNode();
    if (!node || !node.options) return [];
    
    if (!this.context) return [];

    return node.options.filter(option => {
      if (option.condition) {
        return option.condition(this.context!);
      }
      return true;
    });
  }

  /**
   * 选择选项
   * @param optionId 选项ID
   */
  selectOption(optionId: string): void {
    if (!this.context) {
      throw new Error('对话未开始');
    }

    const node = this.getCurrentNode();
    if (!node || !node.options) {
      throw new Error('当前节点没有选项');
    }

    const option = node.options.find(opt => opt.id === optionId);
    if (!option) {
      throw new Error(`选项不存在: ${optionId}`);
    }

    // 检查条件
    if (option.condition && !option.condition(this.context)) {
      throw new Error(`选项不可用: ${optionId}`);
    }

    // 记录选择
    const lastRecord = this.context.history[this.context.history.length - 1];
    if (lastRecord) {
      lastRecord.selectedOptionId = optionId;
    }

    // 触发选择事件
    this.emit('option:select', {
      context: this.context,
      data: { option, node }
    });

    // 执行选项回调
    if (option.onSelect) {
      option.onSelect(this.context);
    }

    // 触发节点退出事件
    this.emit('node:exit', {
      context: this.context,
      data: { node }
    });

    // 跳转到下一个节点或结束
    if (option.isEnd) {
      this.end();
    } else if (option.nextNodeId) {
      this.enterNode(option.nextNodeId);
    }
  }

  /**
   * 设置变量
   * @param key 变量名
   * @param value 变量值
   */
  setVariable(key: string, value: boolean | number | string): void {
    if (!this.context) {
      throw new Error('对话未开始');
    }
    this.context.variables[key] = value;
  }

  /**
   * 获取变量
   * @param key 变量名
   */
  getVariable(key: string): boolean | number | string | undefined {
    if (!this.context) {
      throw new Error('对话未开始');
    }
    return this.context.variables[key];
  }

  /**
   * 结束对话
   */
  end(): void {
    if (!this.context) return;
    
    this.emit('dialogue:end', { context: this.context });
    this.isActive = false;
  }

  /**
   * 是否正在进行对话
   */
  getIsActive(): boolean {
    return this.isActive;
  }

  /**
   * 获取对话历史
   */
  getHistory(): DialogueRecord[] {
    if (!this.context) return [];
    return [...this.context.history];
  }

  /**
   * 清空历史
   */
  clearHistory(): void {
    if (!this.context) return;
    this.context.history = [];
  }

  /**
   * 重置系统
   */
  reset(): void {
    this.context = null;
    this.isActive = false;
    // 保留注册的节点，只重置状态
  }

  /**
   * 完全重置（包括节点）
   */
  fullReset(): void {
    this.reset();
    this.nodes.clear();
    this.listeners.clear();
  }

  /**
   * 添加事件监听器
   * @param type 事件类型
   * @param listener 监听器
   */
  on(type: DialogueEventType, listener: EventListener): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  /**
   * 移除事件监听器
   * @param type 事件类型
   * @param listener 监听器
   */
  off(type: DialogueEventType, listener: EventListener): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 触发事件
   * @param type 事件类型
   * @param event 事件数据
   */
  private emit(type: DialogueEventType, event: Omit<DialogueEvent, 'type'>): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach(listener => {
        listener({ type, ...event });
      });
    }
  }

  /**
   * 获取所有已访问的节点
   */
  getVisitedNodes(): Set<string> {
    if (!this.context) return new Set();
    return new Set(this.context.visitedNodes);
  }

  /**
   * 检查节点是否已访问
   * @param nodeId 节点ID
   */
  hasVisited(nodeId: string): boolean {
    if (!this.context) return false;
    return this.context.visitedNodes.has(nodeId);
  }
}

export default DialogueSystem;
