import { Time } from '../core/Time';

const now = Date.now;

export function restoreTime(): void {
  Date.now = now;
}

export function spentMinutes(minutes: number): void {
  Date.now = jasmine.createSpy().and.returnValue(Date.now() + Time.fromMin(minutes).toMs());
}

export function spentHour(hour: number = 1): void {
  spentMinutes(hour * 60);
}
