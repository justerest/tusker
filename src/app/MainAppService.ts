import { TaskRepository } from 'src/core/task/TaskRepository';
import { Task } from 'src/core/task/Task';
import { Employee } from 'src/core/employee/Employee';
import { EmployeeRepository } from 'src/core/employee/EmployeeRepository';
import { Time } from 'src/core/task/Time';
import { Percent } from 'src/core/task/Percent';
import { Transactional } from './repositories/FileSystemTransactionManager';
import { BoardRepository } from 'src/core/BoardRepository';
import { Board } from 'src/core/Board';
import { FreeEmployeesRegistry } from 'src/core/FreeEmployeesRegistry';
import { WorkingTime } from 'src/core/employee/WorkingTime';
import { Project } from 'src/core/project/Project';
import { ProjectRepository } from 'src/core/project/ProjectRepository';
import { ProjectService } from 'src/core/project/ProjectService';
import { Tag } from 'src/core/tag/Tag';
import { assert } from 'src/utils/assert';
import { BoardRegistry } from 'src/core/BoardRegistry';
import { Identity } from 'src/core/common/Identity';

export class MainAppService {
  constructor(
    private projectRepository: ProjectRepository,
    private boardRepository: BoardRepository,
    private taskRepository: TaskRepository,
    private employeeRepository: EmployeeRepository,
    private projectService: ProjectService,
  ) {}

  @UseCase()
  createProjectWithBoard(projectId: Project['id']): Project {
    const project = this.createProject(projectId);
    this.createNextBoard(project.id);
    return project;
  }

  @Transactional()
  private createProject(projectId: Project['id']): Project {
    const project = this.projectService.createProject(projectId);
    this.projectRepository.save(project);
    return project;
  }

  @Transactional()
  private createNextBoard(projectId: Project['id']): Board {
    const board = this.projectService.createNextBoard(
      projectId,
      new BoardRegistry(this.taskRepository),
    );
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
    board.markAsCompleted(new BoardRegistry(this.taskRepository));
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

  @Transactional()
  createTask(boardId: Board['id'], title: string, plannedTimeInHr: number): void {
    const board = this.boardRepository.getById(boardId);
    const task = board.planeTask(title, Time.fromHr(plannedTimeInHr));
    this.taskRepository.save(task);
  }

  @UseCase()
  takeTaskInWorkForce(employeeId: Employee['id'], taskId: Task['id']): void {
    const task = this.taskRepository.getById(taskId);
    const currentEmployeeWorkingTask = this.taskRepository.findWorkingTaskByExecutor(employeeId);
    if (currentEmployeeWorkingTask && currentEmployeeWorkingTask !== task) {
      this.snoozeTaskOrCancelCompletion(currentEmployeeWorkingTask.id);
    }
    this.takeTaskInWorkBy(employeeId, task);
  }

  @Transactional()
  private takeTaskInWorkBy(employeeId: Employee['id'], task: Task): void {
    const board = this.boardRepository.getById(task.boardId);
    const isTaskAttachedToThisEmployee = Identity.equals(employeeId, task.getExecutorId());
    const isTaskAttachedToAnotherEmployee = task.getExecutorId() && !isTaskAttachedToThisEmployee;
    if (isTaskAttachedToAnotherEmployee) {
      task.vacateExecutor();
    }
    if (!isTaskAttachedToThisEmployee) {
      board.attachTaskToEmployee(employeeId, task);
    }
    board.takeTaskInWork(new FreeEmployeesRegistry(this.taskRepository), task);
    this.taskRepository.save(task);
  }

  @UseCase()
  @Transactional()
  snoozeTaskOrCancelCompletion(taskId: Task['id']): void {
    const task = this.taskRepository.getById(taskId);
    if (task.isCompleted()) {
      task.cancelCompletion();
    } else {
      task.snooze();
    }
    this.taskRepository.save(task);
  }

  @Transactional()
  completeTask(taskId: Task['id']): void {
    const task = this.taskRepository.getById(taskId);
    task.complete();
    this.taskRepository.save(task);
  }

  @Transactional()
  reportTaskProgress(taskId: Task['id'], progress: number): void {
    const task = this.taskRepository.getById(taskId);
    task.commitProgress(Percent.fromInt(progress));
    this.taskRepository.save(task);
  }

  @Transactional()
  setTaskTag(taskId: Task['id'], tagId: Tag['id']): void {
    const task = this.taskRepository.getById(taskId);
    task.setTag(tagId);
    this.taskRepository.save(task);
  }
}

function UseCase(): MethodDecorator {
  return () => {};
}
