import { assert } from '../utils/assert';
import { Identity } from './common/Identity';
import { Employee } from './Employee';

export enum TaskStatus {
  Planned = 'Planned',
  InWork = 'InWork',
  Snoozed = 'Snoozed',
  Done = 'Done',
}

class Tracker {
  private spentTime: number = 0;
  private inWorkSince: number = 0;
  private isTrackingOn: boolean = false;

  startTracking(): void {
    assert(!this.isTrackingOn, 'Tracking already started');
    this.isTrackingOn = true;
    this.inWorkSince = Date.now();
  }

  stopTracking(): void {
    assert(this.isTrackingOn, 'Tracking not started yet');
    this.isTrackingOn = false;
    this.spentTime += this.getSpentTimeIncrement();
  }

  private getSpentTimeIncrement() {
    return Date.now() - this.inWorkSince;
  }

  getSpentTime(): number {
    return this.spentTime + (this.isTrackingOn ? this.getSpentTimeIncrement() : 0);
  }
}

class ExecutorTracker {
  private map: Map<Employee['id'], Tracker> = new Map();

  addExecutor(employeeId: Employee['id']): void {
    assert(!this.map.has(employeeId), 'Employee already exist');
    this.map.set(employeeId, new Tracker());
  }

  startTracking(employeeId: Employee['id']): void {
    this.get(employeeId).startTracking();
  }

  stopTracking(employeeId: Employee['id']): void {
    this.get(employeeId).stopTracking();
  }

  getSpentTime(): number {
    return [...this.map.values()].reduce((res, el) => res + el.getSpentTime(), 0);
  }

  private get(employeeId: Identity): Tracker {
    const params = this.map.get(employeeId);
    assert(params, 'Employee not exist');
    return params;
  }
}

export class Task {
  private status: TaskStatus = TaskStatus.Planned;
  private executorTracker: ExecutorTracker = new ExecutorTracker();
  private executorId?: Employee['id'];
  private progress = 0;

  id: Identity;

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
        assert(this.status !== TaskStatus.Planned, 'Can not snooze Planned task');
        assert(this.executorId, 'Can not snooze not assigned task');
        break;
      }
      case TaskStatus.InWork: {
        assert(this.executorId, 'Can not take in work not assigned task');
        break;
      }
      case TaskStatus.Planned: {
        assert(!this.executorId, 'Can not place assigned task');
        break;
      }
    }
    this.status = status;
  }

  getSpentTime(): number {
    return this.executorTracker.getSpentTime();
  }

  getProgress(): number {
    return this.progress;
  }

  getExecutor(): Employee['id'] | undefined {
    return this.executorId;
  }

  isExecutor(employeeId: Employee['id']) {
    return Identity.equals(employeeId, this.executorId);
  }

  assignExecutor(employeeId: Employee['id']): void {
    this.executorId = employeeId;
    this.executorTracker.addExecutor(employeeId);
  }

  vacateExecutor(): void {
    assert(this.executorId, 'Executor not exist');
    this.executorTracker.stopTracking(this.executorId);
    this.executorId = undefined;
    this.changeStatus(TaskStatus.Planned);
  }

  takeInWork(): void {
    assert(this.executorId, 'Executor not exist');
    this.executorTracker.startTracking(this.executorId);
    this.changeStatus(TaskStatus.InWork);
  }

  snooze(): void {
    assert(this.executorId, 'Executor not exist');
    this.executorTracker.stopTracking(this.executorId);
    this.changeStatus(TaskStatus.Snoozed);
  }

  complete(): void {
    this.progress = 100;
    if (this.executorId) {
      this.executorTracker.stopTracking(this.executorId);
    }
    this.changeStatus(TaskStatus.Done);
  }
}
