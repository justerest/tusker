import { Identity } from '../common/Identity';
import { Board } from '../Board';

export class Project {
  static serialize(project: Project): unknown {
    return { ...project };
  }

  static deserialize(projectSnapshot: any): Project {
    return Object.assign(new Project(projectSnapshot.boardIds), projectSnapshot);
  }

  private boardIds: Board['id'][];
  private activeBoardId: Board['id'];

  id: Identity = Identity.generate();

  constructor(initialBoardIds: [Board['id'], ...Board['id'][]]) {
    this.boardIds = initialBoardIds;
    this.activeBoardId = initialBoardIds[0];
  }

  getActiveBoardId(): Board['id'] {
    return this.activeBoardId;
  }

  getBoardIds(): Board['id'][] {
    return this.boardIds.slice();
  }

  createNextBoard(): Board {
    const board = new Board();
    this.activeBoardId = board.id;
    this.boardIds.push(board.id);
    return board;
  }
}
