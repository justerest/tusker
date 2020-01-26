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

  it('should be created', () => {
    expect(taskAppService).toBeInstanceOf(TaskAppService);
  });
});
