/**
 * TaskManager - 任务管理器
 * @虾算盘
 * 
 * 设计决策：
 * - 使用 Map 存储任务，O(1) 查找效率
 * - 事件回调支持异步操作
 * - 不可变返回，防止外部修改内部状态
 */

import { Task, TaskStatus, TaskPriority } from './Task';

export type TaskEventHandler = (task: Task) => void | Promise<void>;

export class TaskManager {
  private tasks: Map<string, Task> = new Map();
  private onTaskAddedHandlers: TaskEventHandler[] = [];
  private onTaskCompletedHandlers: TaskEventHandler[] = [];

  /**
   * 添加任务
   */
  async add(task: Task): Promise<void> {
    this.tasks.set(task.id, task);
    
    // 触发事件
    for (const handler of this.onTaskAddedHandlers) {
      await handler(task);
    }
  }

  /**
   * 删除任务
   */
  remove(id: string): boolean {
    return this.tasks.delete(id);
  }

  /**
   * 完成任务
   */
  async complete(id: string): Promise<boolean> {
    const task = this.tasks.get(id);
    if (!task || task.status !== 'pending') {
      return false;
    }

    task.complete();
    
    // 触发事件
    for (const handler of this.onTaskCompletedHandlers) {
      await handler(task);
    }
    
    return true;
  }

  /**
   * 获取所有任务
   */
  list(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * 按状态筛选
   */
  listByStatus(status: TaskStatus): Task[] {
    return this.list().filter(t => t.status === status);
  }

  /**
   * 按优先级筛选
   */
  listByPriority(priority: TaskPriority): Task[] {
    return this.list().filter(t => t.priority === priority);
  }

  /**
   * 按标签筛选
   */
  listByTag(tag: string): Task[] {
    return this.list().filter(t => t.tags.includes(tag));
  }

  /**
   * 获取单个任务
   */
  get(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  /**
   * 注册任务添加事件
   */
  onTaskAdded(handler: TaskEventHandler): void {
    this.onTaskAddedHandlers.push(handler);
  }

  /**
   * 注册任务完成事件
   */
  onTaskCompleted(handler: TaskEventHandler): void {
    this.onTaskCompletedHandlers.push(handler);
  }

  /**
   * 清空所有任务
   */
  clear(): void {
    this.tasks.clear();
  }

  /**
   * 获取任务数量
   */
  get count(): number {
    return this.tasks.size;
  }
}
