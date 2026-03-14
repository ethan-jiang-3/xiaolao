import { TASK_PRIORITIES, TASK_STATUSES, Task } from "../../src/engine/Task";

describe("Task", () => {
  it("exposes the supported task statuses", () => {
    expect(TASK_STATUSES).toEqual(["pending", "completed"]);
  });

  it("exposes the supported task priorities", () => {
    expect(TASK_PRIORITIES).toEqual(["low", "medium", "high"]);
  });

  it("supports a complete task shape", () => {
    const createdAt = new Date("2026-03-14T00:00:00.000Z");
    const completedAt = new Date("2026-03-14T01:00:00.000Z");
    const task: Task = {
      id: "task-1",
      title: "Write tests",
      status: "completed",
      priority: "high",
      createdAt,
      completedAt
    };

    expect(task).toEqual({
      id: "task-1",
      title: "Write tests",
      status: "completed",
      priority: "high",
      createdAt,
      completedAt
    });
  });
});
