import { TaskRepository } from 'src/core/task/TaskRepository';
import { Employee } from 'src/core/employee/Employee';
import { EmployeeRepository } from 'src/core/employee/EmployeeRepository';

export class EmployeeAppService {
  constructor(
    private employeeRepository: EmployeeRepository,
    private taskRepository: TaskRepository,
  ) {}

  createEmployee(name: string): Employee['id'] {
    const employee = new Employee();
    employee.name = name;
    this.employeeRepository.save(employee);
    return employee.id;
  }

  getEmployeeSpentTime(employeeId: Employee['id']): number {
    const tasks = this.taskRepository.getByEmployee(employeeId);
    return tasks
      .map((task) => task.getSpentTimeFor(employeeId))
      .reduce((res, time) => res + time.toMin(), 0);
  }
}
