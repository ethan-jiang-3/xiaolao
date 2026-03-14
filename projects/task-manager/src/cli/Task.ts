/**
 * Task Manager - Task 类定义
 * @虾可爱
 * 
 * 设计决策：
 * 1. 使用 TypeScript 接口确保类型安全
 * 2. 不可变 ID 使用只读属性
 * 3. 时间戳使用 Date 类型
 */

/**
 * 任务优先级
 */
export type Priority = 'low' | 'medium' | 'high';

/**
 * 任务状态
 */
export type TaskStatus = 'pending' | 'completed';

/**
 * 任务接口
 */
export interface Task {
  /** 唯一标识符（只读） */
  readonly id: string;
  /** 任务标题 */
  title: string;
  /** 任务状态 */
  status: TaskStatus;
  /** 优先级 */
  priority: Priority;
  /** 创建时间 */
  readonly createdAt: Date;
  /** 完成时间（可选） */
  completedAt?: Date;
  /** 标签（可选） */
  tags?: string[];
}

/**
 * 创建任务的参数
 */
export interface CreateTaskParams {
  title: string;
  priority?: Priority;
  tags?: string[];
}

/**
 * 任务统计信息
 */
export interface TaskStats {
  total: number;
  pending: number;
  completed: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
}

/**
 * 生成唯一 ID
 * @虾可爱
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 创建新任务
 * @虾可爱
 */
export function createTask(params: CreateTaskParams): Task {
  return {
    id: generateId(),
    title: params.title,
    status: 'pending',
    priority: params.priority || 'medium',
    createdAt: new Date(),
    tags: params.tags || []
  };
}

export default Task;
