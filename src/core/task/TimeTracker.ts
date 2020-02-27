import { assert } from '../../utils/assert';

export class TimeTracker {
  private spentTime: number = 0;
  private inWorkSince: number = 0;
  private trackingOn: boolean = false;

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
