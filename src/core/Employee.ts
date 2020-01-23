import { Identity } from './common/Identity';
import { Task, TaskStatus } from './Task';
import { assert } from '../utils/assert';
import { EventPublisher } from './common/EventPublisher';
import { EmployeeFree } from './EmployeeFree';
import { EmployeeRest } from './EmployeeRest';

export enum EmployeeStatus {
  Free,
  InWork,
  Rest,
}

export class Employee {
  private status: EmployeeStatus = EmployeeStatus.Free;
  private taskMap: Map<Task['id'], TaskStatus> = new Map();

  id!: Identity;

  constructor() {}

  attachTask(task: Task): void {
    assert(!this.taskMap.has(task.id));
    this.taskMap.set(task.id, TaskStatus.Planned);
    if (this.status === EmployeeStatus.Free) {
      this.rest();
    }
  }

  detachTask(task: Task): void {
    assert(this.taskMap.has(task.id));
    this.taskMap.delete(task.id);
    if (!this.taskMap.size) {
      this.free();
    }
  }

  takeInWork(task: Task): void {
    if (!this.taskMap.has(task.id)) {
      this.attachTask(task);
    }
    if (this.status === EmployeeStatus.InWork) {
      this.taskMap.set(this.getCurrentTaskId(), TaskStatus.Snoozed);
    } else {
      this.status = EmployeeStatus.InWork;
    }
  }

  completeTask(task: Task): void {
    assert(this.taskMap.has(task.id));
    this.taskMap.delete(task.id);
    if (!this.taskMap.size) {
      this.free();
    } else {
      this.rest();
    }
  }

  snoozeTask(task: Task): void {
    assert(this.taskMap.has(task.id));
    this.taskMap.set(task.id, TaskStatus.Snoozed);
    this.rest();
  }

  private getCurrentTaskId(): Identity {
    const res = [...this.taskMap.entries()].find(([_, status]) => status === TaskStatus.InProgress);
    assert(res);
    return res[0];
  }

  private free() {
    this.status = EmployeeStatus.Free;
    EventPublisher.instance.publish(new EmployeeFree(this));
  }

  private rest(): void {
    this.status = EmployeeStatus.Rest;
    EventPublisher.instance.publish(new EmployeeRest(this));
  }
}
