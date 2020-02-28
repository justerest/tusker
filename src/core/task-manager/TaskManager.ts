import { Employee } from '../employee/Employee';
import { Task } from '../task/Task';
import { assert } from 'src/utils/assert';
import { TimeTrackerRepository } from './TimeTrackerRepository';
import { TimeTracker } from './TimeTracker';
import { Time } from '../Time';
import { TaskRepository } from '../task/TaskRepository';

export class TaskManager {
  constructor(
    private timeTrackerRepository: TimeTrackerRepository,
    private taskRepository: TaskRepository,
  ) {}

  startWorkOnTask(employeeId: Employee['id'], taskId: Task['id']): void {
    this.assertEmployeeFree(employeeId);
    const task = this.taskRepository.getById(taskId);
    assert(task.getExecutorIds().includes(employeeId), 'Task not assigned to employee');
    const timeTracker =
      this.timeTrackerRepository.find(employeeId, task.id) ??
      this.createTracker(employeeId, task.id);
    timeTracker.start();
    this.timeTrackerRepository.save(timeTracker);
  }

  private assertEmployeeFree(employeeId: Employee['id']) {
    assert(!this.getEmployeeWorkingTaskId(employeeId), 'Employee is busy');
  }

  getEmployeeWorkingTaskId(employeeId: Employee['id']): Task['id'] | undefined {
    return this.timeTrackerRepository
      .getByEmployee(employeeId)
      .find((tracker) => tracker.isTrackingOn())?.taskId;
  }

  private createTracker(employeeId: Employee['id'], taskId: Task['id']): TimeTracker {
    const tracker = new TimeTracker();
    tracker.employeeId = employeeId;
    tracker.taskId = taskId;
    return tracker;
  }

  stopWorkOnTask(employeeId: Employee['id'], taskId: Task['id']): void {
    const timeTracker = this.timeTrackerRepository.get(employeeId, taskId);
    timeTracker.stop();
    this.timeTrackerRepository.save(timeTracker);
  }

  getFullTaskSpentTime(taskId: Task['id']): Time {
    return Time.fromMs(
      this.timeTrackerRepository
        .getAllByTask(taskId)
        .reduce((res, tracker) => res + tracker.getSpentTime().toMs(), 0),
    );
  }

  isTaskInWork(taskId: Task['id']): boolean {
    return this.timeTrackerRepository
      .getAllByTask(taskId)
      .some((tracker) => tracker.isTrackingOn());
  }
}
