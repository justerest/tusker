import { Employee } from './employee/Employee';
import { Time } from './task/Time';
import { Tag } from './tag/Tag';
import { SimpleDate } from './SimpleDate';
import { TaskRepository } from './task/TaskRepository';
import { TagRepository } from './tag/TagRepository';
import { groupBy } from 'lodash';

export interface TimeReport {
  tag?: Tag;
  date: SimpleDate;
  spentTime: Time;
}

export class TimeReportService {
  constructor(private taskRepository: TaskRepository, private tagRepository: TagRepository) {}

  getTimeReports(employeeId: Employee['id']): TimeReport[] {
    const tasks = this.taskRepository.getAllByEmployee(employeeId).map((task) => ({
      tag: task.tagId && this.tagRepository.getById(task.tagId),
      spentTime: task.getSpentTimeFor(employeeId),
      date: SimpleDate.fromDate(task.creationDate),
    }));
    const groups = groupBy(tasks, (task) => task.date.toInt() + (task.tag?.id.toString() || ''));
    return Object.values(groups).map((taskGroup) => ({
      tag: taskGroup[0].tag,
      date: taskGroup[0].date,
      spentTime: Time.fromMs(taskGroup.reduce((res, task) => res + task.spentTime.toMs(), 0)),
    }));
  }
}
