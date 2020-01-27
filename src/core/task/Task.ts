import { assert } from '../../utils/assert';
import { Identity } from '../common/Identity';
import { Employee } from '../employee/Employee';
import { ExecutorTracker } from './ExecutorTracker';

export enum TaskStatus {
  Planned = 'Planned',
  InWork = 'InWork',
  Snoozed = 'Snoozed',
  Completed = 'Completed',
}

export class Task {
  private status: TaskStatus = TaskStatus.Planned;
  private executorTracker: ExecutorTracker = new ExecutorTracker();
  private executorId?: Employee['id'];

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
        assert(!this.executorId, 'Can not plane assigned task');
        break;
      }
    }
    this.status = status;
  }

  getSpentTime(): number {
    return this.executorTracker.getSpentTime();
  }

  getSpentTimeFor(employeeId: Employee['id']): number {
    return this.executorTracker.getSpentTimeFor(employeeId);
  }

  getExecutorId(): Employee['id'] | undefined {
    return this.executorId;
  }

  getAllExecutorIds(): Employee['id'][] {
    return this.executorTracker.getAllExecutorIds();
  }

  assignExecutor(employeeId: Employee['id']): void {
    assert(!this.executorId, 'Can not assign second executor on task');
    this.executorId = employeeId;
    this.executorTracker.addExecutor(employeeId);
  }

  vacateExecutor(): void {
    assert(this.status !== TaskStatus.Completed, 'Can not vacate executor of completed task');
    assert(this.executorId, 'Executor not exist');
    if (this.status === TaskStatus.InWork) {
      this.executorTracker.stopTracking(this.executorId);
    }
    this.executorId = undefined;
    if (this.status !== TaskStatus.Planned) {
      this.changeStatus(TaskStatus.Planned);
    }
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
    if (this.executorId) {
      this.executorTracker.stopTracking(this.executorId);
    }
    this.changeStatus(TaskStatus.Completed);
  }
}
