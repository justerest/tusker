import { round } from 'lodash';

const SECOND_IN_MILLISECONDS = 1_000;
const MINUTE_IN_MILLISECONDS = 60 * SECOND_IN_MILLISECONDS;
const HOUR_IN_MILLISECONDS = 60 * MINUTE_IN_MILLISECONDS;

export class Time {
  static fromMs(timeInMs: number): Time {
    return new Time(timeInMs);
  }

  private constructor(private time: number) {}

  toHr(): number {
    return round(this.time / HOUR_IN_MILLISECONDS, 2);
  }

  toMin(): number {
    return round(this.time / MINUTE_IN_MILLISECONDS, 2);
  }

  toMs(): number {
    return this.time;
  }
}
