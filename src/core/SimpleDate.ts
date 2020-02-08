export class SimpleDate {
  static fromDate(date: Date): SimpleDate {
    return new SimpleDate(date);
  }

  private constructor(private sourceDate: Date) {}

  toDate(): Date {
    return new Date(this.toInt());
  }

  toInt(): number {
    const year = this.sourceDate.getUTCFullYear();
    const month = this.sourceDate.getUTCMonth();
    const date = this.sourceDate.getUTCDate();
    return Date.UTC(year, month, date, 0, 0, 0, 0);
  }
}
