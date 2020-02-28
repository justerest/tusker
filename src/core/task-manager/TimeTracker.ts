import { assert } from 'src/utils/assert';
import { Employee } from '../employee/Employee';
import { Task } from '../task/Task';
import { Time } from '../Time';
import { Period } from './Period';

export class TimeTracker {
  static serialize(timeTracker: TimeTracker): object {
    return { ...timeTracker, spentPeriods: timeTracker.spentPeriods.map(Period.serialize) };
  }

  static deserialize(timeTrackerSnapshot: TimeTracker): TimeTracker {
    return Object.assign(new TimeTracker(), timeTrackerSnapshot, {
      spentPeriods: timeTrackerSnapshot.spentPeriods.map(Period.deserialize),
    });
  }

  private inWorkSince: number = 0;
  private trackingOn: boolean = false;
  private spentPeriods: Period[] = [];

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
    this.spentPeriods.push(Period.since(this.inWorkSince));
  }

  getSpentTime(): Time {
    return Time.fromMs(
      this.getSpentPeriods().reduce((sum, period) => sum + period.getSpentTime().toMs(), 0),
    );
  }

  getSpentPeriods(): Period[] {
    if (this.trackingOn) {
      return this.spentPeriods.concat(Period.since(this.inWorkSince));
    }
    return this.spentPeriods.slice();
  }
}
