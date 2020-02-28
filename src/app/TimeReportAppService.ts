import { Employee } from '../core/employee/Employee';
import { Tag } from '../core/tag/Tag';
import { SimpleDate } from '../core/SimpleDate';
import { TaskRepository } from '../core/task/TaskRepository';
import { TagRepository } from '../core/tag/TagRepository';
import { groupBy } from 'lodash';
import { Time } from '../core/Time';
import { TimeTrackerRepository } from '../core/task-manager/TimeTrackerRepository';

export interface TimeReport {
  tag?: Tag;
  date: SimpleDate;
  spentTime: Time;
}

export class TimeReportAppService {
  constructor(
    private taskRepository: TaskRepository,
    private tagRepository: TagRepository,
    private timeTrackerRepository: TimeTrackerRepository,
  ) {}

  getTimeReports(employeeId: Employee['id']): TimeReport[] {
    const tasks = this.timeTrackerRepository.getByEmployee(employeeId).flatMap((tracker) => {
      const task = this.taskRepository.getById(tracker.taskId);
      return tracker.getSpentPeriods().map((period) => ({
        tag: task.tagId && this.tagRepository.getById(task.tagId),
        spentTime: period.getSpentTime(),
        date: period.getSimpleDate(),
      }));
    });
    const groups = groupBy(tasks, (task) => task.date.toInt() + (task.tag?.id.toString() || ''));
    return Object.values(groups).map((taskGroup) => ({
      tag: taskGroup[0].tag,
      date: taskGroup[0].date,
      spentTime: Time.fromMs(taskGroup.reduce((res, task) => res + task.spentTime.toMs(), 0)),
    }));
  }
}
