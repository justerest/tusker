import { Employee } from 'src/core/employee/Employee';
import { EmployeeRepository } from 'src/core/employee/EmployeeRepository';
import { Time } from 'src/core/task/Time';
import { Transactional } from './repositories/FileSystemTransactionManager';
import { BoardRepository } from 'src/core/board/BoardRepository';
import { Board } from 'src/core/board/Board';
import { WorkingTime } from 'src/core/employee/WorkingTime';
import { Project } from 'src/core/project/Project';
import { ProjectRepository } from 'src/core/project/ProjectRepository';
import { assert } from 'src/utils/assert';
import { UseCase } from './UseCase';

export class BoardAppService {
  constructor(
    private projectRepository: ProjectRepository,
    private boardRepository: BoardRepository,
    private employeeRepository: EmployeeRepository,
  ) {}

  @UseCase()
  createProjectWithBoard(projectId: Project['id']): Project {
    const project = this.createProject(projectId);
    this.createNextBoard(project.id);
    return project;
  }

  @Transactional()
  private createProject(projectId: Project['id']): Project {
    const project = Project.createProject(projectId, this.projectRepository);
    this.projectRepository.save(project);
    return project;
  }

  @Transactional()
  private createNextBoard(projectId: Project['id']): Board {
    const project = this.projectRepository.getById(projectId);
    const board = project.createBoard(this.boardRepository);
    this.boardRepository.save(board);
    return board;
  }

  @UseCase()
  completeActiveBoardAndCreateNext(projectId: Project['id']): void {
    this.completeLastProjectBoard(projectId);
    this.createNextBoard(projectId);
  }

  @Transactional()
  private completeLastProjectBoard(projectId: Project['id']): void {
    const board = this.boardRepository.findLastProjectBoard(projectId);
    assert(board, 'No boards in project');
    board.markAsCompleted();
    this.boardRepository.save(board);
  }

  @UseCase()
  addEmployee(boardId: Board['id'], name: string, startAtHr: number, endAtHr: number): void {
    const workingTime = new WorkingTime(Time.fromHr(startAtHr), Time.fromHr(endAtHr));
    const employee = this.createEmployee(name, workingTime);
    this.addEmployeeToBoard(boardId, employee, workingTime);
  }

  @Transactional()
  private createEmployee(name: string, workingTime: WorkingTime): Employee {
    const employee = new Employee();
    employee.name = name;
    employee.workingTime = workingTime;
    this.employeeRepository.save(employee);
    return employee;
  }

  @Transactional()
  private addEmployeeToBoard(
    boardId: Board['id'],
    employeeId: Employee['id'],
    workingTime: WorkingTime,
  ): void {
    const board = this.boardRepository.getById(boardId);
    board.addEmployee(employeeId, workingTime);
    this.boardRepository.save(board);
  }
}
