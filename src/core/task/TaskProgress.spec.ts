import { Task } from './Task';
import { Time } from './Time';
import { restoreTime, spentHour } from 'src/utils/time-mocks';
import { Percent } from './Percent';
import { TaskRepository } from './TaskRepository';

describe('Task Progress', () => {
  let workingTask: Task;
  let taskRepository: TaskRepository;

  function getProgress(): number {
    return Math.min(
      Math.floor((workingTask.getSpentTime().toMs() / workingTask.getNeededTime().toMs()) * 100),
      100,
    );
  }

  function commitProgress(value: number): void {
    workingTask.commitProgress(Percent.fromInt(value));
  }

  beforeEach(() => {
    workingTask = new Task();
    workingTask.plannedTime = Time.fromHr(2);
    workingTask.assignExecutor(1);
    taskRepository = { findWorkingTaskByExecutor: (_) => undefined } as TaskRepository;
    workingTask.takeInWork(taskRepository);
  });

  afterEach(() => {
    restoreTime();
  });

  it('should return progress of new task in percent', () => {
    expect(getProgress()).toBe(0);
  });

  it('should return progress of working task in percent', () => {
    spentHour();
    expect(getProgress()).toBe(50);
  });

  it('progress of completed task should be last progress', () => {
    workingTask.complete();
    expect(getProgress()).toBe(0);
  });

  it('should calc planned time of overdue task', () => {
    spentHour(2);
    commitProgress(50);
    expect(workingTask.getNeededTime().toHr()).toBe(4);
  });

  it('should ignore optimistic planned time', () => {
    spentHour(0.5);
    commitProgress(50);
    expect(workingTask.getNeededTime().toHr()).toBe(2);
  });

  it('should calc returns planned time if optimistic overdue', () => {
    spentHour(0.5);
    commitProgress(50);
    spentHour(0.5);
    expect(workingTask.getNeededTime().toHr()).toBe(2);
  });

  it('should not calc progress with committed value', () => {
    commitProgress(50);
    expect(getProgress()).not.toBe(50);
    expect(getProgress()).toBe(0);
  });

  it('should calc progress of overdue task with committed value', () => {
    spentHour(2);
    commitProgress(50);
    spentHour();
    expect(getProgress()).toBeLessThanOrEqual(76);
    expect(getProgress()).toBeGreaterThanOrEqual(74);
  });

  it('should calc progress of snoozed task with committed value', () => {
    spentHour(2);
    commitProgress(50);
    workingTask.snooze();
    spentHour();
    expect(getProgress()).toBeLessThanOrEqual(51);
    expect(getProgress()).toBeGreaterThanOrEqual(49);
  });

  describe('+getValue() overdue planned time', () => {
    it('should returns undefined progress of overdue task', () => {
      spentHour(3);
      expect(getProgress()).toBe(100);
    });

    it('should returns undefined progress of over overdue task with committed value', () => {
      commitProgress(50);
      spentHour(3);
      expect(getProgress()).toBe(100);
    });
  });
});
