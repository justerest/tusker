import { assert } from '../utils/assert';
import { Identity } from './common/Identity';
import { Employee } from './Employee';

export enum TaskStatus {
  Planned = 'Planned',
  InWork = 'InWork',
  Snoozed = 'Snoozed',
  Done = 'Done',
}

export class Task {
  private status: TaskStatus = TaskStatus.Planned;
  private executorId?: Employee['id'];

  id: Identity;

  constructor(id: Identity = '') {
    this.id = id;
  }

  getStatus(): TaskStatus {
    return this.status;
  }

  getExecutor(): Employee['id'] | undefined {
    return this.executorId;
  }

  assignExecutor(employeeId: Employee['id']): void {
    assert(!this.isCurrentExecutor(employeeId));
    if (this.executorId) {
      this.vacateExecutor();
    }
    this.executorId = employeeId;
  }

  vacateExecutor(): void {
    this.executorId = undefined;
  }

  takeInWork(): void {
    assert(this.executorId);
    this.status = TaskStatus.InWork;
  }

  complete(): void {
    assert(this.status !== TaskStatus.Done);
    this.status = TaskStatus.Done;
  }

  snooze(): void {
    assert([TaskStatus.Done, TaskStatus.InWork].includes(this.status));
    this.status = TaskStatus.Snoozed;
  }

  private isCurrentExecutor(employeeId: Identity) {
    return !!this.executorId && Identity.equals(this.executorId, employeeId);
  }
}
