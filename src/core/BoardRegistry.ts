import { TaskRepository } from './task/TaskRepository';
import { Board } from './Board';

export class BoardRegistry {
  constructor(private taskRepository: TaskRepository) {}

  isBoardEmpty(boardId: Board['id']): boolean {
    return this.taskRepository.getAllForBoard(boardId).length === 0;
  }
}
