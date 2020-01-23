import { EventPublisher } from './common/EventPublisher';
import { EmployeeFree } from './EmployeeFree';
import { Task } from './Task';
import { Employee } from './Employee';

describe('EmployeeFree', () => {
  describe('should be emitted', () => {
    it('if task vacate user and user have no another tasks', () => {
      const listener = createListener();
      const task = new Task();
      const employee = new Employee();
      task.attachEmployee(employee);
      task.vacateEmployee(employee);
      listener.assertEmitted();
    });

    it('if task vacate user and other tasks are finished', () => {
      const listener = createListener();
      const task = new Task(1);
      const task2 = new Task(2);
      const employee = new Employee();
      task.attachEmployee(employee);
      task2.attachEmployee(employee);
      task.vacateEmployee(employee);
      task2.vacateEmployee(employee);
      listener.assertEmitted();
    });

    it('if task finished and user have no another tasks', () => {
      const listener = createListener();
      const task = new Task();
      const employee = new Employee();
      task.attachEmployee(employee);
      task.finish([employee]);
      listener.assertEmitted();
    });
  });

  describe('should not be emitted', () => {
    it('if task vacate user and user have other tasks', () => {
      const listener = createListener();
      const task = new Task(1);
      const task2 = new Task(2);
      const employee = new Employee();
      task.attachEmployee(employee);
      task2.attachEmployee(employee);
      task.vacateEmployee(employee);
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
