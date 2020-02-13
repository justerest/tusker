import { FileSystemRepository } from './FileSystemRepository';
import { Board } from 'src/core/board/Board';
import { BoardRepository } from 'src/core/board/BoardRepository';
import { Project } from 'src/core/project/Project';
import { Identity } from 'src/core/common/Identity';
import { last } from 'lodash';

export class FileSystemBoardRepository extends FileSystemRepository<Board>
  implements BoardRepository {
  protected entityName = Board.name;
  protected serialize = Board.serialize;
  protected deserialize = Board.deserialize;

  getAllForProject(projectId: Project['id']): Board[] {
    return this.getAll().filter((board) => Identity.equals(projectId, board.projectId));
  }

  findLastProjectBoard(projectId: Project['id']): Board | undefined {
    return last(this.getAllForProject(projectId));
  }
}
