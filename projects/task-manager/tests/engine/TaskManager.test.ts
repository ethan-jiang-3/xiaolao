import { Task } from "../../src/engine/Task";
import { TaskManager } from "../../src/engine/TaskManager";

describe("TaskManager", () => {
  it("adds a task and emits the added event", () => {
    const manager = new TaskManager();
    const listener = jest.fn<void, [Task]>();

    manager.onTaskAdded(listener);

    const task = manager.addTask("Implement engine", "high");
    const storedTask = manager.getTask(task.id);

    expect(task.id).toMatch(/^task-\d+$/);
    expect(task.title).toBe("Implement engine");
    expect(task.status).toBe("pending");
    expect(task.priority).toBe("high");
    expect(task.createdAt).toBeInstanceOf(Date);
    expect(task.completedAt).toBeNull();
    expect(storedTask).toEqual(task);
    expect(storedTask).not.toBe(task);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
      id: task.id,
      title: "Implement engine",
      status: "pending",
      priority: "high"
    }));
  });

  it("returns task snapshots so external mutation does not leak in", () => {
    const manager = new TaskManager();
    const task = manager.addTask("Keep immutable", "medium");

    task.title = "Mutated outside";
    task.status = "completed";
    task.completedAt = new Date("2026-03-14T02:00:00.000Z");

    expect(manager.getTask(task.id)).toEqual(expect.objectContaining({
      id: task.id,
      title: "Keep immutable",
      status: "pending",
      priority: "medium",
      completedAt: null
    }));
  });

  it("deletes an existing task and reports missing ids", () => {
    const manager = new TaskManager();
    const task = manager.addTask("Delete me", "low");

    expect(manager.deleteTask(task.id)).toBe(true);
    expect(manager.getTask(task.id)).toBeUndefined();
    expect(manager.deleteTask(task.id)).toBe(false);
    expect(manager.deleteTask("missing")).toBe(false);
  });

  it("completes a task and emits the completed event once", () => {
    const manager = new TaskManager();
    const listener = jest.fn<void, [Task]>();
    const task = manager.addTask("Ship feature", "high");

    manager.onTaskCompleted(listener);

    const completedTask = manager.completeTask(task.id);
    const repeatedCompletion = manager.completeTask(task.id);

    expect(completedTask).toEqual(expect.objectContaining({
      id: task.id,
      status: "completed",
      completedAt: expect.any(Date)
    }));
    expect(repeatedCompletion).toEqual(completedTask);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
      id: task.id,
      status: "completed"
    }));
    expect(manager.getTask(task.id)).toEqual(completedTask);
  });

  it("returns null when completing a missing task", () => {
    const manager = new TaskManager();

    expect(manager.completeTask("missing")).toBeNull();
  });

  it("lists all tasks and filters them by status", () => {
    const manager = new TaskManager();
    const firstTask = manager.addTask("First", "low");
    const secondTask = manager.addTask("Second", "medium");
    const thirdTask = manager.addTask("Third", "high");

    manager.completeTask(secondTask.id);

    const allTasks = manager.getAllTasks();
    const pendingTasks = manager.getTasksByStatus("pending");
    const completedTasks = manager.getTasksByStatus("completed");

    expect(allTasks.map((task) => task.id)).toEqual([
      firstTask.id,
      secondTask.id,
      thirdTask.id
    ]);
    expect(pendingTasks.map((task) => task.id)).toEqual([
      firstTask.id,
      thirdTask.id
    ]);
    expect(completedTasks.map((task) => task.id)).toEqual([secondTask.id]);
  });

  it("allows unsubscribing from events", () => {
    const manager = new TaskManager();
    const addedListener = jest.fn<void, [Task]>();
    const completedListener = jest.fn<void, [Task]>();

    const unsubscribeAdded = manager.onTaskAdded(addedListener);
    const unsubscribeCompleted = manager.onTaskCompleted(completedListener);

    manager.addTask("Before unsubscribe", "low");
    const task = manager.addTask("Complete once", "medium");
    manager.completeTask(task.id);

    unsubscribeAdded();
    unsubscribeCompleted();

    const anotherTask = manager.addTask("After unsubscribe", "high");
    manager.completeTask(anotherTask.id);

    expect(addedListener).toHaveBeenCalledTimes(2);
    expect(completedListener).toHaveBeenCalledTimes(1);
  });
});
