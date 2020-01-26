import { EventPublisher } from './common/EventPublisher';
import { EmployeeRest } from './EmployeeRest';
import { Employee } from './Employee';

describe('EmployeeRest', () => {
  describe('should be emitted', () => {
    it('if user complete work on task and user have another planned/paused tasks', () => {
      const taskId = 1;
      const taskId2 = 2;
      const employee = new Employee();
      employee.attachTask(taskId);
      employee.attachTask(taskId2);
      employee.takeTaskInWork(taskId);
      const listener = createListener();
      employee.completeTask(taskId);
      listener.assertEmitted();
    });

    it('if user attach task and user have no other tasks', () => {
      const listener = createListener();
      const taskId = 1;
      const employee = new Employee();
      employee.attachTask(taskId);
      listener.assertEmitted();
    });

    it('if user snooze task', () => {
      const task = 1;
      const employee = new Employee();
      employee.attachTask(task);
      employee.takeTaskInWork(task);
      const listener = createListener();
      employee.snoozeCurrentTask();
      listener.assertEmitted();
    });
  });

  describe('should not be emitted', () => {
    it('if user complete work on task and user have no other tasks', () => {
      const taskId = 1;
      const employee = new Employee();
      employee.attachTask(taskId);
      const listener = createListener();
      employee.completeTask(taskId);
      listener.assertNoEvents();
    });

    it('if user detach last task and have completed task', () => {
      const taskId = 1;
      const taskId2 = 2;
      const employee = new Employee();
      employee.attachTask(taskId);
      employee.takeTaskInWork(taskId);
      employee.attachTask(taskId2);
      employee.completeTask(taskId2);
      const listener = createListener();
      employee.detachTask(taskId);
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
