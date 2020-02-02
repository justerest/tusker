import { Task } from '../task/Task';
import { Employee, EmployeeStatus } from './Employee';

describe('EmployeeFree', () => {
  describe('Employee should be in status "Free"', () => {
    it('if user complete work on task and user have no another tasks', () => {
      const task = new Task();
      const employee = new Employee();
      employee.attachTask(task);
      employee.completeTask(task);
      expect(employee.getStatus()).toBe(EmployeeStatus.Free);
    });

    it('if user complete work on task and other tasks are finished', () => {
      const taskId = 1;
      const taskId2 = 2;
      const employee = new Employee();
      employee.attachTask(taskId);
      employee.attachTask(taskId2);
      employee.completeTask(taskId);
      employee.completeTask(taskId2);
      expect(employee.getStatus()).toBe(EmployeeStatus.Free);
    });

    it('if user detach task and user have no another tasks', () => {
      const taskId = 1;
      const employee = new Employee();
      employee.attachTask(taskId);
      employee.detachTask(taskId);
      expect(employee.getStatus()).toBe(EmployeeStatus.Free);
    });

    it('if user detach task and user have no another uncompleted tasks', () => {
      const taskId = 1;
      const taskId2 = 2;
      const employee = new Employee();
      employee.attachTask(taskId);
      employee.attachTask(taskId2);
      employee.completeTask(taskId);
      employee.detachTask(taskId2);
      expect(employee.getStatus()).toBe(EmployeeStatus.Free);
    });
  });

  describe('Employee should not be in status "Free"', () => {
    it('if user complete work on task and user have other tasks', () => {
      const taskId = 1;
      const taskId2 = 2;
      const employee = new Employee();
      employee.attachTask(taskId);
      employee.attachTask(taskId2);
      employee.completeTask(taskId);
      expect(employee.getStatus()).not.toBe(EmployeeStatus.Free);
    });

    it('if user detach task and user have other tasks', () => {
      const taskId = 1;
      const taskId2 = 2;
      const employee = new Employee();
      employee.attachTask(taskId);
      employee.attachTask(taskId2);
      employee.detachTask(taskId);
      expect(employee.getStatus()).not.toBe(EmployeeStatus.Free);
    });
  });
});
