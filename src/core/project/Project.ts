import { Identity } from '../common/Identity';
import { Board } from '../board/Board';
import { assert } from 'src/utils/assert';
import { ProjectRepository } from './ProjectRepository';
import { BoardRepository } from '../board/BoardRepository';

export class Project {
  static createProject(projectId: Project['id'], projectRepository: ProjectRepository): Project {
    assert(!projectRepository.exist(projectId), 'Project already exist');
    const project = new Project();
    project.id = projectId;
    return project;
  }

  static serialize(project: Project): unknown {
    return { ...project };
  }

  static deserialize(projectSnapshot: any): Project {
    return Object.assign(new Project(), projectSnapshot);
  }

  id: Identity = Identity.generate();

  constructor() {}

  createBoard(boardRepository: BoardRepository): Board {
    const lastBoard = boardRepository.findLastProjectBoard(this.id);
    if (lastBoard) {
      assert(!lastBoard.isEmpty(), 'Many empty boards in project');
      assert(lastBoard.isCompleted(), 'Many active boards in project');
      return lastBoard.cloneWithWorkingTime();
    }
    return new Board(this.id);
  }
}
