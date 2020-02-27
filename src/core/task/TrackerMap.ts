import { assert } from '../../utils/assert';
import { Employee } from '../employee/Employee';
import { TimeTracker } from './TimeTracker';
import { Identity } from '../common/Identity';

export class TrackerMap {
  static serialize(trackerMap: TrackerMap) {
    return [...trackerMap.map.entries()];
  }

  static deserialize(trackerMapSnapshot: any): TrackerMap {
    const trackerMap = new TrackerMap();
    trackerMap.map = new Map(
      trackerMapSnapshot.map(([key, value]: [Identity, TimeTracker]) => [
        key,
        Object.assign(new TimeTracker(), value),
      ]),
    );
    return trackerMap;
  }

  private map: Map<Employee['id'], TimeTracker> = new Map();

  startTrackerFor(employeeId: Employee['id']): void {
    this.getOrCreate(employeeId).start();
  }

  stopTrackerFor(employeeId: Employee['id']): void {
    this.get(employeeId).stop();
  }

  getTotalSpentTime(): number {
    return [...this.map.values()].reduce((res, el) => res + el.getSpentTime(), 0);
  }

  getSpentTimeFor(employeeId: Employee['id']): number {
    return this.get(employeeId).getSpentTime();
  }

  stopAllTrackers(): void {
    [...this.map.values()]
      .filter((tracker) => tracker.isTrackingOn())
      .forEach((tracker) => tracker.stop());
  }

  getAllExecutors(): Employee['id'][] {
    return [...this.map.keys()];
  }

  private getOrCreate(employeeId: Employee['id']): TimeTracker {
    if (!this.map.has(employeeId)) {
      this.map.set(employeeId, new TimeTracker());
    }
    return this.map.get(employeeId) as TimeTracker;
  }

  private get(employeeId: Employee['id']): TimeTracker {
    const params = this.map.get(employeeId);
    assert(params, 'Employee not exist');
    return params;
  }
}
