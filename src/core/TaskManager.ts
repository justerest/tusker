import { Employee } from './employee/Employee';
import { Task } from './task/Task';
import { assert } from 'src/utils/assert';
import { TaskRepository } from './task/TaskRepository';
import { Identity } from './common/Identity';
import { BoardRepository } from './BoardRepository';

export class TaskManager {
  constructor(private taskRepository: TaskRepository, private boardRepository: BoardRepository) {}

  attachTaskToEmployee(employeeId: Employee['id'], task: Task): void {
    this.assertBoardNotCompleted(task);
    if (task.getExecutorId() && !Identity.equals(employeeId, task.getExecutorId())) {
      task.vacateExecutor();
    }
    task.assignExecutor(employeeId);
  }

  takeTaskInWorkBy(employeeId: Employee['id'], task: Task): void {
    this.assertBoardNotCompleted(task);
    assert(!this.taskRepository.findWorkingTaskByExecutor(employeeId), 'Executor busy');
    if (!Identity.equals(employeeId, task.getExecutorId())) {
      this.attachTaskToEmployee(employeeId, task);
    }
    task.takeInWork();
  }

  private assertBoardNotCompleted(task: Task): void {
    assert(
      !this.boardRepository.getById(task.boardId).isCompleted(),
      'Can not work with task of completed board',
    );
  }
}
