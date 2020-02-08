import { Board } from './Board';
import { Project } from './project/Project';

export interface BoardRepository {
  getById(boardId: Board['id']): Board;
  getAllForProject(project: Project): Board[];
  save(board: Board): void;
}
