import { TaskRepository } from 'src/core/task/TaskRepository';
import { Task } from 'src/core/task/Task';
import { Employee } from 'src/core/employee/Employee';
import { EmployeeRepository } from 'src/core/employee/EmployeeRepository';
import { TaskManager } from 'src/core/TaskManager';
import { Time } from 'src/core/task/Time';
import { Percent } from 'src/core/task/Percent';
import { Transactional, MultiTransactional } from './repositories/FileSystemTransactionManager';
import { BoardRepository } from 'src/core/BoardRepository';
import { Board } from 'src/core/Board';
import { WorkingTime } from 'src/core/employee/WorkingTime';
import { Project } from 'src/core/project/Project';
import { ProjectRepository } from 'src/core/project/ProjectRepository';
import { ProjectService } from 'src/core/project/ProjectService';
import { Tag } from 'src/core/tag/Tag';

export class MainAppService {
  constructor(
    private projectRepository: ProjectRepository,
    private boardRepository: BoardRepository,
    private taskRepository: TaskRepository,
    private employeeRepository: EmployeeRepository,
    private taskManager: TaskManager,
    private projectService: ProjectService,
  ) {}

  @Transactional()
  createProject(projectId: Project['id']): Project {
    const project = this.projectService.createProject(projectId);
    this.projectRepository.save(project);
    return project;
  }

  @Transactional()
  createNextBoard(projectId: Project['id']): void {
    const project = this.projectRepository.getById(projectId);
    this.projectService.createNextBoard(project);
    this.projectRepository.save(project);
  }

  @Transactional()
  addEmployee(boardId: Board['id'], name: string, startAtHr: number, endAtHr: number): void {
    const board = this.boardRepository.getById(boardId);
    const workingTime = new WorkingTime(Time.fromHr(startAtHr), Time.fromHr(endAtHr));
    const employee = new Employee();
    employee.name = name;
    employee.workingTime = workingTime;
    board.addEmployee(employee.id, workingTime);
    this.employeeRepository.save(employee);
    this.boardRepository.save(board);
  }

  @Transactional()
  createTask(boardId: Board['id'], title: string, plannedTimeInHr: number): void {
    const board = this.boardRepository.getById(boardId);
    const task = board.planeTask(title, Time.fromHr(plannedTimeInHr));
    this.taskRepository.save(task);
    this.boardRepository.save(board);
  }

  @Transactional()
  attachTaskToEmployee(employeeId: Employee['id'], taskId: Task['id']): void {
    const employee = this.employeeRepository.getById(employeeId);
    const task = this.taskRepository.getById(taskId);
    this.taskManager.attachTaskToEmployee(employee.id, task);
    this.taskRepository.save(task);
  }

  @MultiTransactional()
  takeTaskInWorkForce(employeeId: Employee['id'], taskId: Task['id']): void {
    const employee = this.employeeRepository.getById(employeeId);
    const task = this.taskRepository.getById(taskId);
    const currentEmployeeWorkingTak = this.taskRepository.findWorkingTaskByExecutor(employeeId);
    if (currentEmployeeWorkingTak && currentEmployeeWorkingTak !== task) {
      this.snoozeTaskOrCancelCompletion(currentEmployeeWorkingTak.id);
    }
    if (task.isCompleted()) {
      task.cancelCompletion();
    }
    this.takeTaskInWorkBy(employee, task);
  }

  @Transactional()
  private takeTaskInWorkBy(employee: Employee, task: Task) {
    this.taskManager.takeTaskInWorkBy(employee.id, task);
    this.taskRepository.save(task);
  }

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
