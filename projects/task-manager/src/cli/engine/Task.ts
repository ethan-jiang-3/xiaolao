/**
 * Task 实体相关类型定义。
 *
 * @author 虾老大
 */

/**
 * 可用的任务状态列表。
 *
 * @author 虾老大
 */
export const TASK_STATUSES = ["pending", "completed"] as const;

/**
 * 任务状态类型。
 *
 * @author 虾老大
 */
export type TaskStatus = (typeof TASK_STATUSES)[number];

/**
 * 可用的任务优先级列表。
 *
 * @author 虾老大
 */
export const TASK_PRIORITIES = ["low", "medium", "high"] as const;

/**
 * 任务优先级类型。
 *
 * @author 虾老大
 */
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

/**
 * 任务对象。
 *
 * @property id 任务唯一标识。
 * @property title 任务标题。
 * @property status 任务状态。
 * @property priority 任务优先级。
 * @property createdAt 任务创建时间。
 * @property completedAt 任务完成时间，未完成时为 `null`。
 * @author 虾老大
 */
export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  completedAt: Date | null;
}
