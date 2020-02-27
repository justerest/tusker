import { Employee } from 'src/core/employee/Employee';
import { EmployeeRepository } from 'src/core/employee/EmployeeRepository';
import { Time } from 'src/core/Time';
import { Transactional } from './repositories/FileSystemTransactionManager';
import { BoardRepository } from 'src/core/board/BoardRepository';
import { Board } from 'src/core/board/Board';
import { WorkingTime } from 'src/core/employee/WorkingTime';
import { Project } from 'src/core/project/Project';
import { ProjectRepository } from 'src/core/project/ProjectRepository';
import { assert } from 'src/utils/assert';

export class BoardAppService {
  constructor(
    private projectRepository: ProjectRepository,
    private boardRepository: BoardRepository,
    private employeeRepository: EmployeeRepository,
  ) {}

  @Transactional()
  createProjectWithBoard(projectId: Project['id']): Project {
    const project = Project.createProject(projectId, this.projectRepository);
    const board = project.createBoard(this.boardRepository);
    this.projectRepository.save(project);
    this.boardRepository.save(board);
    return project;
  }

  @Transactional()
  completeActiveBoardAndCreateNext(projectId: Project['id']): void {
    const prevBoard = this.completeLastProjectBoard(projectId);
		const project = this.projectRepository.getById(projectId);
    const nextBoard = project.createBoard(this.boardRepository);
    this.boardRepository.save(prevBoard);
    this.boardRepository.save(nextBoard);
  }

  private completeLastProjectBoard(projectId: Project['id']): Board {
    const board = this.boardRepository.findLastProjectBoard(projectId);
    assert(board, 'No boards in project');
    board.markAsCompleted();
    return board;
  }

  @Transactional()
  addEmployee(boardId: Board['id'], name: string, startAtHr: number, endAtHr: number): void {
    const workingTime = new WorkingTime(Time.fromHr(startAtHr), Time.fromHr(endAtHr));
    const employee = this.createEmployee(name, workingTime);
    const board = this.boardRepository.getById(boardId);
    board.addEmployee(employee.id, workingTime);
    this.boardRepository.save(board);
    this.employeeRepository.save(employee);
  }

  private createEmployee(name: string, workingTime: WorkingTime): Employee {
    const employee = new Employee();
    employee.name = name;
    employee.workingTime = workingTime;
    return employee;
  }
}
