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
    const timeTracker =
      this.timeTrackerRepository.find(employeeId, task.id) ??
      this.createTracker(employeeId, task.id);
    timeTracker.start();
    return timeTracker;
  }

  private assertEmployeeFree(employeeId: Employee['id']) {
    assert(
      this.timeTrackerRepository
        .getByEmployee(employeeId)
        .every((tracker) => !tracker.isTrackingOn()),
      'Employee is busy',
    );
  }

  private createTracker(employeeId: Employee['id'], taskId: Task['id']): TimeTracker {
    const tracker = new TimeTracker();
    tracker.employeeId = employeeId;
    tracker.taskId = taskId;
    return tracker;
  }

  stopWorkOnTask(employeeId: Employee['id'], taskId: Task['id']): TimeTracker {
    const timeTracker = this.timeTrackerRepository.get(employeeId, taskId);
    timeTracker.stop();
    return timeTracker;
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
}
