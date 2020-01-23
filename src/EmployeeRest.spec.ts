import { EventPublisher } from './common/EventPublisher';
import { EmployeeRest } from './EmployeeRest';
import { Task } from './Task';
import { Employee } from './Employee';

describe('EmployeeRest', () => {
  describe('should be emitted', () => {
    it('if task vacate user and user have another planned/paused tasks', () => {
      const task = new Task(1);
      const task2 = new Task(2);
      const employee = new Employee();
      task.attachEmployee(employee);
      task2.attachEmployee(employee);
      const listener = createListener();
      task.vacateEmployee(employee);
      listener.assertEmitted();
    });

    it('if task attach user and user have no other tasks', () => {
      const listener = createListener();
      const task = new Task();
      const employee = new Employee();
      task.attachEmployee(employee);
      listener.assertEmitted();
    });
  });

  describe('should not be emitted', () => {
    it('if task vacate user and user have no other tasks', () => {
      const task = new Task();
      const employee = new Employee();
      task.attachEmployee(employee);
      const listener = createListener();
      task.vacateEmployee(employee);
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
