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

export class Employee {
  private status: EmployeeStatus = EmployeeStatus.Free;
  private taskSet: Set<Task['id']> = new Set();
  private currentTask?: Task['id'];

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
    return Identity.equals(taskId, this.currentTask);
  }

  private assignCurrentTask(taskId: Identity) {
    this.currentTask = taskId;
    if (this.status !== EmployeeStatus.InWork) {
      this.changeStatus(EmployeeStatus.InWork);
    }
  }

  private clearCurrentTask() {
    this.currentTask = undefined;
    if (this.taskSet.size) {
      this.changeStatus(EmployeeStatus.Rest);
    }
  }

  getCurrentTask(): Task['id'] | undefined {
    return this.currentTask;
  }

  attachTask(taskId: Task['id']): void {
    assert(!this.taskSet.has(taskId), 'Task already attached');
    this.taskSet.add(taskId);
    if (this.status === EmployeeStatus.Free) {
      this.changeStatus(EmployeeStatus.Rest);
    }
  }

  detachTask(taskId: Task['id']): void {
    this.assertTaskAttached(taskId);
    this.taskSet.delete(taskId);
    if (this.isCurrentTask(taskId)) {
      this.clearCurrentTask();
    }
    if (!this.taskSet.size) {
      this.changeStatus(EmployeeStatus.Free);
    }
  }

  takeInWork(taskId: Task['id']): void {
    this.assertTaskAttached(taskId);
    assert(!this.isCurrentTask(taskId), 'Task already in work');
    this.assignCurrentTask(taskId);
  }

  completeTask(taskId: Task['id']): void {
    this.detachTask(taskId);
  }

  snoozeTask(taskId: Task['id']): void {
    this.assertTaskAttached(taskId);
    if (this.isCurrentTask(taskId)) {
      this.clearCurrentTask();
    }
  }

  private assertTaskAttached(taskId: Task['id']): void {
    assert(this.taskSet.has(taskId), 'Task not attached');
  }
}
