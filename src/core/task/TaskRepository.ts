import { Task } from './Task';
import { Board } from '../board/Board';

export interface TaskRepository {
  getById(id: Task['id']): Task;
  getAllForBoard(boardId: Board['id']): Task[];
  save(task: Task): void;
}
