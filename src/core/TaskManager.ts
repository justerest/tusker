import { Employee } from './Employee';
import { Task } from './Task';
import { ProgressReport } from './ProgressReport';
import { assert } from 'src/utils/assert';
import { EmployeeRepository } from './EmployeeRepository';
import { TaskRepository } from './TaskRepository';

export class TaskManager {
  constructor(
    private employeeRepository: EmployeeRepository,
    private taskRepository: TaskRepository,
  ) {}

  attachTaskToEmployee(employee: Employee, task: Task): void {
    task.assignExecutor(employee.id);
    employee.attachTask(task.id);
  }

  takeTaskInWorkBy(employee: Employee, task: Task): void {
    assert(!employee.isCurrentTask(task.id), 'Task already in work of this employee');
    if (!task.isExecutor(employee.id)) {
      this.attachTaskToEmployee(employee, task);
    }
    const prevTaskId = employee.getCurrentTask();
    employee.takeInWork(task.id);
    if (prevTaskId) {
      const prevTask = this.taskRepository.getById(prevTaskId);
      this.snoozeTaskFor(employee, prevTask);
      this.taskRepository.save(prevTask);
    }
    task.takeInWork();
  }

  snoozeTaskFor(employee: Employee, task: Task): void {
    employee.snoozeTask(task.id);
    if (task.getExecutors().size === 1) {
      task.snooze();
    }
  }

  completeTask(task: Task): void {
    task.complete();
    task.getExecutors().forEach((executorId) => {
      const executor = this.employeeRepository.getById(executorId);
      executor.completeTask(task.id);
      this.employeeRepository.save(executor);
    });
  }

  reportProgress(task: Task, progressReport: ProgressReport): void {
    task.reportProgress(progressReport);
    this.getTaskActiveEmployees(task).forEach((employee) => {
      employee.reportProgressForTask(task.id, progressReport);
      this.employeeRepository.save(employee);
    });
  }

  getTaskActiveEmployees(task: Task): Employee[] {
    const employeeIds = [...task.getExecutors().values()];
    assert(employeeIds.length, 'Task has not executors');
    return employeeIds
      .map((employeeId) => this.employeeRepository.getById(employeeId))
      .filter((employee) => employee.isCurrentTask(task.id));
  }
}
