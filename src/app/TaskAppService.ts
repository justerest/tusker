import { TaskRepository } from 'src/core/task/TaskRepository';
import { Task } from 'src/core/task/Task';
import { Employee } from 'src/core/employee/Employee';
import { Time } from 'src/core/task/Time';
import { Percent } from 'src/core/task/Percent';
import { Transactional } from './repositories/FileSystemTransactionManager';
import { BoardRepository } from 'src/core/board/BoardRepository';
import { Board } from 'src/core/board/Board';
import { Tag } from 'src/core/tag/Tag';
import { Identity } from 'src/core/common/Identity';
import { UseCase } from './UseCase';

export class TaskAppService {
  constructor(private boardRepository: BoardRepository, private taskRepository: TaskRepository) {}

  @Transactional()
  createTask(boardId: Board['id'], title: string, plannedTimeInHr: number): void {
    const board = this.boardRepository.getById(boardId);
    const task = board.planeTask(title, Time.fromHr(plannedTimeInHr));
    this.taskRepository.save(task);
  }

  @UseCase()
  takeTaskInWorkForce(employeeId: Employee['id'], taskId: Task['id']): void {
    const task = this.taskRepository.getById(taskId);
    const currentEmployeeWorkingTask = this.taskRepository.findWorkingTaskByExecutor(employeeId);
    if (currentEmployeeWorkingTask && !Identity.equals(currentEmployeeWorkingTask.id, task.id)) {
      this.snoozeTaskOrCancelCompletion(currentEmployeeWorkingTask.id);
    }
    this.takeTaskInWorkBy(employeeId, task);
  }

  @Transactional()
  private takeTaskInWorkBy(employeeId: Employee['id'], task: Task): void {
    const board = this.boardRepository.getById(task.boardId);
    const isTaskAttachedToThisEmployee = Identity.equals(employeeId, task.getExecutorId());
    const isTaskAttachedToAnotherEmployee = task.getExecutorId() && !isTaskAttachedToThisEmployee;
    if (isTaskAttachedToAnotherEmployee) {
      task.vacateExecutor();
    }
    if (!isTaskAttachedToThisEmployee) {
      board.attachTaskToEmployee(employeeId, task);
    }
    board.takeTaskInWork(task, this.taskRepository);
    this.taskRepository.save(task);
  }

  @UseCase()
  @Transactional()
  snoozeTaskOrCancelCompletion(taskId: Task['id']): void {
    const task = this.taskRepository.getById(taskId);
    if (task.isCompleted()) {
      task.cancelCompletion();
    } else {
      task.snooze();
    }
    this.taskRepository.save(task);
  }

  @Transactional()
  completeTask(taskId: Task['id']): void {
    const task = this.taskRepository.getById(taskId);
    task.complete();
    this.taskRepository.save(task);
  }

  @Transactional()
  reportTaskProgress(taskId: Task['id'], progress: number): void {
    const task = this.taskRepository.getById(taskId);
    task.commitProgress(Percent.fromInt(progress));
    this.taskRepository.save(task);
  }

  @Transactional()
  setTaskTag(taskId: Task['id'], tagId: Tag['id']): void {
    const task = this.taskRepository.getById(taskId);
    task.setTag(tagId);
    this.taskRepository.save(task);
  }
}
