import { BoardRepository } from '../BoardRepository';
import { Project } from './Project';
import { Board } from '../Board';
import { EmployeeRepository } from '../employee/EmployeeRepository';
import { assert } from 'src/utils/assert';
import { ProjectRepository } from './ProjectRepository';
import { BoardRegistry } from '../BoardRegistry';

export class ProjectService {
  constructor(
    private projectRepository: ProjectRepository,
    private boardRepository: BoardRepository,
    private employeeRepository: EmployeeRepository,
  ) {}

  createProject(projectId: Project['id']): Project {
    assert(!this.projectRepository.exist(projectId), 'Project already exist');
    const project = new Project();
    project.id = projectId;
    return project;
  }

  createNextBoard(projectId: Project['id'], boardRegistry: BoardRegistry): Board {
    const project = this.projectRepository.getById(projectId);
    const board = project.createBoard();
    const lastBoard = this.boardRepository.findLastProjectBoard(project.id);
    if (lastBoard) {
      assert(!boardRegistry.isBoardEmpty(lastBoard), 'Many empty boards in project');
      assert(lastBoard.isCompleted(), 'Many active boards in project');
      const employees = this.employeeRepository.getAllForBoard(lastBoard);
      employees.forEach((employee) => board.addEmployee(employee.id, employee.workingTime));
    }
    return board;
  }
}
