import { Employee } from './Employee';
import { Task, TaskStatus } from './Task';

describe('Employee', () => {
  let employee: Employee;
  let task: Task;

  beforeEach(() => {
    employee = new Employee();
    task = new Task();
  });

  describe('Task effects', () => {
    describe('should change status to InWork', () => {
      it('on user take in work', () => {
        employee.takeInWork(task);
        expect(task.getStatus()).toBe(TaskStatus.InWork);
      });
    });

    describe('should change status to Snoozed', () => {
      it('on user snooze task', () => {
        employee.takeInWork(task);
        employee.snoozeTask(task);
        expect(task.getStatus()).toBe(TaskStatus.Snoozed);
      });
    });

    describe('should change status to Done', () => {
      it('on user complete task', () => {
        employee.takeInWork(task);
        employee.completeTask(task);
        expect(task.getStatus()).toBe(TaskStatus.Done);
      });
    });
  });
});
