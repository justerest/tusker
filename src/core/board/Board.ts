import { Employee } from '../employee/Employee';
import { Task } from '../task/Task';
import { assert } from 'src/utils/assert';
import { Time } from '../task/Time';
import { WorkingTime } from '../employee/WorkingTime';
import { Identity } from '../common/Identity';
import { Project } from '../project/Project';
import { TaskRepository } from '../task/TaskRepository';

export class Board {
  static serialize(board: Board): unknown {
    return {
      ...board,
      employeeWorkingTimeMap: [...board.employeeWorkingTimeMap.entries()].map(([key, value]) => [
        key,
        WorkingTime.serialize(value),
      ]),
    };
  }

  static deserialize(boardSnapshot: any): Board {
    return Object.assign(new Board(boardSnapshot.projectId), boardSnapshot, {
      employeeWorkingTimeMap: new Map(
        boardSnapshot.employeeWorkingTimeMap.map(([key, value]: any) => [
          key,
          WorkingTime.deserialize(value),
        ]),
      ),
    });
  }

  private employeeWorkingTimeMap: Map<Employee['id'], WorkingTime> = new Map();

  private completed = false;

  id: Identity = Identity.generate();
  projectId: Project['id'];

  constructor(projectId: Project['id']) {
    this.projectId = projectId;
  }

  isCompleted(): boolean {
    return this.completed;
  }

  markAsCompleted(taskRepository: TaskRepository): void {
    assert(!this.isEmpty(taskRepository), 'Can not complete empty board');
    this.completed = true;
  }

  isEmpty(taskRepository: TaskRepository): boolean {
    return taskRepository.getAllForBoard(this.id).length === 0;
  }

  addEmployee(employeeId: Employee['id'], workingTime: WorkingTime): void {
    assert(!this.isCompleted());
    this.employeeWorkingTimeMap.set(employeeId, workingTime);
  }

  getEmployeeIds(): Employee['id'][] {
    return [...this.employeeWorkingTimeMap.keys()];
  }

  getEmployeePlannedTime(employeeId: Employee['id']): Time {
    const workingTime = this.getEmployeeWorkingTime(employeeId);
    return workingTime.getAmount();
  }

  getEmployeeSpentTime(employeeId: Employee['id']): Time {
    const workingTime = this.getEmployeeWorkingTime(employeeId);
    return this.completed ? workingTime.getAmount() : workingTime.getTodaySpentTime();
  }

  private getEmployeeWorkingTime(employeeId: Identity): WorkingTime {
    const workingTime = this.employeeWorkingTimeMap.get(employeeId);
    assert(workingTime, 'Employee working time not found');
    return workingTime;
  }

  planeTask(title: string, plannedTime: Time): Task {
    assert(!this.isCompleted());
    const task = new Task();
    task.boardId = this.id;
    task.title = title;
    task.plannedTime = plannedTime;
    return task;
  }

  attachTaskToEmployee(employeeId: Employee['id'], task: Task): void {
    this.assertBoardNotCompleted();
    this.assertEmployeeExist(employeeId);
    this.assertTaskAttachedToBoard(task);
    task.assignExecutor(employeeId);
  }

  private assertBoardNotCompleted(): void {
    assert(!this.isCompleted(), 'Can not work with task of completed board');
  }

  private assertEmployeeExist(employeeId: Identity): void {
    assert(this.employeeWorkingTimeMap.has(employeeId), 'Employee not exist on board');
  }

  private assertTaskAttachedToBoard(task: Task): void {
    assert(Identity.equals(this.id, task.boardId), 'Task not from this board');
  }

  takeTaskInWork(task: Task, taskRepository: TaskRepository): void {
    this.assertBoardNotCompleted();
    this.assertTaskAttachedToBoard(task);
    const employeeId = task.getExecutorId();
    if (employeeId) {
      this.assertEmployeeExist(employeeId);
    }
    task.takeInWork(taskRepository);
  }

  cloneWithWorkingTime(): Board {
    const board = new Board(this.projectId);
    board.employeeWorkingTimeMap = new Map(this.employeeWorkingTimeMap);
    return board;
  }
}
