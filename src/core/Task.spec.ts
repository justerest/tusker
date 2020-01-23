import { Task, TaskStatus } from './Task';
import { Employee } from './Employee';

describe('Task', () => {
  let task: Task;

  beforeEach(() => {
    task = new Task();
  });

  it('should be created', () => {
    expect(task).toBeInstanceOf(Task);
  });

  it('should be created with status Planned', () => {
    expect(task.getStatus()).toBe(TaskStatus.Planned);
  });

  it('should change status to InProgress on start', () => {
    task.takeInWorkBy(new Employee());
    expect(task.getStatus()).toBe(TaskStatus.InProgress);
  });
});
