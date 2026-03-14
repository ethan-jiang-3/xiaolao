/**
 * StatsAnalyzer 单元测试
 * @虾算盘
 */

import { StatsAnalyzer } from '../src/storage/StatsAnalyzer';
import { Task } from '../src/engine/Task';

describe('StatsAnalyzer', () => {
  describe('getTotalCount', () => {
    it('应该返回总任务数', () => {
      const tasks = [new Task('1', '任务1'), new Task('2', '任务2')];
      const analyzer = new StatsAnalyzer(tasks);
      
      expect(analyzer.getTotalCount()).toBe(2);
    });
  });

  describe('getCompletedCount', () => {
    it('应该返回已完成任务数', () => {
      const task1 = new Task('1', '任务1');
      task1.complete();
      const tasks = [task1, new Task('2', '任务2')];
      const analyzer = new StatsAnalyzer(tasks);
      
      expect(analyzer.getCompletedCount()).toBe(1);
    });
  });

  describe('getPendingCount', () => {
    it('应该返回待办任务数', () => {
      const tasks = [new Task('1', '任务1'), new Task('2', '任务2')];
      const analyzer = new StatsAnalyzer(tasks);
      
      expect(analyzer.getPendingCount()).toBe(2);
    });
  });

  describe('getCancelledCount', () => {
    it('应该返回已取消任务数', () => {
      const task1 = new Task('1', '任务1');
      task1.cancel();
      const tasks = [task1, new Task('2', '任务2')];
      const analyzer = new StatsAnalyzer(tasks);
      
      expect(analyzer.getCancelledCount()).toBe(1);
    });
  });

  describe('getCompletionRate', () => {
    it('应该返回完成率', () => {
      const task1 = new Task('1', '任务1');
      task1.complete();
      const tasks = [task1, new Task('2', '任务2'), new Task('3', '任务3')];
      const analyzer = new StatsAnalyzer(tasks);
      
      expect(analyzer.getCompletionRate()).toBe(1 / 3);
    });

    it('空任务列表返回 0', () => {
      const analyzer = new StatsAnalyzer([]);
      expect(analyzer.getCompletionRate()).toBe(0);
    });
  });

  describe('getAverageCompletionTime', () => {
    it('应该返回平均完成时间', () => {
      const now = new Date();
      const task1 = new Task('1', '任务1', 'pending', 'medium', new Date(now.getTime() - 10000));
      task1.complete();
      
      const task2 = new Task('2', '任务2', 'pending', 'medium', new Date(now.getTime() - 20000));
      task2.complete();
      
      const tasks = [task1, task2];
      const analyzer = new StatsAnalyzer(tasks);
      
      const avgTime = analyzer.getAverageCompletionTime();
      expect(avgTime).toBeGreaterThan(0);
    });

    it('无完成任务返回 0', () => {
      const tasks = [new Task('1', '任务1')];
      const analyzer = new StatsAnalyzer(tasks);
      
      expect(analyzer.getAverageCompletionTime()).toBe(0);
    });
  });

  describe('getTasksByTag', () => {
    it('应该按标签筛选', () => {
      const tasks = [
        new Task('1', '任务1', 'pending', 'medium', new Date(), undefined, ['工作']),
        new Task('2', '任务2', 'pending', 'medium', new Date(), undefined, ['生活']),
        new Task('3', '任务3', 'pending', 'medium', new Date(), undefined, ['工作', '紧急']),
      ];
      const analyzer = new StatsAnalyzer(tasks);
      
      const workTasks = analyzer.getTasksByTag('工作');
      
      expect(workTasks).toHaveLength(2);
    });
  });

  describe('getTagCounts', () => {
    it('应该返回标签计数', () => {
      const tasks = [
        new Task('1', '任务1', 'pending', 'medium', new Date(), undefined, ['工作']),
        new Task('2', '任务2', 'pending', 'medium', new Date(), undefined, ['工作']),
        new Task('3', '任务3', 'pending', 'medium', new Date(), undefined, ['生活']),
      ];
      const analyzer = new StatsAnalyzer(tasks);
      
      const counts = analyzer.getTagCounts();
      
      expect(counts.get('工作')).toBe(2);
      expect(counts.get('生活')).toBe(1);
    });
  });

  describe('getPriorityDistribution', () => {
    it('应该返回优先级分布', () => {
      const tasks = [
        new Task('1', '任务1', 'pending', 'high'),
        new Task('2', '任务2', 'pending', 'high'),
        new Task('3', '任务3', 'pending', 'low'),
      ];
      const analyzer = new StatsAnalyzer(tasks);
      
      const dist = analyzer.getPriorityDistribution();
      
      expect(dist.get('high')).toBe(2);
      expect(dist.get('low')).toBe(1);
    });
  });

  describe('getFullStats', () => {
    it('应该返回完整统计', () => {
      const task1 = new Task('1', '任务1');
      task1.complete();
      const tasks = [task1, new Task('2', '任务2')];
      const analyzer = new StatsAnalyzer(tasks);
      
      const stats = analyzer.getFullStats();
      
      expect(stats.total).toBe(2);
      expect(stats.completed).toBe(1);
      expect(stats.pending).toBe(1);
      expect(stats.completionRate).toBe(0.5);
    });
  });
});
