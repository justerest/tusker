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

  private inWorkSince: number = 0;

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

  getSpentTime(): number {
    return this.status === TaskStatus.InWork
      ? this.spentTime + this.getSpentTimeIncrement()
      : this.spentTime;
  }

  getProgress(): number {
    return this.progress;
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

  vacateExecutor(employeeId: Employee['id']): void {
    this.spentTime += this.getSpentTimeIncrement();
    this.inWorkSince = Date.now();
    this.executors.delete(employeeId);
  }

  takeInWork(): void {
    this.changeStatus(TaskStatus.InWork);
    this.inWorkSince = Date.now();
  }

  complete(): void {
    this.changeStatus(TaskStatus.Done);
    this.progress = 100;
    this.spentTime += this.getSpentTimeIncrement();
  }

  snooze(): void {
    this.changeStatus(TaskStatus.Snoozed);
    this.spentTime += this.getSpentTimeIncrement();
  }

  reportProgress(progressReport: ProgressReport): void {
    assert(this.status === TaskStatus.InWork, 'Can not report progress not in work task');
    this.progress = progressReport.progress;
  }

  private getSpentTimeIncrement() {
    return (Date.now() - this.inWorkSince) * this.executors.size;
  }
}
