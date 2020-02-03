import { Board } from './Board';
import { Project } from './Project';

export interface BoardRepository {
  getById(boardId: Board['id']): Board;
  getAllForProject(project: Project): Board[];
  save(board: Board): void;
}
