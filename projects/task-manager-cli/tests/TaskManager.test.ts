/**
 * TaskManager 单元测试
 * @虾可爱
 */

import { TaskManager } from '../src/TaskManager';
import { Priority } from '../src/Task';

describe('TaskManager', () => {
  let manager: TaskManager;

  beforeEach(() => {
    manager = new TaskManager();
  });

  describe('addTask', () => {
    test('应该添加任务', () => {
      const task = manager.addTask({ title: '新任务' });
      
      expect(task.title).toBe('新任务');
      expect(manager.count).toBe(1);
    });

    test('应该触发 onTaskAdded 事件', () => {
      const listener = jest.fn();
      manager.on('onTaskAdded', listener);
      
      const task = manager.addTask({ title: '测试' });
      
      expect(listener).toHaveBeenCalledWith(task);
    });
  });

  describe('getTask', () => {
    test('应该获取任务', () => {
      const task = manager.addTask({ title: '获取测试' });
      const retrieved = manager.getTask(task.id);
      
      expect(retrieved).toEqual(task);
    });

    test('获取不存在的任务应返回 undefined', () => {
      expect(manager.getTask('nonexistent')).toBeUndefined();
    });
  });

  describe('getAllTasks', () => {
    test('应该获取所有任务', () => {
      manager.addTask({ title: '任务1' });
      manager.addTask({ title: '任务2' });
      
      const tasks = manager.getAllTasks();
      expect(tasks.length).toBe(2);
    });
  });

  describe('completeTask', () => {
    test('应该完成任务', () => {
      const task = manager.addTask({ title: '待完成' });
      const result = manager.completeTask(task.id);
      
      expect(result).toBe(true);
      expect(manager.getTask(task.id)?.status).toBe('completed');
    });

    test('完成不存在的任务应返回 false', () => {
      expect(manager.completeTask('nonexistent')).toBe(false);
    });

    test('重复完成任务应返回 false', () => {
      const task = manager.addTask({ title: '测试' });
      manager.completeTask(task.id);
      const result = manager.completeTask(task.id);
      
      expect(result).toBe(false);
    });

    test('应该触发 onTaskCompleted 事件', () => {
      const listener = jest.fn();
      manager.on('onTaskCompleted', listener);
      
      const task = manager.addTask({ title: '测试' });
      manager.completeTask(task.id);
      
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    test('应该删除任务', () => {
      const task = manager.addTask({ title: '待删除' });
      const result = manager.deleteTask(task.id);
      
      expect(result).toBe(true);
      expect(manager.count).toBe(0);
    });

    test('删除不存在的任务应返回 false', () => {
      expect(manager.deleteTask('nonexistent')).toBe(false);
    });

    test('应该触发 onTaskDeleted 事件', () => {
      const listener = jest.fn();
      manager.on('onTaskDeleted', listener);
      
      const task = manager.addTask({ title: '测试' });
      manager.deleteTask(task.id);
      
      expect(listener).toHaveBeenCalledWith(task);
    });
  });

  describe('filterTasks', () => {
    beforeEach(() => {
      manager.addTask({ title: '高优先级', priority: 'high' as Priority });
      manager.addTask({ title: '低优先级', priority: 'low' as Priority });
      const task = manager.addTask({ title: '待完成' });
      manager.completeTask(task.id);
    });

    test('应该按状态过滤', () => {
      const pending = manager.filterTasks({ status: 'pending' });
      const completed = manager.filterTasks({ status: 'completed' });
      
      expect(pending.length).toBe(2);
      expect(completed.length).toBe(1);
    });

    test('应该按优先级过滤', () => {
      const high = manager.filterTasks({ priority: 'high' as Priority });
      
      expect(high.length).toBe(1);
      expect(high[0].title).toBe('高优先级');
    });
  });

  describe('sortTasks', () => {
    beforeEach(() => {
      manager.addTask({ title: 'B任务' });
      manager.addTask({ title: 'A任务' });
    });

    test('应该按标题排序', () => {
      const tasks = manager.sortTasks(manager.getAllTasks(), 'title', 'asc');
      
      expect(tasks[0].title).toBe('A任务');
      expect(tasks[1].title).toBe('B任务');
    });

    test('应该按优先级排序', () => {
      manager.addTask({ title: '高优先级', priority: 'high' as Priority });
      
      const tasks = manager.sortTasks(manager.getAllTasks(), 'priority', 'desc');
      
      expect(tasks[0].priority).toBe('high');
    });
  });

  describe('getStats', () => {
    test('应该返回正确的统计', () => {
      manager.addTask({ title: '任务1', priority: 'high' as Priority });
      manager.addTask({ title: '任务2', priority: 'low' as Priority });
      const task = manager.addTask({ title: '任务3' });
      manager.completeTask(task.id);
      
      const stats = manager.getStats();
      
      expect(stats.total).toBe(3);
      expect(stats.pending).toBe(2);
      expect(stats.completed).toBe(1);
      expect(stats.byPriority.high).toBe(1);
      expect(stats.byPriority.low).toBe(1);
      expect(stats.byPriority.medium).toBe(1);
    });

    test('空任务列表应返回零统计', () => {
      const stats = manager.getStats();
      
      expect(stats.total).toBe(0);
      expect(stats.pending).toBe(0);
      expect(stats.completed).toBe(0);
    });
  });

  describe('clearAll', () => {
    test('应该清空所有任务', () => {
      manager.addTask({ title: '任务1' });
      manager.addTask({ title: '任务2' });
      
      manager.clearAll();
      
      expect(manager.count).toBe(0);
    });
  });

  describe('事件监听器', () => {
    test('应该支持移除监听器', () => {
      const listener = jest.fn();
      manager.on('onTaskAdded', listener);
      manager.off('onTaskAdded', listener);
      
      manager.addTask({ title: '测试' });
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('边界情况', () => {
    test('应该支持按标签过滤', () => {
      manager.addTask({ title: '工作1', tags: ['工作'] });
      manager.addTask({ title: '工作2', tags: ['工作', '紧急'] });
      manager.addTask({ title: '个人', tags: ['个人'] });
      
      const workTasks = manager.filterTasks({ tags: ['工作'] });
      expect(workTasks.length).toBe(2);
    });

    test('应该支持按创建时间排序', () => {
      const task1 = manager.addTask({ title: '任务1' });
      const task2 = manager.addTask({ title: '任务2' });
      
      const sorted = manager.sortTasks(manager.getAllTasks(), 'createdAt', 'asc');
      expect(sorted[0].id).toBe(task1.id);
      expect(sorted[1].id).toBe(task2.id);
    });

    test('完成任务应该有完成时间', () => {
      const task = manager.addTask({ title: '测试' });
      manager.completeTask(task.id);
      
      const completed = manager.getTask(task.id);
      expect(completed?.completedAt).toBeInstanceOf(Date);
    });
  });
});
