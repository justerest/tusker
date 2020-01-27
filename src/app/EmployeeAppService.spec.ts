import { EmployeeAppService } from './EmployeeAppService';
import { InMemoryTaskRepository } from './repositories/InMemoryTaskRepository';
import { InMemoryEmployeeRepository } from './repositories/InMemoryEmployeeRepository';

describe('EmployeeAppService', () => {
  let employeeAppService: EmployeeAppService;

  beforeEach(() => {
    const taskRepository = new InMemoryTaskRepository();
    const employeeRepository = new InMemoryEmployeeRepository();
    employeeAppService = new EmployeeAppService(employeeRepository, taskRepository);
  });

  it('should be created', () => {
    expect(employeeAppService).toBeInstanceOf(EmployeeAppService);
  });
});
