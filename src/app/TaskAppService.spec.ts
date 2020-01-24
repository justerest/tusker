import { TaskAppService } from './TaskAppService';
import { InMemoryTaskRepository } from './repositories/InMemoryTaskRepository';
import { InMemoryEmployeeRepository } from './repositories/InMemoryEmployeeRepository';
import { TaskManager } from 'src/core/TaskManager';
import { ProgressReport } from 'src/core/ProgressReport';
import { Employee } from 'src/core/Employee';

const HOUR_IN_MILLISECONDS = 60 * 60 * 1000;

describe('TaskAppService', () => {
  let taskAppService: TaskAppService;

  beforeEach(() => {
    const taskRepository = new InMemoryTaskRepository();
    const employeeRepository = new InMemoryEmployeeRepository();
    const taskManager = new TaskManager(employeeRepository, taskRepository);
    taskAppService = new TaskAppService(taskRepository, employeeRepository, taskManager);
  });

  it('should set progress for task', () => {
    const taskId = taskAppService.createTask();
    const employeeId = 1;
    taskAppService.attachTaskToEmployee(employeeId, taskId);
    taskAppService.takeTaskInWorkBy(employeeId, taskId);
    taskAppService.reportTaskProgress(taskId, new ProgressReport(new Date(), 50));
    expect(taskAppService.getTask(taskId).getProgress()).toBe(50);
  });

  it('progress for completed task should be 100%', () => {
    const taskId = taskAppService.createTask();
    const employeeId = 1;
    taskAppService.attachTaskToEmployee(employeeId, taskId);
    taskAppService.takeTaskInWorkBy(employeeId, taskId);
    taskAppService.completeTask(taskId);
    expect(taskAppService.getTask(taskId).getProgress()).toBe(100);
  });

  it('should calculate spent time for task', () => {
    const taskId = reportHourSpentProgress(1);
    const spentTime = taskAppService.getTask(taskId).getSpentTime();
    expect(spentTime).toBeGreaterThanOrEqual(HOUR_IN_MILLISECONDS);
    expect(spentTime).toBeLessThan(2 * HOUR_IN_MILLISECONDS);
  });

  it('should calculate spent time for employee', () => {
    const employeeId = 1;
    const taskId = reportHourSpentProgress(employeeId);
    const spentTime = taskAppService.getEmployeeSpentTimeForTask(employeeId, taskId);
    expect(spentTime).toBeGreaterThanOrEqual(HOUR_IN_MILLISECONDS);
    expect(spentTime).toBeLessThan(2 * HOUR_IN_MILLISECONDS);
  });

  it('should calculate spent time for new employee', () => {
    const taskId = reportHourSpentProgress(1);
    const secondEmployeeId = 2;
    taskAppService.attachTaskToEmployee(secondEmployeeId, taskId);
    const spentTime = taskAppService.getEmployeeSpentTimeForTask(secondEmployeeId, taskId);
    expect(spentTime).toBe(0);
  });

  it('should calculate spent time for old employee', () => {
    const employeeId = 1;
    const taskId = reportHourSpentProgress(employeeId);
    const secondEmployeeId = 2;
    taskAppService.attachTaskToEmployee(secondEmployeeId, taskId);
    const spentTime = taskAppService.getEmployeeSpentTimeForTask(employeeId, taskId);
    expect(spentTime).toBeGreaterThanOrEqual(HOUR_IN_MILLISECONDS);
    expect(spentTime).toBeLessThan(2 * HOUR_IN_MILLISECONDS);
  });

  function reportHourSpentProgress(employeeId: Employee['id']) {
    const taskId = taskAppService.createTask();
    taskAppService.attachTaskToEmployee(employeeId, taskId);
    taskAppService.takeTaskInWorkBy(employeeId, taskId);
    const date = new Date();
    date.setHours(date.getHours() - 1);
    taskAppService.reportTaskProgress(taskId, new ProgressReport(date, 50));
    return taskId;
  }
});
