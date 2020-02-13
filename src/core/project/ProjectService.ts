import { BoardRepository } from '../BoardRepository';
import { Project } from './Project';
import { Board } from '../Board';
import { EmployeeRepository } from '../employee/EmployeeRepository';
import { assert } from 'src/utils/assert';
import { ProjectRepository } from './ProjectRepository';
import { TaskRepository } from '../task/TaskRepository';

export class ProjectService {
  constructor(
    private projectRepository: ProjectRepository,
    private boardRepository: BoardRepository,
    private employeeRepository: EmployeeRepository,
    private taskRepository: TaskRepository,
  ) {}

  createProject(projectId: Project['id']): Project {
    assert(!this.projectRepository.exist(projectId), 'Project already exist');
    const project = new Project();
    project.id = projectId;
    return project;
  }

  createNextBoard(projectId: Project['id']): Board {
    const project = this.projectRepository.getById(projectId);
    const board = project.createNextBoard();
    const lastBoard = this.boardRepository.findLastProjectBoard(project.id);
    if (lastBoard) {
      assert(!this.isBoardEmpty(lastBoard), 'Many empty boards in project');
      assert(lastBoard.isCompleted(), 'Many active boards in project');
      const employees = this.employeeRepository.getAllForBoard(lastBoard);
      employees.forEach((employee) => board.addEmployee(employee.id, employee.workingTime));
    }
    return board;
  }

  markBoardAsCompleted(board: Board): void {
    assert(!this.isBoardEmpty(board), 'Can not complete empty board');
    board.markAsCompleted();
  }

  private isBoardEmpty(board: Board) {
    return !this.taskRepository.getAllForBoard(board.id).length;
  }
}
