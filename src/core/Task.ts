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

interface SpentTimeCounter {
  spentTime: number;
  inWorkSince: number;
  active: boolean;
}

class EmployeeTimeCounter {
  private map: Map<Employee['id'], SpentTimeCounter> = new Map();

  add(employeeId: Employee['id']): void {
    assert(!this.map.has(employeeId), 'Employee already exist');
    this.map.set(employeeId, { spentTime: 0, active: false, inWorkSince: 0 });
  }

  activate(employeeId: Employee['id']): void {
    const params = this.get(employeeId);
    params.active = true;
    params.inWorkSince = Date.now();
  }

  deactivate(employeeId: Employee['id']): void {
    const params = this.get(employeeId);
    if (params.active) {
      params.active = false;
      params.spentTime += Date.now() - params.inWorkSince;
      params.inWorkSince = 0;
    }
  }

  getSpentTime(): number {
    return [...this.map.values()].reduce(
      (res, { spentTime, active, inWorkSince }) =>
        res + spentTime + (active ? Date.now() - inWorkSince : 0),
      0,
    );
  }

  private get(employeeId: Identity): SpentTimeCounter {
    const params = this.map.get(employeeId);
    assert(params, 'Employee not exist');
    return params;
  }
}

export class Task {
  private status: TaskStatus = TaskStatus.Planned;
  private employeeTimeCounter: EmployeeTimeCounter = new EmployeeTimeCounter();
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
    return this.employeeTimeCounter.getSpentTime();
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
    this.employeeTimeCounter.add(employeeId);
  }

  vacateExecutor(): void {
    assert(this.executorId, 'Executor not exist');
    this.employeeTimeCounter.deactivate(this.executorId);
    this.executorId = undefined;
    this.changeStatus(TaskStatus.Planned);
  }

  takeInWork(): void {
    assert(this.executorId, 'Executor not exist');
    this.employeeTimeCounter.activate(this.executorId);
    this.changeStatus(TaskStatus.InWork);
  }

  snooze(): void {
    assert(this.executorId, 'Executor not exist');
    this.employeeTimeCounter.deactivate(this.executorId);
    this.changeStatus(TaskStatus.Snoozed);
  }

  complete(): void {
    this.progress = 100;
    if (this.executorId) {
      this.employeeTimeCounter.deactivate(this.executorId);
    }
    this.changeStatus(TaskStatus.Done);
  }

  reportProgress(progressReport: ProgressReport): void {
    assert(this.status === TaskStatus.InWork, 'Can not report progress not in work task');
    this.progress = progressReport.progress;
  }
}
