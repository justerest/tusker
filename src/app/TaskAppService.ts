import { TaskRepository } from 'src/core/task/TaskRepository';
import { Task } from 'src/core/task/Task';
import { Employee } from 'src/core/employee/Employee';
import { Time } from 'src/core/task/Time';
import { Percent } from 'src/core/task/Percent';
import { Transactional } from './repositories/FileSystemTransactionManager';
import { BoardRepository } from 'src/core/board/BoardRepository';
import { Board } from 'src/core/board/Board';
import { Tag } from 'src/core/tag/Tag';

export class TaskAppService {
  constructor(private boardRepository: BoardRepository, private taskRepository: TaskRepository) {}

  @Transactional()
  createTask(boardId: Board['id'], title: string, plannedTimeInHr: number): void {
    const board = this.boardRepository.getById(boardId);
    const task = board.planeTask(title, Time.fromHr(plannedTimeInHr));
    this.taskRepository.save(task);
  }

  @Transactional()
  takeTaskInWork(employeeId: Employee['id'], taskId: Task['id']): void {
    const task = this.taskRepository.getById(taskId);
    const board = this.boardRepository.getById(task.boardId);
    board.takeTaskInWork(employeeId, task);
    this.boardRepository.save(board);
  }

  @Transactional()
  stopWorkOnTask(taskId: Task['id']): void {
    const task = this.taskRepository.getById(taskId);
    const board = this.boardRepository.getById(task.boardId);
    board.stopWorkOnTask(task);
    this.boardRepository.save(board);
  }

  @Transactional()
  completeTask(taskId: Task['id']): void {
    const task = this.taskRepository.getById(taskId);
    // TODO: task.complete();
    this.taskRepository.save(task);
  }

  @Transactional()
  reportTaskProgress(taskId: Task['id'], progress: number): void {
    const task = this.taskRepository.getById(taskId);
    const board = this.boardRepository.getById(task.boardId);
    const taskSpentTime = board.getTaskSpentTime(task);
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
