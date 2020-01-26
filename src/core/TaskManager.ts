import { Employee } from './Employee';
import { Task } from './Task';
import { assert } from 'src/utils/assert';
import { EmployeeRepository } from './EmployeeRepository';
import { TaskRepository } from './TaskRepository';
import { Identity } from './common/Identity';

export class TaskManager {
  constructor(
    private employeeRepository: EmployeeRepository,
    private taskRepository: TaskRepository,
  ) {}

  attachTaskToEmployee(employee: Employee, task: Task): void {
    if (task.getExecutorId()) {
      this.detachTask(task);
    }
    task.assignExecutor(employee.id);
    employee.attachTask(task.id);
  }

  detachTask(task: Task): void {
    const executorId = task.getExecutorId();
    assert(executorId, 'Task not attached');
    const executor = this.employeeRepository.getById(executorId);
    executor.detachTask(task.id);
    this.employeeRepository.save(executor);
    task.vacateExecutor();
  }

  takeTaskInWorkBy(employee: Employee, task: Task): void {
    assert(
      !Identity.equals(task.id, employee.getCurrentTaskId()),
      'Task already in work of this employee',
    );
    if (!task.isExecutor(employee.id)) {
      this.attachTaskToEmployee(employee, task);
    }
    const prevTaskId = employee.getCurrentTaskId();
    employee.takeTaskInWork(task.id);
    if (prevTaskId) {
      const prevTask = this.taskRepository.getById(prevTaskId);
      this.snoozeTask(prevTask);
      this.taskRepository.save(prevTask);
    }
    task.takeInWork();
  }

  snoozeTask(task: Task): void {
    const executorId = task.getExecutorId();
    if (executorId) {
      const executor = this.employeeRepository.getById(executorId);
      if (executor.isInWork()) {
        executor.snoozeCurrentTask();
        this.employeeRepository.save(executor);
      }
    }
    task.snooze();
  }

  completeTask(task: Task): void {
    const executorId = task.getExecutorId();
    if (executorId) {
      const executor = this.employeeRepository.getById(executorId);
      executor.completeTask(task.id);
      this.employeeRepository.save(executor);
    }
    task.complete();
  }
}
