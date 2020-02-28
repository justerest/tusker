import { SimpleDate } from '../SimpleDate';
import { Time } from '../Time';

export class Period {
  static serialize(period: Period): object {
    return { ...period };
  }

  static deserialize(periodSnapshot: Period): Period {
    return new Period(periodSnapshot.startAt, periodSnapshot.endAt);
  }

  static since(startAt: number): Period {
    return new Period(startAt, Date.now());
  }

  constructor(private startAt: number, private endAt: number) {}

  getSpentTime(): Time {
    return Time.fromMs(this.endAt - this.startAt);
  }

  getSimpleDate(): SimpleDate {
    return SimpleDate.fromDate(new Date(this.startAt));
  }
}
