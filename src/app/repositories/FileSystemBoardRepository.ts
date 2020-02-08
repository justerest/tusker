import { FileSystemRepository } from './FileSystemRepository';
import { Board } from 'src/core/Board';
import { BoardRepository } from 'src/core/BoardRepository';
import { Project } from 'src/core/project/Project';

export class FileSystemBoardRepository extends FileSystemRepository<Board>
  implements BoardRepository {
  protected entityName = Board.name;
  protected serialize = Board.serialize;
  protected deserialize = Board.deserialize;

  getAllForProject(project: Project): Board[] {
    const boardIdSet = new Set(project.getBoardIds());
    return this.getAll().filter((board) => boardIdSet.has(board.id));
  }
}
