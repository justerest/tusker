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
    const project = new Project([board.id]);
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
