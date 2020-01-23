import { Identity } from './common/Identity';
import { Task } from './Task';
import { assert } from './utils/assert';
import { EventPublisher } from './common/EventPublisher';
import { EmployeeFree } from './EmployeeFree';

export enum EmployeeStatus {
  Free,
  InWork,
  Rest,
}

export enum EmployeeTaskStatus {
  Planned,
  InWork,
  Paused,
  Done,
}

export class Employee {
  private status: EmployeeStatus = EmployeeStatus.Free;
  private taskMap: Map<Task['id'], EmployeeTaskStatus> = new Map();

  id!: Identity;

  getStatus(): EmployeeStatus {
    return this.status;
  }

  planeTask(task: Task): void {
    this.taskMap.set(task.id, EmployeeTaskStatus.Planned);
  }

  workOnTask(task: Task): void {
    assert(this.status !== EmployeeStatus.InWork);
    this.taskMap.set(task.id, EmployeeTaskStatus.InWork);
  }

  pauseTask(task: Task): void {
    assert(this.taskMap.has(task.id));
    this.taskMap.set(task.id, EmployeeTaskStatus.Paused);
  }

  completeWorkOnTask(task: Task): void {
    assert(this.taskMap.has(task.id));
    this.taskMap.set(task.id, EmployeeTaskStatus.Done);
    if (this.isAllDone()) {
      EventPublisher.instance.publish(new EmployeeFree(this));
    }
  }

  private isAllDone(): boolean {
    return [...this.taskMap.values()].every((taskStatus) => taskStatus === EmployeeTaskStatus.Done);
  }
}
