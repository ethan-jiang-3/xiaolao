/**
 * TaskManager 单元测试
 * @虾算盘
 */

import { TaskManager } from '../src/engine/TaskManager';
import { Task } from '../src/engine/Task';

describe('TaskManager', () => {
  let manager: TaskManager;

  beforeEach(() => {
    manager = new TaskManager();
  });

  describe('add', () => {
    it('应该添加任务', async () => {
      const task = new Task('1', '测试');
      await manager.add(task);
      
      expect(manager.count).toBe(1);
      expect(manager.get('1')).toBe(task);
    });

    it('应该触发 onTaskAdded 事件', async () => {
      const handler = jest.fn();
      manager.onTaskAdded(handler);
      
      const task = new Task('1', '测试');
      await manager.add(task);
      
      expect(handler).toHaveBeenCalledWith(task);
    });
  });

  describe('remove', () => {
    it('应该删除任务', async () => {
      const task = new Task('1', '测试');
      await manager.add(task);
      
      const result = manager.remove('1');
      
      expect(result).toBe(true);
      expect(manager.count).toBe(0);
    });

    it('删除不存在任务返回 false', () => {
      const result = manager.remove('999');
      expect(result).toBe(false);
    });
  });

  describe('complete', () => {
    it('应该完成任务', async () => {
      const task = new Task('1', '测试');
      await manager.add(task);
      
      const result = await manager.complete('1');
      
      expect(result).toBe(true);
      expect(task.status).toBe('completed');
    });

    it('应该触发 onTaskCompleted 事件', async () => {
      const handler = jest.fn();
      manager.onTaskCompleted(handler);
      
      const task = new Task('1', '测试');
      await manager.add(task);
      await manager.complete('1');
      
      expect(handler).toHaveBeenCalledWith(task);
    });

    it('完成不存在任务返回 false', async () => {
      const result = await manager.complete('999');
      expect(result).toBe(false);
    });

    it('已完成任务不应重复触发事件', async () => {
      const handler = jest.fn();
      manager.onTaskCompleted(handler);
      
      const task = new Task('1', '测试');
      await manager.add(task);
      await manager.complete('1');
      await manager.complete('1'); // 重复完成
      
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('list', () => {
    it('应该列出所有任务', async () => {
      await manager.add(new Task('1', '任务1'));
      await manager.add(new Task('2', '任务2'));
      
      const list = manager.list();
      
      expect(list).toHaveLength(2);
    });
  });

  describe('listByStatus', () => {
    it('应该按状态筛选', async () => {
      const task1 = new Task('1', '任务1');
      const task2 = new Task('2', '任务2');
      await manager.add(task1);
      await manager.add(task2);
      await manager.complete('1');
      
      const completed = manager.listByStatus('completed');
      const pending = manager.listByStatus('pending');
      
      expect(completed).toHaveLength(1);
      expect(pending).toHaveLength(1);
    });
  });

  describe('listByPriority', () => {
    it('应该按优先级筛选', async () => {
      await manager.add(new Task('1', '高', 'pending', 'high'));
      await manager.add(new Task('2', '低', 'pending', 'low'));
      
      const high = manager.listByPriority('high');
      
      expect(high).toHaveLength(1);
      expect(high[0].title).toBe('高');
    });
  });

  describe('listByTag', () => {
    it('应该按标签筛选', async () => {
      await manager.add(new Task('1', '任务1', 'pending', 'medium', new Date(), undefined, ['工作']));
      await manager.add(new Task('2', '任务2', 'pending', 'medium', new Date(), undefined, ['生活']));
      
      const workTasks = manager.listByTag('工作');
      
      expect(workTasks).toHaveLength(1);
      expect(workTasks[0].title).toBe('任务1');
    });
  });

  describe('clear', () => {
    it('应该清空所有任务', async () => {
      await manager.add(new Task('1', '任务1'));
      await manager.add(new Task('2', '任务2'));
      
      manager.clear();
      
      expect(manager.count).toBe(0);
    });
  });
});
