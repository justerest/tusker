import { Employee } from '../employee/Employee';
import { Task } from '../task/Task';
import { TimeTracker } from './TimeTracker';

export interface TimeTrackerRepository {
  get(employeeId: Employee['id'], taskId: Task['id']): TimeTracker;
  find(employeeId: Employee['id'], taskId: Task['id']): TimeTracker | undefined;
  getAllByTask(taskId: Task['id']): TimeTracker[];
  getByEmployee(employeeId: Employee['id']): TimeTracker[];
  save(timeTracker: TimeTracker): void;
}
