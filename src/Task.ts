import { assert } from './utils/assert';
import { Identity } from './common/Identity';
import { Employee } from './Employee';

export enum TaskStatus {
  Planned,
  InProgress,
  Snoozed,
  Done,
}

export class Task {
  private status: TaskStatus = TaskStatus.Planned;
  private assignedEmployeeId?: Identity;

  id: Identity;

  constructor(id: Identity = '') {
    this.id = id;
  }

  getStatus(): TaskStatus {
    return this.status;
  }

  takeInWorkBy(employee: Employee): void {
    assert(!this.assignedEmployeeId);
    this.status = TaskStatus.InProgress;
    this.assignedEmployeeId = employee.id;
  }
}
