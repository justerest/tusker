import { Employee } from './Employee';
import { Task } from './Task';
import { assert } from 'src/utils/assert';
import { EmployeeRepository } from './EmployeeRepository';
import { TaskRepository } from './TaskRepository';

export class TaskManager {
  constructor(
    private employeeRepository: EmployeeRepository,
    private taskRepository: TaskRepository,
  ) {}

  attachTaskToEmployee(employee: Employee, task: Task): void {
    if (task.getExecutor()) {
      this.detachTask(task);
    }
    task.assignExecutor(employee.id);
    employee.attachTask(task.id);
  }

  detachTask(task: Task): void {
    const executorId = task.getExecutor();
    assert(executorId, 'Task not attached');
    const executor = this.employeeRepository.getById(executorId);
    executor.detachTask(task.id);
    this.employeeRepository.save(executor);
    task.vacateExecutor();
  }

  takeTaskInWorkBy(employee: Employee, task: Task): void {
    assert(!employee.isCurrentTask(task.id), 'Task already in work of this employee');
    if (!task.isExecutor(employee.id)) {
      this.attachTaskToEmployee(employee, task);
    }
    const prevTaskId = employee.getCurrentTask();
    employee.takeTaskInWork(task.id);
    if (prevTaskId) {
      const prevTask = this.taskRepository.getById(prevTaskId);
      this.snoozeTask(prevTask);
      this.taskRepository.save(prevTask);
    }
    task.takeInWork();
  }

  snoozeTask(task: Task): void {
    const executorId = task.getExecutor();
    if (executorId) {
      const executor = this.employeeRepository.getById(executorId);
      executor.snoozeTask(task.id);
      this.employeeRepository.save(executor);
    }
    task.snooze();
  }

  completeTask(task: Task): void {
    const executorId = task.getExecutor();
    if (executorId) {
      const executor = this.employeeRepository.getById(executorId);
      executor.completeTask(task.id);
      this.employeeRepository.save(executor);
    }
    task.complete();
  }
}
