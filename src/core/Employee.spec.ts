import { Employee } from './Employee';
import { Task } from './Task';

describe('Employee', () => {
  let employee: Employee;

  beforeEach(() => {
    employee = new Employee();
  });

  it('should be created', () => {
    expect(employee).toBeInstanceOf(Employee);
  });

  it('should hold current task', () => {
    const taskId: Task['id'] = 1;
    employee.attachTask(taskId);
    employee.takeTaskInWork(taskId);
    expect(employee.getCurrentTaskId()).toBe(taskId);
  });

  it('should hold attached tasks', () => {
    const taskId: Task['id'] = 1;
    const taskId2: Task['id'] = 2;
    employee.attachTask(taskId);
    employee.attachTask(taskId2);
    expect(employee.getAttachedTaskIds()).toEqual([taskId, taskId2]);
  });

  describe('+attachTask()', () => {});

  describe('+takeTaskInWork()', () => {});

  describe('+detachTask()', () => {
    it('should delete task from attached lists', () => {
      const taskId: Task['id'] = 1;
      employee.attachTask(taskId);
      employee.takeTaskInWork(taskId);
      employee.snoozeCurrentTask();
      employee.detachTask(taskId);
      expect(employee.getAttachedTaskIds()).toEqual([]);
    });

    it('should delete task from current', () => {
      const taskId: Task['id'] = 1;
      employee.attachTask(taskId);
      employee.takeTaskInWork(taskId);
      employee.detachTask(taskId);
      expect(employee.getCurrentTaskId()).toBeUndefined();
    });
  });

  describe('+completeTask()', () => {
    it('should not affect attached task list', () => {
      const taskId: Task['id'] = 1;
      employee.attachTask(taskId);
      employee.takeTaskInWork(taskId);
      employee.snoozeCurrentTask();
      employee.completeTask(taskId);
      expect(employee.getAttachedTaskIds()).toEqual([taskId]);
    });

    it('should delete task from current', () => {
      const taskId: Task['id'] = 1;
      employee.attachTask(taskId);
      employee.takeTaskInWork(taskId);
      employee.completeTask(taskId);
      expect(employee.getCurrentTaskId()).toBeUndefined();
    });
  });
});
