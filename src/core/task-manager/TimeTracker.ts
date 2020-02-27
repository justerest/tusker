import { assert } from '../../utils/assert';
import { Employee } from '../employee/Employee';
import { Task } from '../task/Task';

export class TimeTracker {
  private spentTime: number = 0;
  private inWorkSince: number = 0;
  private trackingOn: boolean = false;

  employeeId!: Employee['id'];
  taskId!: Task['id'];

  constructor() {}

  isTrackingOn(): boolean {
    return this.trackingOn;
  }

  start(): void {
    assert(!this.trackingOn, 'Tracker already started');
    this.trackingOn = true;
    this.inWorkSince = Date.now();
  }

  stop(): void {
    assert(this.trackingOn, 'Tracker not started yet');
    this.trackingOn = false;
    this.spentTime += this.getSpentTimeIncrement();
  }

  private getSpentTimeIncrement() {
    return Date.now() - this.inWorkSince;
  }

  getSpentTime(): number {
    return this.spentTime + (this.trackingOn ? this.getSpentTimeIncrement() : 0);
  }
}
