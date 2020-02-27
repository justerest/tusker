import { Time } from '../Time';
import { assert } from 'src/utils/assert';

export class WorkingTime {
  static serialize(workingTime: WorkingTime) {
    return {
      ...workingTime,
      startsAt: workingTime.startsAt.toMs(),
      endsAt: workingTime.endsAt.toMs(),
    };
  }

  static deserialize(workingTimeSnapshot: any): WorkingTime {
    return new WorkingTime(
      Time.fromMs(workingTimeSnapshot.startsAt),
      Time.fromMs(workingTimeSnapshot.endsAt),
    );
  }

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
