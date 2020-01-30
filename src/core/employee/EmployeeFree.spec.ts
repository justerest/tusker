import { EventPublisher } from '../common/EventPublisher';
import { EmployeeFree } from './EmployeeFree';
import { Task } from '../task/Task';
import { Employee } from './Employee';

describe('EmployeeFree', () => {
  describe('should be emitted', () => {
    it('if user complete work on task and user have no another tasks', () => {
      const listener = createListener();
      const task = new Task();
      const employee = new Employee();
      employee.attachTask(task);
      employee.completeTask(task);
      listener.assertEmitted();
    });

    it('if user complete work on task and other tasks are finished', () => {
      const listener = createListener();
      const taskId = 1;
      const taskId2 = 2;
      const employee = new Employee();
      employee.attachTask(taskId);
      employee.attachTask(taskId2);
      employee.completeTask(taskId);
      employee.completeTask(taskId2);
      listener.assertEmitted();
    });

    it('if user detach task and user have no another tasks', () => {
      const listener = createListener();
      const taskId = 1;
      const employee = new Employee();
      employee.attachTask(taskId);
      employee.detachTask(taskId);
      listener.assertEmitted();
    });

    it('if user detach task and user have no another uncompleted tasks', () => {
      const listener = createListener();
      const taskId = 1;
      const taskId2 = 2;
      const employee = new Employee();
      employee.attachTask(taskId);
      employee.attachTask(taskId2);
      employee.completeTask(taskId);
      employee.detachTask(taskId2);
      listener.assertEmitted();
    });
  });

  describe('should not be emitted', () => {
    it('if user complete work on task and user have other tasks', () => {
      const listener = createListener();
      const taskId = 1;
      const taskId2 = 2;
      const employee = new Employee();
      employee.attachTask(taskId);
      employee.attachTask(taskId2);
      employee.completeTask(taskId);
      listener.assertNoEvents();
    });

    it('if user detach task and user have other tasks', () => {
      const listener = createListener();
      const taskId = 1;
      const taskId2 = 2;
      const employee = new Employee();
      employee.attachTask(taskId);
      employee.attachTask(taskId2);
      employee.detachTask(taskId);
      listener.assertNoEvents();
    });
  });
});

function createListener() {
  const spy = jasmine.createSpy();
  EventPublisher.instance.on(EmployeeFree).subscribe(spy);
  return {
    assertEmitted: () => expect(spy).toHaveBeenCalled(),
    assertNoEvents: () => expect(spy).not.toHaveBeenCalled(),
  };
}
