import { Employee } from '../employee/Employee';
import { Task } from '../task/Task';
import { assert } from 'src/utils/assert';
import { TimeTrackerRepository } from './TimeTrackerRepository';
import { TimeTracker } from './TimeTracker';
import { Time } from '../Time';

export class TaskManager {
  constructor(private timeTrackerRepository: TimeTrackerRepository) {}

  startWorkOnTask(employeeId: Employee['id'], task: Task): TimeTracker {
    assert(task.getExecutorIds().includes(employeeId), 'Task not assigned to employee');
    this.assertEmployeeFree(employeeId);
    const timeTracker = this.timeTrackerRepository.find(employeeId, task.id) ?? new TimeTracker();
    timeTracker.start();
    return timeTracker;
  }

  stopWorkOnTask(employeeId: Employee['id'], taskId: Task['id']): TimeTracker {
    const timeTracker = this.timeTrackerRepository.get(employeeId, taskId);
    timeTracker.stop();
    return timeTracker;
  }

  getSpentTime(employeeId: Employee['id'], taskId: Task['id']): Time {
    return Time.fromMs(this.timeTrackerRepository.find(employeeId, taskId)?.getSpentTime() ?? 0);
  }

  getFullTaskSpentTime(taskId: Task['id']): Time {
    return Time.fromMs(
      this.timeTrackerRepository
        .getAllByTask(taskId)
        .reduce((res, tracker) => res + tracker.getSpentTime(), 0),
    );
  }

  isTaskInWork(taskId: Task['id']): boolean {
    return this.timeTrackerRepository
      .getAllByTask(taskId)
      .some((tracker) => tracker.isTrackingOn());
  }

  private assertEmployeeFree(employeeId: Employee['id']) {
    assert(
      this.timeTrackerRepository
        .getByEmployee(employeeId)
        .every((tracker) => !tracker.isTrackingOn()),
      'Employee is busy',
    );
  }
}
