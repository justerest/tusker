import { assert } from '../utils/assert';
import { Identity } from './common/Identity';
import { Employee } from './Employee';
import { ProgressReport } from './ProgressReport';

export enum TaskStatus {
  Planned = 'Planned',
  InWork = 'InWork',
  Snoozed = 'Snoozed',
  Done = 'Done',
}

export class Task {
  private status: TaskStatus = TaskStatus.Planned;
  private executors: Set<Employee['id']> = new Set();
  private progress = 0;
  private spentTime = 0;

  id: Identity;

  plannedTime!: number;

  constructor(id: Identity = 1) {
    this.id = id;
  }

  getStatus(): TaskStatus {
    return this.status;
  }

  private changeStatus(status: TaskStatus): void {
    assert(this.status !== status, 'Can not change status on same');
    switch (status) {
      case TaskStatus.Snoozed: {
        assert(this.status !== TaskStatus.Planned, 'Can not snooze not Planned task');
        assert(this.executors, 'Can not snooze not assigned task');
        break;
      }
      case TaskStatus.InWork: {
        assert(this.executors, 'Can not take in work not assigned task');
        break;
      }
      case TaskStatus.Planned: {
        assert(!this.executors, 'Can not place assigned task');
        break;
      }
    }
    this.status = status;
  }

  getExecutors(): Set<Employee['id']> {
    return new Set(this.executors);
  }

  isExecutor(employeeId: Employee['id']) {
    return this.executors.has(employeeId);
  }

  assignExecutor(employeeId: Employee['id']): void {
    this.executors.add(employeeId);
  }

  takeInWork(): void {
    this.changeStatus(TaskStatus.InWork);
  }

  complete(): void {
    this.reportProgress(new ProgressReport(new Date(), 100));
    this.changeStatus(TaskStatus.Done);
  }

  snooze(): void {
    this.changeStatus(TaskStatus.Snoozed);
  }

  reportProgress(progressReport: ProgressReport): void {
    assert(this.status === TaskStatus.InWork, 'Can not report progress not in work task');
    this.setSpentTime(Date.now() - progressReport.from.getTime());
    this.progress = progressReport.progress;
  }

  getSpentTime(): number {
    return this.spentTime;
  }

  private setSpentTime(spentTime: number): void {
    if (this.spentTime < spentTime) {
      this.spentTime = spentTime;
    }
  }

  getProgress(): number {
    return this.progress;
  }
}
