import { Tag } from './Tag';
import { Task } from '../task/Task';
import { Time } from '../task/Time';
import { spentHour, restoreTime } from 'src/utils/time-mocks';

describe('Tag', () => {
  let tag: Tag;

  beforeEach(() => (tag = new Tag()));

  afterEach(() => restoreTime());

  it('should be created', () => {
    expect(tag).toBeInstanceOf(Tag);
  });

  it('should calc spent time of tasks', () => {
    const task = { getSpentTime: () => Time.fromHr(1) } as Task;
    spentHour();
    expect(tag.getSpentTime([task, task]).toMs()).toBe(2 * task.getSpentTime().toMs());
  });

  it('should calc spent time of tasks for the employee', () => {
    const employeeId = 1;
    const task = { getSpentTimeFor: (_: any) => Time.fromHr(1) } as Task;
    spentHour();
    expect(tag.getSpentTimeFor(employeeId, [task, task]).toMs()).toBe(
      2 * task.getSpentTimeFor(employeeId).toMs(),
    );
  });
});
