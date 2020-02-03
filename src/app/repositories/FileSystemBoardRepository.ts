import { FileSystemRepository } from './FileSystemRepository';
import { Board } from 'src/core/Board';
import { BoardRepository } from 'src/core/BoardRepository';

export class FileSystemBoardRepository extends FileSystemRepository<Board>
  implements BoardRepository {
  protected entityName = Board.name;
  protected serialize = Board.serialize;
  protected deserialize = Board.deserialize;
}
