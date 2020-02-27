import { round } from 'lodash';

const SECOND_IN_MILLISECONDS = 1_000;
const MINUTE_IN_MILLISECONDS = 60 * SECOND_IN_MILLISECONDS;
const HOUR_IN_MILLISECONDS = 60 * MINUTE_IN_MILLISECONDS;

export class Time {
  static max(...times: Time[]): Time {
    return times.sort((a, b) => b.toMs() - a.toMs())[0];
  }

  static min(...times: Time[]): Time {
    return times.sort((a, b) => a.toMs() - b.toMs())[0];
  }

  static fromMs(timeInMs: number): Time {
    return new Time(timeInMs);
  }

  static fromMin(timeInMin: number): Time {
    return new Time(timeInMin * MINUTE_IN_MILLISECONDS);
  }

  static fromHr(timeInHr: number): Time {
    return new Time(timeInHr * HOUR_IN_MILLISECONDS);
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
