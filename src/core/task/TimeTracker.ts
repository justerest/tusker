import { assert } from '../../utils/assert';

export class TimeTracker {
  private spentTime: number = 0;
  private inWorkSince: number = 0;
  private isTrackingOn: boolean = false;

  start(): void {
    assert(!this.isTrackingOn, 'Tracking already started');
    this.isTrackingOn = true;
    this.inWorkSince = Date.now();
  }

  stop(): void {
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
