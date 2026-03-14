/**
 * Task 类 - 任务实体
 * @虾算盘
 */

export type TaskStatus = 'pending' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskData {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  completedAt?: string;
  tags: string[];
}

export class Task {
  constructor(
    public readonly id: string,
    public title: string,
    public status: TaskStatus = 'pending',
    public priority: TaskPriority = 'medium',
    public readonly createdAt: Date = new Date(),
    public completedAt?: Date,
    public tags: string[] = []
  ) {}

  /**
   * 完成任务
   */
  complete(): void {
    if (this.status === 'pending') {
      this.status = 'completed';
      this.completedAt = new Date();
    }
  }

  /**
   * 取消任务
   */
  cancel(): void {
    if (this.status === 'pending') {
      this.status = 'cancelled';
    }
  }

  /**
   * 序列化为 JSON
   */
  toJSON(): TaskData {
    return {
      id: this.id,
      title: this.title,
      status: this.status,
      priority: this.priority,
      createdAt: this.createdAt.toISOString(),
      completedAt: this.completedAt?.toISOString(),
      tags: [...this.tags],
    };
  }

  /**
   * 从 JSON 反序列化
   */
  static fromJSON(data: TaskData): Task {
    return new Task(
      data.id,
      data.title,
      data.status,
      data.priority,
      new Date(data.createdAt),
      data.completedAt ? new Date(data.completedAt) : undefined,
      [...data.tags]
    );
  }
}
