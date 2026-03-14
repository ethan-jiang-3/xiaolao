/**
 * Task Manager - 核心管理类
 * @虾可爱
 * 
 * 设计决策：
 * 1. 使用 Map 存储任务，O(1) 查找效率
 * 2. 事件系统支持扩展（如自动保存）
 * 3. 支持过滤、排序、统计
 * 4. 不可变操作，返回新数组
 */

import { Task, TaskStatus, Priority, TaskStats, CreateTaskParams, createTask } from './Task';

/**
 * 任务过滤器
 */
export interface TaskFilter {
  status?: TaskStatus;
  priority?: Priority;
  tags?: string[];
}

/**
 * 任务排序选项
 */
export type SortBy = 'createdAt' | 'priority' | 'title';
export type SortOrder = 'asc' | 'desc';

/**
 * 事件监听器类型
 */
type TaskEventListener = (task: Task) => void;

/**
 * TaskManager 类
 * @虾可爱
 */
export class TaskManager {
  /** 任务存储 */
  private tasks: Map<string, Task> = new Map();
  
  /** 事件监听器 */
  private listeners: {
    onTaskAdded: Set<TaskEventListener>;
    onTaskCompleted: Set<TaskEventListener>;
    onTaskDeleted: Set<TaskEventListener>;
  } = {
    onTaskAdded: new Set(),
    onTaskCompleted: new Set(),
    onTaskDeleted: new Set()
  };

  /**
   * 添加任务
   * @param params 创建任务参数
   * @returns 创建的任务
   */
  addTask(params: CreateTaskParams): Task {
    const task = createTask(params);
    this.tasks.set(task.id, task);
    this.emit('onTaskAdded', task);
    return task;
  }

  /**
   * 获取任务
   * @param id 任务ID
   */
  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  /**
   * 获取所有任务
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * 完成任务
   * @param id 任务ID
   * @returns 是否成功
   */
  completeTask(id: string): boolean {
    const task = this.tasks.get(id);
    if (!task || task.status === 'completed') {
      return false;
    }
    
    const updatedTask: Task = {
      ...task,
      status: 'completed',
      completedAt: new Date()
    };
    
    this.tasks.set(id, updatedTask);
    this.emit('onTaskCompleted', updatedTask);
    return true;
  }

  /**
   * 删除任务
   * @param id 任务ID
   * @returns 是否成功
   */
  deleteTask(id: string): boolean {
    const task = this.tasks.get(id);
    if (!task) {
      return false;
    }
    
    this.tasks.delete(id);
    this.emit('onTaskDeleted', task);
    return true;
  }

  /**
   * 过滤任务
   * @param filter 过滤器
   */
  filterTasks(filter: TaskFilter): Task[] {
    return this.getAllTasks().filter(task => {
      if (filter.status && task.status !== filter.status) {
        return false;
      }
      if (filter.priority && task.priority !== filter.priority) {
        return false;
      }
      if (filter.tags && filter.tags.length > 0) {
        const hasTag = filter.tags.some(tag => task.tags?.includes(tag));
        if (!hasTag) return false;
      }
      return true;
    });
  }

  /**
   * 排序任务
   * @param tasks 任务数组
   * @param sortBy 排序字段
   * @param order 排序顺序
   */
  sortTasks(tasks: Task[], sortBy: SortBy, order: SortOrder = 'asc'): Task[] {
    const sorted = [...tasks];
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'priority':
          const priorityWeight = { high: 3, medium: 2, low: 1 };
          comparison = priorityWeight[a.priority] - priorityWeight[b.priority];
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      
      return order === 'desc' ? -comparison : comparison;
    });
    
    return sorted;
  }

  /**
   * 获取统计信息
   */
  getStats(): TaskStats {
    const allTasks = this.getAllTasks();
    const pending = allTasks.filter(t => t.status === 'pending');
    const completed = allTasks.filter(t => t.status === 'completed');
    
    return {
      total: allTasks.length,
      pending: pending.length,
      completed: completed.length,
      byPriority: {
        low: allTasks.filter(t => t.priority === 'low').length,
        medium: allTasks.filter(t => t.priority === 'medium').length,
        high: allTasks.filter(t => t.priority === 'high').length
      }
    };
  }

  /**
   * 清空所有任务
   */
  clearAll(): void {
    this.tasks.clear();
  }

  /**
   * 获取任务数量
   */
  get count(): number {
    return this.tasks.size;
  }

  /**
   * 添加事件监听器
   */
  on(event: 'onTaskAdded' | 'onTaskCompleted' | 'onTaskDeleted', listener: TaskEventListener): void {
    this.listeners[event].add(listener);
  }

  /**
   * 移除事件监听器
   */
  off(event: 'onTaskAdded' | 'onTaskCompleted' | 'onTaskDeleted', listener: TaskEventListener): void {
    this.listeners[event].delete(listener);
  }

  /**
   * 触发事件
   */
  private emit(event: 'onTaskAdded' | 'onTaskCompleted' | 'onTaskDeleted', task: Task): void {
    this.listeners[event].forEach(listener => listener(task));
  }
}

export default TaskManager;
