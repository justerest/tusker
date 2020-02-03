import { BoardRepository } from './BoardRepository';
import { Project } from './Project';
import { Board } from './Board';
import { EmployeeRepository } from './employee/EmployeeRepository';

export class ProjectService {
  constructor(
    private boardRepository: BoardRepository,
    private employeeRepository: EmployeeRepository,
  ) {}

  createProject(): Project {
    const board = new Board();
    const project = new Project(board.id);
    this.boardRepository.save(board);
    return project;
  }

  createNextBoard(project: Project): void {
    const board = project.createNextBoard();
    const employees = this.employeeRepository.getAllForBoard(
      this.boardRepository.getById(project.getActiveBoardId()),
    );
    employees.forEach((employee) => board.addEmployee(employee.id, employee.workingTime));
    this.boardRepository.save(board);
  }

  incrementProjectActiveBoard(project: Project): void {
    const board = this.boardRepository.getById(project.getActiveBoardId());
    board.markAsCompleted();
    project.incrementActiveBoard();
    this.boardRepository.save(board);
  }
}
