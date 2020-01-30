import { assert } from 'src/utils/assert';

export class Percent {
  static fromInt(value: number): Percent {
    assert(value >= 0 && value <= 100, '0 <= value <= 100');
    return new Percent(value);
  }

  static fromFloat(value: number): Percent {
    assert(value >= 0 && value <= 1, '0 <= value <= 1');
    return new Percent(value * 100);
  }

  private constructor(private value: number) {}

  toInt(): number {
    return this.value;
  }

  toFloat(): number {
    return this.value / 100;
  }
}
