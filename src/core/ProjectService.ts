import { BoardRepository } from './BoardRepository';
import { Project } from './Project';
import { Board } from './Board';
import { EmployeeRepository } from './employee/EmployeeRepository';
import { assert } from 'src/utils/assert';
import { ProjectRepository } from './ProjectRepository';

export class ProjectService {
  constructor(
    private projectRepository: ProjectRepository,
    private boardRepository: BoardRepository,
    private employeeRepository: EmployeeRepository,
  ) {}

  createProject(projectId: Project['id']): Project {
    assert(!this.projectRepository.exist(projectId), 'Project already exist');
    const board = new Board();
    const project = new Project([board.id]);
    project.id = projectId;
    this.boardRepository.save(board);
    return project;
  }

  createNextBoard(project: Project): void {
    const currentActiveBoard = this.boardRepository.getById(project.getActiveBoardId());
    const employees = this.employeeRepository.getAllForBoard(currentActiveBoard);
    const board = project.createNextBoard();
    currentActiveBoard.markAsCompleted();
    employees.forEach((employee) => board.addEmployee(employee.id, employee.workingTime));
    this.boardRepository.save(currentActiveBoard);
    this.boardRepository.save(board);
  }
}
