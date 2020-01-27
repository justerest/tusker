import { Employee } from './employee/Employee';
import { Task } from './task/Task';
import { assert } from 'src/utils/assert';
import { EmployeeRepository } from './employee/EmployeeRepository';
import { TaskRepository } from './task/TaskRepository';
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
    employee.attachTask(task.id);
    task.assignExecutor(employee.id);
  }

  detachTask(task: Task): void {
    const executorId = task.getExecutorId();
    assert(executorId, 'Task not attached to any executor');
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
    if (!Identity.equals(employee.id, task.getExecutorId())) {
      this.attachTaskToEmployee(employee, task);
    }
    const prevTaskId = employee.getCurrentTaskId();
    if (prevTaskId) {
      const prevTask = this.taskRepository.getById(prevTaskId);
      prevTask.snooze();
      this.taskRepository.save(prevTask);
    }
    employee.takeTaskInWork(task.id);
    task.takeInWork();
  }

  snoozeTask(task: Task): void {
    const executorId = task.getExecutorId();
    if (executorId) {
      const executor = this.employeeRepository.getById(executorId);
      if (Identity.equals(task.id, executor.getCurrentTaskId())) {
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
