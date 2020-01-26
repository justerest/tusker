import { Identity } from './common/Identity';
import { Task } from './Task';
import { assert } from '../utils/assert';
import { EventPublisher } from './common/EventPublisher';
import { EmployeeFree } from './EmployeeFree';
import { EmployeeRest } from './EmployeeRest';

export enum EmployeeStatus {
  Free = 'Free',
  InWork = 'InWork',
  Rest = 'Rest',
}

class TaskHolder {
  private map: Map<Task['id'], number> = new Map();
  private completedTaskSet: Set<Task['id']> = new Set();

  get size(): number {
    return this.map.size - this.completedTaskSet.size;
  }

  constructor() {}

  hasNotCompleted(taskId: Task['id']): boolean {
    return this.map.has(taskId) && !this.completedTaskSet.has(taskId);
  }

  add(taskId: Task['id']): void {
    assert(!this.hasNotCompleted(taskId), 'Task already exist');
    this.map.set(taskId, 0);
    this.completedTaskSet.delete(taskId);
  }

  complete(taskId: Task['id']): void {
    assert(this.hasNotCompleted(taskId), 'Task not exist');
    this.completedTaskSet.add(taskId);
  }
}

export class Employee {
  private status: EmployeeStatus = EmployeeStatus.Free;
  private taskHolder: TaskHolder = new TaskHolder();
  private currentTaskId?: Task['id'];

  id: Identity;

  constructor(id: Identity = 1) {
    this.id = id;
  }

  private changeStatus(status: EmployeeStatus): void {
    assert(this.status !== status);
    switch (status) {
      case EmployeeStatus.Free: {
        EventPublisher.instance.publish(new EmployeeFree(this));
        break;
      }
      case EmployeeStatus.Rest: {
        EventPublisher.instance.publish(new EmployeeRest(this));
        break;
      }
    }
    this.status = status;
  }

  isCurrentTask(taskId: Identity) {
    return Identity.equals(taskId, this.currentTaskId);
  }

  getCurrentTaskId(): Task['id'] | undefined {
    return this.currentTaskId;
  }

  attachTask(taskId: Task['id']): void {
    assert(!this.taskHolder.hasNotCompleted(taskId), 'Task already attached');
    this.taskHolder.add(taskId);
    if (this.status === EmployeeStatus.Free) {
      this.changeStatus(EmployeeStatus.Rest);
    }
  }

  detachTask(taskId: Task['id']): void {
    this.assertTaskAttached(taskId);
    this.taskHolder.complete(taskId);
    if (this.isCurrentTask(taskId)) {
      this.clearCurrentTask();
    }
    if (!this.taskHolder.size) {
      this.changeStatus(EmployeeStatus.Free);
    }
  }

  private assertTaskAttached(taskId: Task['id']): void {
    assert(this.taskHolder.hasNotCompleted(taskId), 'Task not attached');
  }

  private clearCurrentTask() {
    this.currentTaskId = undefined;
    if (this.taskHolder.size) {
      this.changeStatus(EmployeeStatus.Rest);
    }
  }

  takeTaskInWork(taskId: Task['id']): void {
    this.assertTaskAttached(taskId);
    assert(!this.isCurrentTask(taskId), 'Task already in work');
    this.assignCurrentTask(taskId);
  }

  private assignCurrentTask(taskId: Identity) {
    this.currentTaskId = taskId;
    if (this.status !== EmployeeStatus.InWork) {
      this.changeStatus(EmployeeStatus.InWork);
    }
  }

  snoozeCurrentTask(): void {
    assert(this.currentTaskId, 'No current task');
    this.clearCurrentTask();
  }

  completeTask(taskId: Task['id']): void {
    this.detachTask(taskId);
  }
}
