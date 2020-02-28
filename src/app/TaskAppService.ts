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
    if (board.isTaskCompleted(task)) {
      board.cancelTaskCompletion(task);
      this.boardRepository.save(board);
    }
    const currEmployeeTaskId = this.taskManager.getEmployeeWorkingTaskId(employeeId);
    if (currEmployeeTaskId) {
      const currEmployeeTask = this.taskRepository.getById(currEmployeeTaskId);
      this.boardRepository
        .getById(currEmployeeTask.boardId)
        .stopWorkOnTask(employeeId, currEmployeeTask);
    }
    board.startWorkOnTask(employeeId, task);
  }

  @Transactional()
  snoozeTask(taskId: Task['id']): void {
    const task = this.taskRepository.getById(taskId);
    const board = this.boardRepository.getById(task.boardId);
    if (board.isTaskCompleted(task)) {
      board.cancelTaskCompletion(task);
      this.boardRepository.save(board);
    } else {
      board.stopWorkOnTask(task.getExecutorIds()[0], task);
    }
  }

  @Transactional()
  completeTask(taskId: Task['id']): void {
    const task = this.taskRepository.getById(taskId);
    const board = this.boardRepository.getById(task.boardId);
    if (this.taskManager.isTaskInWork(taskId)) {
      board.stopWorkOnTask(task.getExecutorIds()[0], task);
    }
    board.completeTask(task);
    this.boardRepository.save(board);
  }

  @Transactional()
  reportTaskProgress(taskId: Task['id'], progress: number): void {
    const task = this.taskRepository.getById(taskId);
    const taskSpentTime = this.taskManager.getTaskSpentTime(task.id);
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
