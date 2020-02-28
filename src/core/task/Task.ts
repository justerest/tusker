import { assert } from 'src/utils/assert';
import { Identity } from '../common/Identity';
import { Employee } from '../employee/Employee';
import { Time } from '../Time';
import { Board } from '../board/Board';
import { Tag } from '../tag/Tag';

export class Task {
  static serialize(task: Task) {
    return {
      ...task,
      neededTime: task.neededTime.toMs(),
      plannedTime: task.plannedTime.toMs(),
    };
  }

  static deserialize(taskSnapshot: any): Task {
    return Object.assign(new Task(), taskSnapshot, {
      neededTime: Time.fromMs(taskSnapshot.neededTime),
      plannedTime: Time.fromMs(taskSnapshot.plannedTime),
      creationDate: new Date(taskSnapshot.creationDate),
    });
  }

  id: Identity = Identity.generate();
  boardId!: Board['id'];
  tagId?: Tag['id'];
  title: string = '';
  plannedTime: Time = Time.fromMs(0);
  private neededTime = Time.fromMs(0);
  private executorId?: Employee['id'];

  constructor() {}

  setTag(tagId: Tag['id']): void {
    this.tagId = tagId;
  }

  getNeededTime(): Time {
    return Time.max(this.neededTime, this.plannedTime);
  }

  setNeededTime(neededTime: Time): void {
    this.neededTime = neededTime;
  }

  getExecutorIds(): Employee['id'][] {
    return this.executorId ? [this.executorId] : [];
  }

  assignExecutor(employeeId: Employee['id']): void {
    this.executorId = employeeId;
  }

  vacateExecutor(employeeId: Employee['id']): void {
    assert(this.executorId === employeeId, 'Executor not exist');
    this.executorId = undefined;
  }
}
