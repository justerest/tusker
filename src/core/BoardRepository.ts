import { Board } from './Board';

export interface BoardRepository {
  getById(boardId: Board['id']): Board;
  save(board: Board): void;
}
