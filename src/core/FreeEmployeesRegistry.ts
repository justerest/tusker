import { Employee } from './employee/Employee';
import { TaskRepository } from './task/TaskRepository';

export class FreeEmployeesRegistry {
  constructor(private taskRepository: TaskRepository) {}

  has(employeeId: Employee['id']): boolean {
    return !this.taskRepository.findWorkingTaskByExecutor(employeeId);
  }
}
