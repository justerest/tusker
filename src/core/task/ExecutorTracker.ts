import { assert } from '../../utils/assert';
import { Employee } from '../employee/Employee';
import { TimeTracker } from './TimeTracker';

export class ExecutorTracker {
  private map: Map<Employee['id'], TimeTracker> = new Map();

  addExecutor(employeeId: Employee['id']): void {
    assert(!this.map.has(employeeId), 'Employee already exist');
    this.map.set(employeeId, new TimeTracker());
  }

  startTracking(employeeId: Employee['id']): void {
    this.get(employeeId).startTracking();
  }

  stopTracking(employeeId: Employee['id']): void {
    this.get(employeeId).stopTracking();
  }

  getSpentTime(): number {
    return [...this.map.values()].reduce((res, el) => res + el.getSpentTime(), 0);
  }

  getSpentTimeFor(employeeId: Employee['id']): number {
    return this.get(employeeId).getSpentTime();
  }

  getAllExecutorIds(): Employee['id'][] {
    return [...this.map.keys()];
  }

  private get(employeeId: Employee['id']): TimeTracker {
    const params = this.map.get(employeeId);
    assert(params, 'Employee not exist');
    return params;
  }
}
