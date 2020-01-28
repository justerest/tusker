import { Task } from './Task';
import { Time } from './Time';

class ProgressCommit {
  value: number;
  plannedTime: Time;

  constructor(value: number, committedSpentTime: Time) {
    this.value = value;
    this.plannedTime = Time.fromMs((committedSpentTime.toMs() / value) * 100);
  }
}

export class Progress {
  private task: Task;
  private progressCommit: ProgressCommit;

  constructor(task: Task) {
    this.task = task;
    this.progressCommit = new ProgressCommit(0, task.getSpentTime());
  }

  commit(value: number): void {
    this.progressCommit = new ProgressCommit(value, this.task.getSpentTime());
  }

  getValue(): number | undefined {
    const plannedTime = this.getPlannedTime();
    const spentTime = this.task.getSpentTime();
    if (plannedTime.toMs() > spentTime.toMs()) {
      return Math.floor((spentTime.toMs() / plannedTime.toMs()) * 100);
    }
    return 100;
  }

  getPlannedTime(): Time {
    return Time.max(this.task.plannedTime, this.progressCommit.plannedTime);
  }
}
