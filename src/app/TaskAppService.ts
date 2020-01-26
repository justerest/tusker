import { TaskRepository } from 'src/core/TaskRepository';
import { Task } from 'src/core/Task';
import { Employee } from 'src/core/Employee';
import { EmployeeRepository } from 'src/core/EmployeeRepository';
import { TaskManager } from 'src/core/TaskManager';

export class TaskAppService {
  constructor(
    private taskRepository: TaskRepository,
    private employeeRepository: EmployeeRepository,
    private taskManager: TaskManager,
  ) {}

  createTask(): Task['id'] {
    const task = new Task();
    this.taskRepository.save(task);
    return task.id;
  }

  attachTaskToEmployee(employeeId: Employee['id'], taskId: Task['id']): void {
    const employee = this.employeeRepository.getById(employeeId);
    const task = this.taskRepository.getById(taskId);
    this.taskManager.attachTaskToEmployee(employee, task);
    this.taskRepository.save(task);
    this.employeeRepository.save(employee);
  }

  takeTaskInWorkBy(employeeId: Employee['id'], taskId: Task['id']): void {
    const employee = this.employeeRepository.getById(employeeId);
    const task = this.taskRepository.getById(taskId);
    this.taskManager.takeTaskInWorkBy(employee, task);
    this.taskRepository.save(task);
    this.employeeRepository.save(employee);
  }

  completeTask(taskId: Task['id']): void {
    const task = this.taskRepository.getById(taskId);
    this.taskManager.completeTask(task);
    this.taskRepository.save(task);
  }

  getTask(taskId: Task['id']): Task {
    return this.taskRepository.getById(taskId);
  }

  getEmployeeSpentTimeForTask(employeeId: Employee['id'], taskId: Task['id']): number {
    const employee = this.employeeRepository.getById(employeeId);
    return employee.getSpentTimeForTask(taskId);
  }
}
