/**
 * StatsAnalyzer - 统计分析器
 * @虾算盘
 * 
 * 设计决策：
 * - 实时计算，不缓存（数据量小，计算快）
 * - 支持按标签、时间段筛选
 */

import { Task, TaskStatus } from '../engine/Task';

export interface TaskStats {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
  completionRate: number;
  averageCompletionTime: number; // 毫秒
}

export class StatsAnalyzer {
  constructor(private tasks: Task[]) {}

  /**
   * 获取总任务数
   */
  getTotalCount(): number {
    return this.tasks.length;
  }

  /**
   * 获取已完成任务数
   */
  getCompletedCount(): number {
    return this.tasks.filter(t => t.status === 'completed').length;
  }

  /**
   * 获取待办任务数
   */
  getPendingCount(): number {
    return this.tasks.filter(t => t.status === 'pending').length;
  }

  /**
   * 获取已取消任务数
   */
  getCancelledCount(): number {
    return this.tasks.filter(t => t.status === 'cancelled').length;
  }

  /**
   * 获取完成率
   */
  getCompletionRate(): number {
    const total = this.getTotalCount();
    if (total === 0) return 0;
    return this.getCompletedCount() / total;
  }

  /**
   * 获取平均完成时间（毫秒）
   */
  getAverageCompletionTime(): number {
    const completed = this.tasks.filter(t => 
      t.status === 'completed' && t.completedAt
    );
    
    if (completed.length === 0) return 0;
    
    const totalTime = completed.reduce((sum, t) => {
      return sum + (t.completedAt!.getTime() - t.createdAt.getTime());
    }, 0);
    
    return totalTime / completed.length;
  }

  /**
   * 按标签筛选任务
   */
  getTasksByTag(tag: string): Task[] {
    return this.tasks.filter(t => t.tags.includes(tag));
  }

  /**
   * 获取所有标签及其计数
   */
  getTagCounts(): Map<string, number> {
    const counts = new Map<string, number>();
    
    for (const task of this.tasks) {
      for (const tag of task.tags) {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }
    
    return counts;
  }

  /**
   * 获取按优先级分布
   */
  getPriorityDistribution(): Map<string, number> {
    const dist = new Map<string, number>();
    
    for (const task of this.tasks) {
      const count = dist.get(task.priority) || 0;
      dist.set(task.priority, count + 1);
    }
    
    return dist;
  }

  /**
   * 获取完整统计报告
   */
  getFullStats(): TaskStats {
    return {
      total: this.getTotalCount(),
      pending: this.getPendingCount(),
      completed: this.getCompletedCount(),
      cancelled: this.getCancelledCount(),
      completionRate: this.getCompletionRate(),
      averageCompletionTime: this.getAverageCompletionTime(),
    };
  }
}
