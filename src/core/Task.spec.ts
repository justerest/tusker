import { Task, TaskStatus } from './Task';

const HOUR_IN_MILLISECONDS = 60 * 60 * 1000;

describe('Task', () => {
  let task: Task;
  const employeeId = 1;

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
    task.assignExecutor(employeeId);
    task.takeInWork();
    expect(task.getStatus()).toBe(TaskStatus.InWork);
  });

  describe('+getSpentTime()', () => {
    it('should sum time from work to complete', () => {
      task.assignExecutor(employeeId);
      task.takeInWork();
      spentHour();
      task.complete();
      expect(task.getSpentTime()).toBeGreaterThanOrEqual(HOUR_IN_MILLISECONDS);
    });

    it('should sum time from work to complete with breaks', () => {
      task.assignExecutor(employeeId);
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
      task.assignExecutor(employeeId);
      task.takeInWork();
      spentHour();
      expect(task.getSpentTime()).toBeGreaterThanOrEqual(HOUR_IN_MILLISECONDS);
    });

    it('should calc spent time for two employees', () => {
      const secondEmployeeId = 2;
      task.assignExecutor(employeeId);
      task.takeInWork();
      spentHour();
      task.vacateExecutor();
      task.assignExecutor(secondEmployeeId);
      task.takeInWork();
      spentHour();
      expect(task.getSpentTime()).toBeGreaterThanOrEqual(2 * HOUR_IN_MILLISECONDS);
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
