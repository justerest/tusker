import { TaskRepository } from 'src/core/task/TaskRepository';
import { Task } from 'src/core/task/Task';
import { Employee } from 'src/core/employee/Employee';
import { Time } from 'src/core/Time';
import { Percent } from 'src/core/Percent';
import { Transactional } from './repositories/FileSystemTransactionManager';
import { BoardRepository } from 'src/core/board/BoardRepository';
import { Board } from 'src/core/board/Board';
import { Tag } from 'src/core/tag/Tag';
import { TaskManager } from 'src/core/task-manager/TaskManager';
import { Identity } from 'src/core/common/Identity';

export class TaskAppService {
  constructor(
    private boardRepository: BoardRepository,
    private taskRepository: TaskRepository,
    private taskManager: TaskManager,
  ) {}

  @Transactional()
  createTask(boardId: Board['id'], title: string, plannedTimeInHr: number): void {
    const board = this.boardRepository.getById(boardId);
    const task = board.planeTask(title, Time.fromHr(plannedTimeInHr));
    this.taskRepository.save(task);
  }

  @Transactional()
  startWorkOnTask(employeeId: Employee['id'], taskId: Task['id']): void {
    const task = this.taskRepository.getById(taskId);
    if (!task.getExecutorIds().includes(Identity.primary(employeeId))) {
      task.assignExecutor(employeeId);
      this.taskRepository.save(task);
    }
    const board = this.boardRepository.getById(task.boardId);
    if (board.isTaskCompleted(taskId)) {
      board.cancelTaskCompletion(taskId);
      this.boardRepository.save(board);
    }
    board.startWorkOnTask(employeeId, task, this.taskManager);
  }

  @Transactional()
  snoozeTask(taskId: Task['id']): void {
    const task = this.taskRepository.getById(taskId);
    const board = this.boardRepository.getById(task.boardId);
    if (board.isTaskCompleted(taskId)) {
      board.cancelTaskCompletion(taskId);
      this.boardRepository.save(board);
    } else {
      this.taskManager.stopWorkOnTask(task.getExecutorIds()[0], task.id);
    }
  }

  @Transactional()
  completeTask(taskId: Task['id']): void {
    const task = this.taskRepository.getById(taskId);
    const board = this.boardRepository.getById(task.boardId);
    if (this.taskManager.isTaskInWork(taskId)) {
      this.taskManager.stopWorkOnTask(task.getExecutorIds()[0], task.id);
    }
    board.completeTask(task, this.taskManager);
    this.boardRepository.save(board);
  }

  @Transactional()
  reportTaskProgress(taskId: Task['id'], progress: number): void {
    const task = this.taskRepository.getById(taskId);
    const taskSpentTime = this.taskManager.getFullTaskSpentTime(task.id);
    task.setNeededTime(Time.fromMs(taskSpentTime.toMs() / Percent.fromInt(progress).toFloat()));
    this.taskRepository.save(task);
  }

  @Transactional()
  setTaskTag(taskId: Task['id'], tagId: Tag['id']): void {
    const task = this.taskRepository.getById(taskId);
    task.setTag(tagId);
    this.taskRepository.save(task);
  }
}
