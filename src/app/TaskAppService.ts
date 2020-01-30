import { TaskRepository } from 'src/core/task/TaskRepository';
import { Task, TaskStatus } from 'src/core/task/Task';
import { Employee } from 'src/core/employee/Employee';
import { EmployeeRepository } from 'src/core/employee/EmployeeRepository';
import { TaskManager } from 'src/core/TaskManager';
import { Time } from 'src/core/task/Time';
import { Percent } from 'src/core/task/Percent';

export class TaskAppService {
  constructor(
    private taskRepository: TaskRepository,
    private employeeRepository: EmployeeRepository,
    private taskManager: TaskManager,
  ) {}

  createTask(title: string, plannedTimeInHr: number): Task['id'] {
    const task = new Task();
    task.title = title;
    task.plannedTime = Time.fromHr(plannedTimeInHr);
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
    if (task.getStatus() === TaskStatus.Completed) {
      this.taskManager.cancelTaskCompletion(task);
    }
    this.taskManager.takeTaskInWorkBy(employee, task);
    this.taskRepository.save(task);
    this.employeeRepository.save(employee);
  }

  snoozeTask(taskId: Task['id']): void {
    const task = this.taskRepository.getById(taskId);
    if (task.getStatus() === TaskStatus.Completed) {
      this.taskManager.cancelTaskCompletion(task);
    } else {
      this.taskManager.snoozeTask(task);
    }
    this.taskRepository.save(task);
  }

  completeTask(taskId: Task['id']): void {
    const task = this.taskRepository.getById(taskId);
    this.taskManager.completeTask(task);
    this.taskRepository.save(task);
  }

  reportTaskProgress(taskId: Task['id'], progress: number): void {
    const task = this.taskRepository.getById(taskId);
    task.commitProgress(Percent.fromInt(progress));
    this.taskRepository.save(task);
  }
}
