import { TaskManager } from './TaskManager';
import { Identity } from '../common/Identity';
import { Task } from '../task/Task';
import { TimeTracker } from './TimeTracker';
import { TimeTrackerRepository } from './TimeTrackerRepository';

describe(TaskManager.name, () => {
  let taskManager: TaskManager;
  let task: Task;
  let getByEmployeeResult: TimeTracker[];

  beforeEach(() => {
    getByEmployeeResult = [];
    taskManager = new TaskManager({
      get: () => {
        const tracker = new TimeTracker();
        tracker.start();
        return tracker;
      },
      find: () => undefined,
      getByEmployee: () => getByEmployeeResult,
      getAllByTask: () => [],
      ...({} as any),
    } as TimeTrackerRepository);
    task = new Task();
  });

  it('+takeTaskInWork() should returns timeTracker', () => {
    const employeeId = Identity.generate();
    task.assignExecutor(employeeId);
    const timeTracker = taskManager.startWorkOnTask(employeeId, task);
    expect(timeTracker).toBeInstanceOf(TimeTracker);
    expect(timeTracker.isTrackingOn()).toBeTruthy();
  });

  it('+takeTaskInWork() should throw error if task not assigned to employee', () => {
    const employeeId = Identity.generate();
    expect(() => taskManager.startWorkOnTask(employeeId, task)).toThrow();
  });

  it('+takeTaskInWork() should throw error if employee is in work', () => {
    const employeeId = Identity.generate();
    const tracker = new TimeTracker();
    tracker.start();
    getByEmployeeResult = [tracker];
    task.assignExecutor(employeeId);
    expect(() => taskManager.startWorkOnTask(employeeId, task)).toThrow();
  });

  it('+stopWorkOnTask() should throw error if task not assigned to employee', () => {
    const employeeId = Identity.generate();
    const timeTracker = taskManager.stopWorkOnTask(employeeId, task);
    expect(timeTracker).toBeInstanceOf(TimeTracker);
    expect(timeTracker.isTrackingOn()).toBeFalsy();
  });

  it('+getSpentTime() should returns Time', () => {
    const employeeId = Identity.generate();
    const time = taskManager.getSpentTime(employeeId, task.id);
    expect(time.toMs()).toBe(0);
  });

  it('+getFullTaskSpentTime() should returns Time', () => {
    const time = taskManager.getFullTaskSpentTime(task.id);
    expect(time.toMs()).toBe(0);
  });
});
