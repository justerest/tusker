import { Identity } from './common/Identity';
import { Board } from './Board';
import { assert } from 'src/utils/assert';
import { last } from 'lodash';

export class Project {
  static serialize(project: Project): unknown {
    return { ...project };
  }

  static deserialize(projectSnapshot: any): Project {
    return Object.assign(new Project(projectSnapshot.activeBoardId), projectSnapshot);
  }

  private boardIds: Board['id'][];
  private activeBoardId: Board['id'];

  id: Identity = Identity.generate();

  constructor(activeBoardId: Board['id']) {
    this.boardIds = [activeBoardId];
    this.activeBoardId = activeBoardId;
  }

  incrementActiveBoard(): void {
    const next = this.boardIds[this.boardIds.length - 1];
    assert(this.activeBoardId !== next, 'Can not increment active board');
    this.activeBoardId = next;
  }

  getActiveBoardId(): Board['id'] {
    return this.activeBoardId;
  }

  getBoardIds(): Board['id'][] {
    return this.boardIds.slice();
  }

  canCreateNextBoard(): boolean {
    return this.getActiveBoardId() === last(this.boardIds);
  }

  createNextBoard(): Board {
    assert(this.canCreateNextBoard(), 'Can plane only one board after active');
    const board = new Board();
    this.boardIds.push(board.id);
    return board;
  }
}
