import { TaskAppService } from './TaskAppService';
import { InMemoryTaskRepository } from './repositories/InMemoryTaskRepository';
import { InMemoryEmployeeRepository } from './repositories/InMemoryEmployeeRepository';
import { TaskManager } from 'src/core/TaskManager';

describe('TaskAppService', () => {
  let taskAppService: TaskAppService;

  beforeEach(() => {
    const taskRepository = new InMemoryTaskRepository();
    const employeeRepository = new InMemoryEmployeeRepository();
    const taskManager = new TaskManager(employeeRepository, taskRepository);
    taskAppService = new TaskAppService(taskRepository, employeeRepository, taskManager);
  });

  it('progress for completed task should be 100%', () => {
    const taskId = taskAppService.createTask();
    const employeeId = 1;
    taskAppService.attachTaskToEmployee(employeeId, taskId);
    taskAppService.takeTaskInWorkBy(employeeId, taskId);
    taskAppService.completeTask(taskId);
    expect(taskAppService.getTask(taskId).getProgress()).toBe(100);
  });
});
