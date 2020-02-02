import { Employee, EmployeeStatus } from './Employee';

describe('EmployeeRest', () => {
  describe('Employee should be in status "Rest"', () => {
    it('if user complete work on task and user have another planned/paused tasks', () => {
      const taskId = 1;
      const taskId2 = 2;
      const employee = new Employee();
      employee.attachTask(taskId);
      employee.attachTask(taskId2);
      employee.takeTaskInWork(taskId);
      employee.completeTask(taskId);
      expect(employee.getStatus()).toBe(EmployeeStatus.Rest);
    });

    it('if user attach task and user have no other tasks', () => {
      const taskId = 1;
      const employee = new Employee();
      employee.attachTask(taskId);
      expect(employee.getStatus()).toBe(EmployeeStatus.Rest);
    });

    it('if user snooze task', () => {
      const task = 1;
      const employee = new Employee();
      employee.attachTask(task);
      employee.takeTaskInWork(task);
      employee.snoozeCurrentTask();
      expect(employee.getStatus()).toBe(EmployeeStatus.Rest);
    });
  });

  describe('Employee should not be in status "Rest"', () => {
    it('if user complete work on task and user have no other tasks', () => {
      const taskId = 1;
      const employee = new Employee();
      employee.attachTask(taskId);
      employee.completeTask(taskId);
      expect(employee.getStatus()).not.toBe(EmployeeStatus.Rest);
    });

    it('if user detach last task and have completed task', () => {
      const taskId = 1;
      const taskId2 = 2;
      const employee = new Employee();
      employee.attachTask(taskId);
      employee.takeTaskInWork(taskId);
      employee.attachTask(taskId2);
      employee.completeTask(taskId2);
      employee.detachTask(taskId);
      expect(employee.getStatus()).not.toBe(EmployeeStatus.Rest);
    });
  });
});
