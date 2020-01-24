import { Task, TaskStatus } from './Task';
import { Employee } from './Employee';

const HOUR_IN_MILLISECONDS = 60 * 60 * 1000;

describe('Task', () => {
  let task: Task;

  beforeEach(() => {
    task = new Task();
  });

  afterEach(() => {
    restoreTime();
  });

  it('should be created', () => {
    expect(task).toBeInstanceOf(Task);
  });

  it('should be created with status Planned', () => {
    expect(task.getStatus()).toBe(TaskStatus.Planned);
  });

  it('should change status to InProgress on start', () => {
    task.assignExecutor(new Employee().id);
    task.takeInWork();
    expect(task.getStatus()).toBe(TaskStatus.InWork);
  });

  describe('+getSpentTime()', () => {
    it('should sum time from work to complete', () => {
      task.assignExecutor(new Employee().id);
      task.takeInWork();
      spentHour();
      task.complete();
      expect(task.getSpentTime()).toBeGreaterThanOrEqual(HOUR_IN_MILLISECONDS);
    });

    it('should sum time from work to complete with breaks', () => {
      task.assignExecutor(new Employee().id);
      task.takeInWork();
      spentHour();
      task.snooze();
      spentHour();
      task.takeInWork();
      spentHour();
      task.complete();
      expect(task.getSpentTime()).toBeGreaterThanOrEqual(2 * HOUR_IN_MILLISECONDS);
      expect(task.getSpentTime()).toBeLessThan(3 * HOUR_IN_MILLISECONDS);
    });

    it('should calc spent time', () => {
      task.assignExecutor(new Employee().id);
      task.takeInWork();
      spentHour();
      expect(task.getSpentTime()).toBeGreaterThanOrEqual(HOUR_IN_MILLISECONDS);
    });

    it('should calc spent time for two employees', () => {
      task.assignExecutor(new Employee(1).id);
      task.assignExecutor(new Employee(2).id);
      task.takeInWork();
      spentHour();
      expect(task.getSpentTime()).toBeGreaterThanOrEqual(2 * HOUR_IN_MILLISECONDS);
    });

    it('should calc spent time for two employees when one vacate', () => {
      task.assignExecutor(new Employee(1).id);
      task.assignExecutor(new Employee(2).id);
      task.takeInWork();
      spentHour();
      task.vacateExecutor(1);
      spentHour();
      expect(task.getSpentTime()).toBeGreaterThanOrEqual(3 * HOUR_IN_MILLISECONDS);
      expect(task.getSpentTime()).toBeLessThan(4 * HOUR_IN_MILLISECONDS);
    });

    it('should calc spent time for two employees with breaks', () => {
      task.assignExecutor(new Employee(1).id);
      task.assignExecutor(new Employee(2).id);
      task.takeInWork();
      spentHour();
      task.snooze();
      spentHour();
      task.takeInWork();
      spentHour();
      task.complete();
      expect(task.getSpentTime()).toBeGreaterThanOrEqual(4 * HOUR_IN_MILLISECONDS);
      expect(task.getSpentTime()).toBeLessThan(5 * HOUR_IN_MILLISECONDS);
    });

    it('should calc spent time for two employees when one snooze', () => {
      task.assignExecutor(new Employee(1).id);
      task.assignExecutor(new Employee(2).id);
      task.takeInWork();
      spentHour();
      task.snooze(); // 1
      spentHour();
      task.takeInWork(); // 1
      spentHour();
      task.complete();
      expect(task.getSpentTime()).toBeGreaterThanOrEqual(5 * HOUR_IN_MILLISECONDS);
      expect(task.getSpentTime()).toBeLessThan(6 * HOUR_IN_MILLISECONDS);
    });
  });
});

const now = Date.now;
function restoreTime(): void {
  Date.now = now;
}

function spentHour(): void {
  Date.now = jasmine.createSpy().and.returnValue(Date.now() + HOUR_IN_MILLISECONDS);
}
