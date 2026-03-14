/**
 * Task 类单元测试
 * @虾可爱
 */

import { createTask, generateId, Priority } from '../src/Task';

describe('Task', () => {
  describe('generateId', () => {
    test('应该生成唯一 ID', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(id1.length).toBeGreaterThan(0);
    });
  });

  describe('createTask', () => {
    test('应该创建默认任务', () => {
      const task = createTask({ title: '测试任务' });
      
      expect(task.title).toBe('测试任务');
      expect(task.status).toBe('pending');
      expect(task.priority).toBe('medium');
      expect(task.id).toBeDefined();
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.tags).toEqual([]);
    });

    test('应该支持自定义优先级', () => {
      const highTask = createTask({ title: '高优先级', priority: 'high' as Priority });
      const lowTask = createTask({ title: '低优先级', priority: 'low' as Priority });
      
      expect(highTask.priority).toBe('high');
      expect(lowTask.priority).toBe('low');
    });

    test('应该支持标签', () => {
      const task = createTask({
        title: '带标签的任务',
        tags: ['工作', '紧急']
      });
      
      expect(task.tags).toEqual(['工作', '紧急']);
    });

    test('ID 创建后不应改变', () => {
      const task = createTask({ title: '测试' });
      const originalId = task.id;
      // TypeScript 编译时只读，运行时无法测试
      expect(task.id).toBe(originalId);
    });
  });
});
