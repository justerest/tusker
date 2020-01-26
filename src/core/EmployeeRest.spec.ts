import { EventPublisher } from './common/EventPublisher';
import { EmployeeRest } from './EmployeeRest';
import { Task } from './Task';
import { Employee } from './Employee';

describe('EmployeeRest', () => {
  describe('should be emitted', () => {
    it('if user complete work on task and user have another planned/paused tasks', () => {
      const task = new Task(1);
      const task2 = new Task(2);
      const employee = new Employee();
      employee.attachTask(task);
      employee.attachTask(task2);
      employee.takeTaskInWork(task);
      const listener = createListener();
      employee.completeTask(task);
      listener.assertEmitted();
    });

    it('if user attach task and user have no other tasks', () => {
      const listener = createListener();
      const task = new Task();
      const employee = new Employee();
      employee.attachTask(task);
      listener.assertEmitted();
    });

    it('if user snooze task', () => {
      const task = new Task();
      const employee = new Employee();
      employee.attachTask(task.id);
      employee.takeTaskInWork(task.id);
      const listener = createListener();
      employee.snoozeCurrentTask();
      listener.assertEmitted();
    });
  });

  describe('should not be emitted', () => {
    it('if user complete work on task and user have no other tasks', () => {
      const task = new Task();
      const employee = new Employee();
      employee.attachTask(task);
      const listener = createListener();
      employee.completeTask(task);
      listener.assertNoEvents();
    });
  });
});

function createListener() {
  const spy = jasmine.createSpy();
  EventPublisher.instance.on(EmployeeRest).subscribe(spy);
  return {
    assertEmitted: () => expect(spy).toHaveBeenCalledTimes(1),
    assertNoEvents: () => expect(spy).not.toHaveBeenCalled(),
  };
}
