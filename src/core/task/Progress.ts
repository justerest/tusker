import { Task, TaskStatus } from './Task';
import { assert } from 'src/utils/assert';
import { Time } from './Time';

class ProgressCommit {
  constructor(public value: number, public spentTime: Time) {}
}

export class Progress {
  private task: Task;
  private progressCommit?: ProgressCommit;

  constructor(task: Task) {
    this.task = task;
  }

  commit(value: number): void {
    this.progressCommit = new ProgressCommit(value, this.task.getSpentTime());
  }

  getValue(): number {
    if (this.task.getStatus() === TaskStatus.Completed) {
      return 100;
    }
    if (this.progressCommit) {
      return this.getValueByCommittedTime();
    }
    return this.getValueByPlannedTime();
  }

  getPlannedTime(): Time {
    return this.progressCommit &&
      this.getPlannedTimeByCommittedValue().toMs() > this.task.plannedTime.toMs()
      ? this.getPlannedTimeByCommittedValue()
      : this.task.plannedTime;
  }

  private getPlannedTimeByCommittedValue(): Time {
    assert(this.progressCommit);
    return Time.fromMs((this.progressCommit.spentTime.toMs() / this.progressCommit.value) * 100);
  }

  private getValueByCommittedTime(): number {
    assert(this.progressCommit);
    const newPlannedTime = this.getPlannedTime().toMs();
    return Math.max(
      Math.floor((this.task.getSpentTime().toMs() / newPlannedTime) * 100),
      this.progressCommit.value,
    );
  }

  private isOverdueTask(): boolean {
    return this.task.getSpentTime().toMs() > this.task.plannedTime.toMs();
  }

  private getValueByPlannedTime(): number {
    if (this.isOverdueTask()) {
      return Math.floor((this.task.plannedTime.toMs() / this.task.getSpentTime().toMs()) * 100);
    }
    return Math.floor((this.task.getSpentTime().toMs() / this.task.plannedTime.toMs()) * 100);
  }
}
