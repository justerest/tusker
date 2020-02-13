import { Identity } from '../common/Identity';
import { Board } from '../Board';

export class Project {
  static serialize(project: Project): unknown {
    return { ...project };
  }

  static deserialize(projectSnapshot: any): Project {
    return Object.assign(new Project(), projectSnapshot);
  }

  id: Identity = Identity.generate();

  constructor() {}

  createBoard(): Board {
    return new Board(this.id);
  }
}
