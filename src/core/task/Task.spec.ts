import { Task } from './Task';
import { restoreTime, spentHour, spentMinutes } from 'src/utils/time-mocks';
import { TaskRepository } from './TaskRepository';

describe('Task', () => {
  let task: Task;
  let taskRepository: TaskRepository;

  beforeEach(() => {
    task = new Task();
    taskRepository = { findWorkingTaskByExecutor: (_) => undefined } as TaskRepository;
  });

  afterEach(() => {
    restoreTime();
  });

  it('should be created', () => {
    expect(task).toBeInstanceOf(Task);
  });

  it('should be created with status Planned', () => {
    expect(task.isPlanned()).toBeTruthy();
  });

  describe(Task.prototype.takeInWork.name, () => {
    it('should change status to InProgress', () => {
      const employeeId = 1;
      task.assignExecutor(employeeId);
      task.takeInWork(taskRepository);
      expect(task.isInWork()).toBeTruthy();
    });
  });

  describe(Task.prototype.getSpentTime.name, () => {
    it('should sum time from work to complete', () => {
      const employeeId = 1;
      task.assignExecutor(employeeId);
      task.takeInWork(taskRepository);
      spentHour();
      task.complete();
      expect(task.getSpentTime().toMin()).toBe(60);
    });

    it('should sum time from work to complete with breaks', () => {
      const employeeId = 1;
      task.assignExecutor(employeeId);
      task.takeInWork(taskRepository);
      spentHour();
      task.snooze();
      spentHour();
      task.takeInWork(taskRepository);
      spentHour();
      task.complete();
      expect(task.getSpentTime().toMin()).toBe(120);
    });

    it('should calc spent time', () => {
      const employeeId = 1;
      task.assignExecutor(employeeId);
      task.takeInWork(taskRepository);
      spentHour();
      expect(task.getSpentTime().toMin()).toBe(60);
    });

    it('should calc spent time for two employees', () => {
      const employeeId = 1;
      const secondEmployeeId = 2;
      task.assignExecutor(employeeId);
      task.takeInWork(taskRepository);
      spentHour();
      task.vacateExecutor();
      task.assignExecutor(secondEmployeeId);
      task.takeInWork(taskRepository);
      spentHour();
      expect(task.getSpentTime().toMin()).toBe(120);
    });
  });

  it('should hold all executors spent time', () => {
    const employeeId = 1;
    const employeeId2 = 2;
    const employeeId3 = 3;
    task.assignExecutor(employeeId);
    task.vacateExecutor();
    task.assignExecutor(employeeId2);
    expect(task.getSpentTimeFor(employeeId).toMin()).toEqual(0);
    expect(task.getSpentTimeFor(employeeId2).toMin()).toEqual(0);
    expect(() => task.getSpentTimeFor(employeeId3)).toThrow();
  });

  it('should hold all executors', () => {
    const employeeId = 1;
    const employeeId2 = 2;
    task.assignExecutor(employeeId);
    task.vacateExecutor();
    task.assignExecutor(employeeId2);
    expect(task.getAllExecutorIds()).toEqual([employeeId, employeeId2]);
  });

  describe(Task.prototype.getSpentTimeFor.name, () => {
    it('should returns executor spent time', () => {
      const employeeId = 1;
      task.assignExecutor(employeeId);
      task.takeInWork(taskRepository);
      spentMinutes(30);
      expect(task.getSpentTimeFor(employeeId).toMin()).toEqual(30);
      expect(task.getSpentTimeFor(employeeId).toHr()).toEqual(0.5);
    });
  });
});
