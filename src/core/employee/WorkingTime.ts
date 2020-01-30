import { Time } from '../task/Time';
import { assert } from 'src/utils/assert';

export class WorkingTime {
  startsAt: Time;
  endsAt: Time;

  constructor(startsAt: Time, endsAt: Time) {
    assert(Time.min(startsAt, endsAt) === startsAt, 'Work with timezones not implemented');
    this.startsAt = startsAt;
    this.endsAt = endsAt;
  }

  getAmount(): Time {
    return Time.fromMs(this.endsAt.toMs() - this.startsAt.toMs());
  }

  getTodaySpentTime(): Time {
    const startAtDate = new Date();
    startAtDate.setHours(0, 0, 0, this.startsAt.toMs());
    const diffTime = Time.fromMs(Date.now() - startAtDate.getTime());
    return Time.max(Time.min(diffTime, this.getAmount()), Time.fromMs(0));
  }
}
