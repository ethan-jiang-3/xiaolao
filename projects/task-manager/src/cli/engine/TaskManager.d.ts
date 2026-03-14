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
export declare class TaskManager {
    private readonly tasks;
    private readonly addedListeners;
    private readonly completedListeners;
    private nextId;
    /**
     * 创建任务并触发新增事件。
     *
     * @param title 任务标题。
     * @param priority 任务优先级。
     * @returns 新建任务的快照。
     * @author 虾老大
     */
    addTask(title: string, priority: TaskPriority): Task;
    /**
     * 根据任务标识删除任务。
     *
     * @param id 任务标识。
     * @returns 删除成功时返回 `true`，否则返回 `false`。
     * @author 虾老大
     */
    deleteTask(id: string): boolean;
    /**
     * 将任务标记为已完成，并在首次完成时触发完成事件。
     *
     * @param id 任务标识。
     * @returns 已完成任务的快照；找不到任务时返回 `null`。
     * @author 虾老大
     */
    completeTask(id: string): Task | null;
    /**
     * 获取单个任务。
     *
     * @param id 任务标识。
     * @returns 任务快照；不存在时返回 `undefined`。
     * @author 虾老大
     */
    getTask(id: string): Task | undefined;
    /**
     * 获取全部任务。
     *
     * @returns 全量任务快照数组。
     * @author 虾老大
     */
    getAllTasks(): Task[];
    /**
     * 按状态筛选任务。
     *
     * @param status 目标状态。
     * @returns 符合条件的任务快照数组。
     * @author 虾老大
     */
    getTasksByStatus(status: TaskStatus): Task[];
    /**
     * 订阅任务新增事件。
     *
     * @param listener 任务新增事件监听器。
     * @returns 用于取消订阅的函数。
     * @author 虾老大
     */
    onTaskAdded(listener: TaskListener): () => void;
    /**
     * 订阅任务完成事件。
     *
     * @param listener 任务完成事件监听器。
     * @returns 用于取消订阅的函数。
     * @author 虾老大
     */
    onTaskCompleted(listener: TaskListener): () => void;
    /**
     * 生成新的任务标识。
     *
     * @returns 任务标识。
     * @author 虾老大
     */
    private createTaskId;
    /**
     * 向事件监听器分发任务快照。
     *
     * @param listeners 监听器集合。
     * @param task 事件任务。
     * @author 虾老大
     */
    private emit;
    /**
     * 克隆任务对象，避免外部修改内部状态。
     *
     * @param task 原始任务对象。
     * @returns 任务快照。
     * @author 虾老大
     */
    private cloneTask;
}
//# sourceMappingURL=TaskManager.d.ts.map