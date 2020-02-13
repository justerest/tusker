import { Board } from './Board';
import { Project } from '../project/Project';

export interface BoardRepository {
  getById(boardId: Board['id']): Board;
  getAllForProject(projectId: Project['id']): Board[];
  findLastProjectBoard(projectId: Project['id']): Board | undefined;
  save(board: Board): void;
}
