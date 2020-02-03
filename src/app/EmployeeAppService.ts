import { TaskRepository } from 'src/core/task/TaskRepository';
import { Employee } from 'src/core/employee/Employee';
import { EmployeeRepository } from 'src/core/employee/EmployeeRepository';
import { WorkingTime } from 'src/core/employee/WorkingTime';
import { Time } from 'src/core/task/Time';
import { Transactional } from './repositories/FileSystemTransactionManager';

export class EmployeeAppService {
  constructor(
    private employeeRepository: EmployeeRepository,
    private taskRepository: TaskRepository,
  ) {}

  @Transactional()
  createEmployee(name: string, startAtHr: number, endAtHr: number): Employee['id'] {
    const employee = new Employee();
    employee.name = name;
    employee.workingTime = new WorkingTime(Time.fromHr(startAtHr), Time.fromHr(endAtHr));
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
