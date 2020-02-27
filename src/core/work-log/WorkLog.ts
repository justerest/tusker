import { Employee } from '../employee/Employee';
import { Task } from '../task/Task';
import { assert } from '../../utils/assert';
import { TrackerMap } from './TrackerMap';
import { Time } from '../Time';

export class WorkLog {
  private trackerMap: Map<Task['id'], TrackerMap> = new Map();
  private employeesInWork: Set<Employee['id']> = new Set();

  getSpentTime(taskId: Task['id']): Time {
    return Time.fromMs(this.trackerMap.get(taskId)?.getTotalSpentTime() ?? 0);
  }

  getSpentTimeFor(employeeId: Employee['id'], taskId: Task['id']): Time {
    return Time.fromMs(this.trackerMap.get(taskId)?.getSpentTimeFor(employeeId) ?? 0);
  }

  logWorkStarted(employeeId: Employee['id'], task: Task): void {
    assert(!this.employeesInWork.has(employeeId), 'Employee already in work');
    this.assertTaskAssignedToEmployee(task, employeeId);
    const trackerMap = this.getOrCreateTracker(task.id);
    trackerMap.startTrackerFor(employeeId);
    this.employeesInWork.add(employeeId);
  }

  private assertTaskAssignedToEmployee(task: Task, employeeId: Employee['id']): void {
    assert(task.getExecutorIds().includes(employeeId), 'Employee not assigned for task');
  }

  private getOrCreateTracker(taskId: Task['id']): TrackerMap {
    if (!this.trackerMap.has(taskId)) {
      this.trackerMap.set(taskId, new TrackerMap());
    }
    return this.trackerMap.get(taskId) as TrackerMap;
  }

  logWorkEnded(employeeId: Employee['id'], task: Task): void {
    assert(this.employeesInWork.has(employeeId), 'Employee not in work');
    this.getTracker(task.id).stopTrackerFor(employeeId);
    this.employeesInWork.delete(employeeId);
  }

  private getTracker(taskId: Task['id']): TrackerMap {
    const trackerMap = this.trackerMap.get(taskId);
    assert(trackerMap, 'TrackerMap not found');
    return trackerMap;
  }

  stopWorkOnTask(task: Task): void {
    const trackerMap = this.getTracker(task.id);
    trackerMap.stopAllTrackers();
    trackerMap.getAllExecutors().forEach((employeeId) => this.employeesInWork.delete(employeeId));
  }
}
