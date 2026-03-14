/**
 * Task Manager 集成测试
 * @author 虾老大
 */

import { TaskManager } from '../src/engine/TaskManager';

describe('Task Manager Integration', () => {
  let taskManager: TaskManager;
  let addedTasks: any[] = [];
  let completedTasks: any[] = [];

  beforeEach(() => {
    taskManager = new TaskManager();
    addedTasks = [];
    completedTasks = [];

    taskManager.onTaskAdded((task) => addedTasks.push(task));
    taskManager.onTaskCompleted((task) => completedTasks.push(task));
  });

  test('完整任务生命周期', () => {
    // 添加任务
    const task1 = taskManager.addTask('任务1', 'high');
    const task2 = taskManager.addTask('任务2', 'medium');
    const task3 = taskManager.addTask('任务3', 'low');

    expect(addedTasks.length).toBe(3);
    expect(taskManager.getAllTasks().length).toBe(3);

    // 完成任务
    const completed = taskManager.completeTask(task1.id);
    expect(completed?.status).toBe('completed');
    expect(completedTasks.length).toBe(1);

    // 统计
    const pendingTasks = taskManager.getTasksByStatus('pending');
    const completedTasksList = taskManager.getTasksByStatus('completed');
    expect(pendingTasks.length).toBe(2);
    expect(completedTasksList.length).toBe(1);

    // 删除任务
    const deleted = taskManager.deleteTask(task2.id);
    expect(deleted).toBe(true);
    expect(taskManager.getAllTasks().length).toBe(2);
  });

  test('事件触发顺序', () => {
    const task1 = taskManager.addTask('任务1', 'high');
    const task2 = taskManager.addTask('任务2', 'medium');

    taskManager.completeTask(task1.id);
    taskManager.completeTask(task2.id);

    expect(addedTasks).toHaveLength(2);
    expect(completedTasks).toHaveLength(2);
    expect(addedTasks[0].id).toBe(task1.id);
    expect(completedTasks[0].id).toBe(task1.id);
  });
});

