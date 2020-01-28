import { Progress } from './Progress';
import { Task } from './Task';
import { Time } from './Time';
import { restoreTime, spentHour } from 'src/utils/time-mocks';

describe(Progress.name, () => {
  let progress: Progress;
  let workingTask: Task;

  beforeEach(() => {
    workingTask = new Task();
    workingTask.plannedTime = Time.fromHr(2);
    workingTask.assignExecutor(1);
    workingTask.takeInWork();
    progress = new Progress(workingTask);
  });

  afterEach(() => {
    restoreTime();
  });

  it('should be created', () => {
    expect(progress).toBeInstanceOf(Progress);
  });

  it('should return progress of new task in percent', () => {
    expect(progress.getValue()).toBe(0);
  });

  it('should return progress of working task in percent', () => {
    spentHour();
    expect(progress.getValue()).toBe(50);
  });

  it('progress of completed task should be last progress', () => {
    workingTask.complete();
    expect(progress.getValue()).toBe(0);
  });

  it('should calc planned time of overdue task', () => {
    spentHour(2);
    progress.commit(50);
    expect(progress.getPlannedTime().toHr()).toBe(4);
  });

  it('should ignore optimistic planned time', () => {
    spentHour(0.5);
    progress.commit(50);
    expect(progress.getPlannedTime().toHr()).toBe(2);
  });

  it('should calc returns planned time if optimistic overdue', () => {
    spentHour(0.5);
    progress.commit(50);
    spentHour(0.5);
    expect(progress.getPlannedTime().toHr()).toBe(2);
  });

  it('should not calc progress with committed value', () => {
    progress.commit(50);
    expect(progress.getValue()).not.toBe(50);
    expect(progress.getValue()).toBe(0);
  });

  it('should calc progress of overdue task with committed value', () => {
    spentHour(2);
    progress.commit(50);
    spentHour();
    expect(progress.getValue()).toBeLessThanOrEqual(76);
    expect(progress.getValue()).toBeGreaterThanOrEqual(74);
  });

  it('should calc progress of snoozed task with committed value', () => {
    spentHour(2);
    progress.commit(50);
    workingTask.snooze();
    spentHour();
    expect(progress.getValue()).toBeLessThanOrEqual(51);
    expect(progress.getValue()).toBeGreaterThanOrEqual(49);
  });

  describe('+getValue() overdue planned time', () => {
    it('should returns undefined progress of overdue task', () => {
      spentHour(3);
      expect(progress.getValue()).toBe(100);
    });

    it('should returns undefined progress of over overdue task with committed value', () => {
      progress.commit(50);
      spentHour(3);
      expect(progress.getValue()).toBe(100);
    });
  });
});
