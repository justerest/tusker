import { Employee } from '../employee/Employee';
import { Task } from '../task/Task';
import { assert } from 'src/utils/assert';
import { Time } from '../Time';
import { WorkingTime } from '../employee/WorkingTime';
import { Identity } from '../common/Identity';
import { Project } from '../project/Project';
import { TaskManager } from '../task-manager/TaskManager';
import { TimeTracker } from '../task-manager/TimeTracker';
import { remove } from 'lodash';

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

  private completedTasks: Task['id'][] = [];

  private completed = false;

  id: Identity = Identity.generate();

  projectId: Project['id'];

  constructor(projectId: Project['id']) {
    this.projectId = projectId;
  }

  isCompleted(): boolean {
    return this.completed;
  }

  markAsCompleted(): void {
    assert(!this.isCompleted(), 'Can not complete board twice');
    this.completed = true;
  }

  addEmployee(employeeId: Employee['id'], workingTime: WorkingTime): void {
    this.assertBoardNotCompleted();
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
    this.assertBoardNotCompleted();
    const task = new Task();
    task.boardId = this.id;
    task.title = title;
    task.plannedTime = plannedTime;
    return task;
  }

  private assertBoardNotCompleted(): void {
    assert(!this.isCompleted(), 'Can not work with completed board');
  }

  startWorkOnTask(employeeId: Employee['id'], task: Task, taskManager: TaskManager): TimeTracker {
    this.assertBoardNotCompleted();
    assert(!this.isTaskCompleted(task.id), 'Can not work on completed task');
    return taskManager.startWorkOnTask(employeeId, task);
  }

  isTaskCompleted(taskId: Task['id']): boolean {
    return this.completedTasks.includes(taskId);
  }

  completeTask(task: Task, taskManager: TaskManager): void {
    assert(Identity.equals(task.boardId, this.id), 'Task not from board');
    assert(!this.isTaskCompleted(task.id), 'Task already completed');
    assert(!taskManager.isTaskInWork(task.id), 'Can not complete working task');
    this.completedTasks.push(task.id);
  }

  cancelTaskCompletion(taskId: Task['id']): void {
    assert(this.isTaskCompleted(taskId), 'Task not completed yet');
    remove(this.completedTasks, (id) => Identity.equals(id, taskId));
  }

  cloneWithWorkingTime(): Board {
    const board = new Board(this.projectId);
    board.employeeWorkingTimeMap = new Map(this.employeeWorkingTimeMap);
    return board;
  }
}
