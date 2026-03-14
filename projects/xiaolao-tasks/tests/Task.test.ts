/**
 * Task 类单元测试
 * @虾算盘
 */

import { Task } from '../src/engine/Task';

describe('Task', () => {
  describe('constructor', () => {
    it('应该创建默认任务', () => {
      const task = new Task('1', '测试任务');
      
      expect(task.id).toBe('1');
      expect(task.title).toBe('测试任务');
      expect(task.status).toBe('pending');
      expect(task.priority).toBe('medium');
      expect(task.tags).toEqual([]);
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.completedAt).toBeUndefined();
    });

    it('应该创建带所有参数的任务', () => {
      const createdAt = new Date('2024-01-01');
      const task = new Task('2', '高优先级任务', 'pending', 'high', createdAt, undefined, ['工作', '紧急']);
      
      expect(task.priority).toBe('high');
      expect(task.tags).toEqual(['工作', '紧急']);
      expect(task.createdAt).toEqual(createdAt);
    });
  });

  describe('complete', () => {
    it('应该完成任务', () => {
      const task = new Task('1', '测试');
      task.complete();
      
      expect(task.status).toBe('completed');
      expect(task.completedAt).toBeInstanceOf(Date);
    });

    it('已完成任务不应重复完成', () => {
      const task = new Task('1', '测试');
      task.complete();
      const firstCompletedAt = task.completedAt;
      
      task.complete();
      expect(task.completedAt).toBe(firstCompletedAt);
    });
  });

  describe('cancel', () => {
    it('应该取消任务', () => {
      const task = new Task('1', '测试');
      task.cancel();
      
      expect(task.status).toBe('cancelled');
    });

    it('已完成任务不应被取消', () => {
      const task = new Task('1', '测试');
      task.complete();
      task.cancel();
      
      expect(task.status).toBe('completed');
    });
  });

  describe('toJSON / fromJSON', () => {
    it('应该正确序列化和反序列化', () => {
      const original = new Task('1', '测试', 'pending', 'high', new Date('2024-01-01'), undefined, ['标签']);
      const json = original.toJSON();
      const restored = Task.fromJSON(json);
      
      expect(restored.id).toBe(original.id);
      expect(restored.title).toBe(original.title);
      expect(restored.status).toBe(original.status);
      expect(restored.priority).toBe(original.priority);
      expect(restored.tags).toEqual(original.tags);
    });

    it('应该正确处理 completedAt', () => {
      const task = new Task('1', '测试');
      task.complete();
      
      const json = task.toJSON();
      const restored = Task.fromJSON(json);
      
      expect(restored.completedAt).toBeInstanceOf(Date);
      expect(restored.status).toBe('completed');
    });
  });
});
