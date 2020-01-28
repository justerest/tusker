import { Identity } from '../common/Identity';
import { Task } from '../task/Task';
import { assert } from '../../utils/assert';
import { EventPublisher } from '../common/EventPublisher';
import { EmployeeFree } from './EmployeeFree';
import { EmployeeRest } from './EmployeeRest';

export enum EmployeeStatus {
  Free = 'Free',
  InWork = 'InWork',
  Rest = 'Rest',
}

export class Employee {
  private status: EmployeeStatus = EmployeeStatus.Free;

  private attachedTaskSet: Set<Task['id']> = new Set();
  private currentTaskId?: Task['id'];

  id: Identity;

  name: string = '';

  constructor(id: Identity = Math.random()) {
    this.id = id;
  }

  private changeStatus(status: EmployeeStatus): void {
    assert(this.status !== status, 'Can not change status on same');
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

  getCurrentTaskId(): Task['id'] | undefined {
    return this.currentTaskId;
  }

  getAttachedTaskIds(): Task['id'][] {
    return [...this.attachedTaskSet.values()];
  }

  attachTask(taskId: Task['id']): void {
    assert(!this.attachedTaskSet.has(taskId), 'Task already attached');
    this.attachedTaskSet.add(taskId);
    if (this.status === EmployeeStatus.Free) {
      this.changeStatus(EmployeeStatus.Rest);
    }
  }

  detachTask(taskId: Task['id']): void {
    this.assertTaskAttached(taskId);
    this.attachedTaskSet.delete(taskId);
    this.clearCurrentTaskIfNeeded(taskId);
  }

  private assertTaskAttached(taskId: Task['id']): void {
    assert(this.attachedTaskSet.has(taskId), 'Task not attached');
  }

  private clearCurrentTaskIfNeeded(taskId: Identity): void {
    if (this.isCurrentTaskId(taskId)) {
      this.clearCurrentTask();
    }
    if (!this.attachedTaskSet.size) {
      this.changeStatus(EmployeeStatus.Free);
    }
  }

  private isCurrentTaskId(taskId: Identity) {
    return Identity.equals(taskId, this.currentTaskId);
  }

  private clearCurrentTask() {
    this.currentTaskId = undefined;
    if (this.attachedTaskSet.size) {
      this.changeStatus(EmployeeStatus.Rest);
    }
  }

  takeTaskInWork(taskId: Task['id']): void {
    this.assertTaskAttached(taskId);
    assert(!this.isCurrentTaskId(taskId), 'Task already in work');
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
    this.assertTaskAttached(taskId);
    this.attachedTaskSet.delete(taskId);
    this.clearCurrentTaskIfNeeded(taskId);
  }
}
