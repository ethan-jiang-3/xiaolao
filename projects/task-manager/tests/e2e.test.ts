/**
 * Task Manager 端到端测试
 * @author 虾老大
 */

import { TaskManager } from '../src/engine/TaskManager';

describe('Task Manager E2E', () => {
  test('完整使用流程', () => {
    const manager = new TaskManager();
    const events: string[] = [];

    // 监听事件
    manager.onTaskAdded((t) => events.push(`added:${t.id}`));
    manager.onTaskCompleted((t) => events.push(`completed:${t.id}`));

    // 1. 添加任务
    const task1 = manager.addTask('学习 TypeScript', 'high');
    const task2 = manager.addTask('写测试', 'medium');
    const task3 = manager.addTask('喝咖啡', 'low');

    expect(manager.getAllTasks().length).toBe(3);
    expect(events.filter(e => e.startsWith('added')).length).toBe(3);

    // 2. 完成任务
    manager.completeTask(task1.id);
    manager.completeTask(task2.id);

    expect(manager.getTasksByStatus('completed').length).toBe(2);
    expect(manager.getTasksByStatus('pending').length).toBe(1);
    expect(events.filter(e => e.startsWith('completed')).length).toBe(2);

    // 3. 删除任务
    manager.deleteTask(task3.id);
    expect(manager.getAllTasks().length).toBe(2);

    // 4. 验证最终状态
    expect(manager.getTask(task1.id)?.status).toBe('completed');
    expect(manager.getTask(task2.id)?.status).toBe('completed');
    expect(manager.getTask(task3.id)).toBeUndefined();
  });

  test('边界情况', () => {
    const manager = new TaskManager();

    // 完成不存在的任务
    const result = manager.completeTask('non-existent');
    expect(result).toBeNull();

    // 删除不存在的任务
    const deleted = manager.deleteTask('non-existent');
    expect(deleted).toBe(false);

    // 空任务列表
    expect(manager.getAllTasks()).toEqual([]);
    expect(manager.getTasksByStatus('pending')).toEqual([]);
  });
});
