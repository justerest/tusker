import { WorkLog } from './WorkLog';
import { Task } from '../task/Task';
import { Identity } from '../common/Identity';
import { spentHour, restoreTime } from 'src/utils/time-mocks';

describe(WorkLog.name, () => {
  let workLog: WorkLog;
  let task: Task;

  beforeEach(() => {
    workLog = new WorkLog();
    task = new Task();
  });

  afterEach(() => restoreTime());

  it('+getSpentTimeForTask()', () => {
    expect(workLog.getSpentTime(task.id).toMs()).toBe(0);
  });

  it('+logWorkStarted() should start tracker', () => {
    const employeeId = Identity.generate();
    task.assignExecutor(employeeId);
    workLog.logWorkStarted(employeeId, task);
    spentHour();
    expect(workLog.getSpentTime(task.id).toHr()).toBe(1);
  });

  it('+logWorkStarted() should throw error if task not assigned to employee', () => {
    const employeeId = Identity.generate();
    expect(() => workLog.logWorkStarted(employeeId, task)).toThrow();
  });

  it('+logWorkStarted() should throw error if employee already in work', () => {
    const employeeId = Identity.generate();
    const task2 = new Task();
    task.assignExecutor(employeeId);
    task2.assignExecutor(employeeId);
    workLog.logWorkStarted(employeeId, task);
    expect(() => workLog.logWorkStarted(employeeId, task2)).toThrow();
  });

  it('+logWorkEnded() should end tracker', () => {
    const employeeId = Identity.generate();
    task.assignExecutor(employeeId);
    workLog.logWorkStarted(employeeId, task);
    spentHour();
    workLog.logWorkEnded(employeeId, task);
    spentHour();
    expect(workLog.getSpentTime(task.id).toHr()).toBe(1);
  });

  it('+stopWorkOnTask() should end tracker', () => {
    const employeeId = Identity.generate();
    task.assignExecutor(employeeId);
    workLog.logWorkStarted(employeeId, task);
    spentHour();
    workLog.stopWorkOnTask(task);
    spentHour();
    expect(workLog.getSpentTime(task.id).toHr()).toBe(1);
  });

  it('+stopWorkOnTask() should end free employee', () => {
    const employeeId = Identity.generate();
    task.assignExecutor(employeeId);
    workLog.logWorkStarted(employeeId, task);
    workLog.stopWorkOnTask(task);
    expect(() => workLog.logWorkStarted(employeeId, task)).not.toThrow();
  });

  it('+logWorkEnded() should throw error if work not started', () => {
    const employeeId = Identity.generate();
    expect(() => workLog.logWorkEnded(employeeId, task)).toThrow();
  });
});
