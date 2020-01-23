import { Task, TaskStatus, TaskCreated } from './Task';
import { EventPublisher } from './common/EventPublisher';

describe('Task', () => {
  let task: Task;

  beforeEach(() => {
    task = new Task();
  });

  it('should be created', () => {
    expect(task).toBeInstanceOf(Task);
  });

  it('should emit TaskCreated on create', () => {
    const spy = jasmine.createSpy();
    EventPublisher.instance.on(TaskCreated).subscribe(spy);
    new Task();
    expect(spy).toHaveBeenCalled();
  });

  it('should be created with status Planned', () => {
    expect(task.getStatus()).toBe(TaskStatus.Planned);
  });

  it('should change status to InProgress on start', () => {
    task.start();
    expect(task.getStatus()).toBe(TaskStatus.InProgress);
  });
});
