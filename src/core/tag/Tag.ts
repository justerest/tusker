import { Identity } from '../common/Identity';
import { Task } from '../task/Task';
import { Time } from '../task/Time';
import { Employee } from '../employee/Employee';

export class Tag {
  static serialize(tag: Tag): unknown {
    return { ...tag };
  }

  static deserialize(tagSnapshot: any): Tag {
    return Object.assign(new Tag(), tagSnapshot);
  }

  id: Identity = Identity.generate();
  name!: string;

  constructor() {}

  getSpentTime(tasks: Task[]): Time {
    return Time.fromMs(
      tasks.map((task) => task.getSpentTime().toMs()).reduce((res, time) => res + time, 0),
    );
  }

  getSpentTimeFor(employeeId: Employee['id'], employeeTasks: Task[]): Time {
    return Time.fromMs(
      employeeTasks
        .filter((task) => Identity.equals(this.id, task.tagId))
        .map((task) => task.getSpentTimeFor(employeeId).toMs())
        .reduce((res, time) => res + time, 0),
    );
  }
}
