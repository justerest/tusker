import { TaskManager } from './TaskManager';
import { Identity } from '../common/Identity';
import { Task } from '../task/Task';
import { TimeTracker } from './TimeTracker';
import { TimeTrackerRepository } from './TimeTrackerRepository';
import { TaskRepository } from '../task/TaskRepository';
import { Employee } from '../employee/Employee';
import { assert } from 'src/utils/assert';
import { nonNullable } from 'src/utils/nonNullable';

describe(TaskManager.name, () => {
  let taskManager: TaskManager;
  let task: Task;

  beforeEach(() => {
    taskManager = new TaskManager(TimeTrackerRepositoryImp.instance, {
      getById: () => task,
      ...({} as any),
    } as TaskRepository);
    task = new Task();
  });

  it('+takeTaskInWork() should save and start timeTracker', () => {
    const employeeId = Identity.generate();
    task.assignExecutor(employeeId);
    taskManager.startWorkOnTask(employeeId, task.id);
    const timeTracker = TimeTrackerRepositoryImp.instance.get(employeeId, task.id);
    expect(timeTracker.isTrackingOn()).toBe(true);
  });

  it('+takeTaskInWork() should throw error if task not assigned to employee', () => {
    const employeeId = Identity.generate();
    expect(() => taskManager.startWorkOnTask(employeeId, task.id)).toThrow();
  });

  it('+takeTaskInWork() should throw error if employee is in work', () => {
    const employeeId = Identity.generate();
    task.assignExecutor(employeeId);
    TimeTrackerRepositoryImp.instance.save({ employeeId } as TimeTracker);
    expect(() => taskManager.startWorkOnTask(employeeId, task.id)).toThrow();
  });

  it('+stopWorkOnTask() should save and stop timeTracker', () => {
    const employeeId = Identity.generate();
    task.assignExecutor(employeeId);
    taskManager.startWorkOnTask(employeeId, task.id);
    taskManager.stopWorkOnTask(employeeId, task.id);
    const timeTracker = TimeTrackerRepositoryImp.instance.get(employeeId, task.id);
    expect(timeTracker.isTrackingOn()).toBe(false);
  });

  it('+stopWorkOnTask() should throw error if task not assigned to employee', () => {
    const employeeId = Identity.generate();
    expect(() => taskManager.stopWorkOnTask(employeeId, task.id)).toThrow();
  });

  it('+getTaskSpentTime() should returns Time', () => {
    const time = taskManager.getTaskSpentTime(task.id);
    expect(time.toMs()).toBe(0);
  });
});

class TimeTrackerRepositoryImp implements TimeTrackerRepository {
  static instance: TimeTrackerRepository = new TimeTrackerRepositoryImp();

  private cache: Map<Employee['id'], Map<Task['id'], TimeTracker>> = new Map();

  get(employeeId: Identity, taskId: Identity): TimeTracker {
    const tracker = this.find(employeeId, taskId);
    assert(tracker);
    return tracker;
  }

  find(employeeId: Identity, taskId: Identity): TimeTracker | undefined {
    return this.cache.get(employeeId)?.get(taskId);
  }

  getAllByTask(taskId: Identity): TimeTracker[] {
    return [...this.cache.values()].map((map) => map.get(taskId)).filter(nonNullable);
  }

  getByEmployee(employeeId: Identity): TimeTracker[] {
    return [...(this.cache.get(employeeId)?.values() ?? [])];
  }

  save(timeTracker: TimeTracker): void {
    if (!this.cache.has(timeTracker.employeeId)) {
      this.cache.set(timeTracker.employeeId, new Map());
    }
    this.cache.get(timeTracker.employeeId)!.set(timeTracker.taskId, timeTracker);
  }
}
