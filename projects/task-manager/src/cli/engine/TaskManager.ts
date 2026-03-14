import { Task, TaskPriority, TaskStatus } from "./Task";

/**
 * 任务事件监听器。
 *
 * @param task 事件关联的任务快照。
 * @author 虾老大
 */
export type TaskListener = (task: Task) => void;

/**
 * 管理任务的核心引擎。
 *
 * @author 虾老大
 */
export class TaskManager {
  private readonly tasks = new Map<string, Task>();

  private readonly addedListeners = new Set<TaskListener>();

  private readonly completedListeners = new Set<TaskListener>();

  private nextId = 1;

  /**
   * 创建任务并触发新增事件。
   *
   * @param title 任务标题。
   * @param priority 任务优先级。
   * @returns 新建任务的快照。
   * @author 虾老大
   */
  public addTask(title: string, priority: TaskPriority): Task {
    const task: Task = {
      id: this.createTaskId(),
      title,
      status: "pending",
      priority,
      createdAt: new Date(),
      completedAt: null
    };

    this.tasks.set(task.id, task);
    this.emit(this.addedListeners, task);

    return this.cloneTask(task);
  }

  /**
   * 根据任务标识删除任务。
   *
   * @param id 任务标识。
   * @returns 删除成功时返回 `true`，否则返回 `false`。
   * @author 虾老大
   */
  public deleteTask(id: string): boolean {
    return this.tasks.delete(id);
  }

  /**
   * 将任务标记为已完成，并在首次完成时触发完成事件。
   *
   * @param id 任务标识。
   * @returns 已完成任务的快照；找不到任务时返回 `null`。
   * @author 虾老大
   */
  public completeTask(id: string): Task | null {
    const currentTask = this.tasks.get(id);

    if (!currentTask) {
      return null;
    }

    if (currentTask.status === "completed") {
      return this.cloneTask(currentTask);
    }

    const completedTask: Task = {
      ...currentTask,
      status: "completed",
      completedAt: new Date()
    };

    this.tasks.set(id, completedTask);
    this.emit(this.completedListeners, completedTask);

    return this.cloneTask(completedTask);
  }

  /**
   * 获取单个任务。
   *
   * @param id 任务标识。
   * @returns 任务快照；不存在时返回 `undefined`。
   * @author 虾老大
   */
  public getTask(id: string): Task | undefined {
    const task = this.tasks.get(id);

    return task ? this.cloneTask(task) : undefined;
  }

  /**
   * 获取全部任务。
   *
   * @returns 全量任务快照数组。
   * @author 虾老大
   */
  public getAllTasks(): Task[] {
    return Array.from(this.tasks.values(), (task) => this.cloneTask(task));
  }

  /**
   * 按状态筛选任务。
   *
   * @param status 目标状态。
   * @returns 符合条件的任务快照数组。
   * @author 虾老大
   */
  public getTasksByStatus(status: TaskStatus): Task[] {
    return this.getAllTasks().filter((task) => task.status === status);
  }

  /**
   * 订阅任务新增事件。
   *
   * @param listener 任务新增事件监听器。
   * @returns 用于取消订阅的函数。
   * @author 虾老大
   */
  public onTaskAdded(listener: TaskListener): () => void {
    this.addedListeners.add(listener);

    return () => {
      this.addedListeners.delete(listener);
    };
  }

  /**
   * 订阅任务完成事件。
   *
   * @param listener 任务完成事件监听器。
   * @returns 用于取消订阅的函数。
   * @author 虾老大
   */
  public onTaskCompleted(listener: TaskListener): () => void {
    this.completedListeners.add(listener);

    return () => {
      this.completedListeners.delete(listener);
    };
  }

  /**
   * 生成新的任务标识。
   *
   * @returns 任务标识。
   * @author 虾老大
   */
  private createTaskId(): string {
    const id = `task-${this.nextId}`;

    this.nextId += 1;

    return id;
  }

  /**
   * 向事件监听器分发任务快照。
   *
   * @param listeners 监听器集合。
   * @param task 事件任务。
   * @author 虾老大
   */
  private emit(listeners: ReadonlySet<TaskListener>, task: Task): void {
    listeners.forEach((listener) => {
      listener(this.cloneTask(task));
    });
  }

  /**
   * 克隆任务对象，避免外部修改内部状态。
   *
   * @param task 原始任务对象。
   * @returns 任务快照。
   * @author 虾老大
   */
  private cloneTask(task: Task): Task {
    return {
      ...task,
      createdAt: new Date(task.createdAt),
      completedAt: task.completedAt ? new Date(task.completedAt) : null
    };
  }
}
