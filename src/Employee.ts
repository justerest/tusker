import { Identity } from './common/Identity';
import { Task } from './Task';
import { assert } from './utils/assert';
import { EventPublisher } from './common/EventPublisher';
import { EmployeeFree } from './EmployeeFree';
import { EmployeeRest } from './EmployeeRest';

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

  planeTask(task: Task): void {
    assert(!this.taskMap.has(task.id));
    this.taskMap.set(task.id, EmployeeTaskStatus.Planned);
    if (this.status === EmployeeStatus.Free) {
      this.status = EmployeeStatus.Rest;
      EventPublisher.instance.publish(new EmployeeRest(this));
    }
  }

  completeWorkOnTask(task: Task): void {
    assert(this.taskMap.has(task.id));
    this.taskMap.set(task.id, EmployeeTaskStatus.Done);
    if (this.isAllDone()) {
      this.status = EmployeeStatus.Free;
      EventPublisher.instance.publish(new EmployeeFree(this));
    } else {
      this.status = EmployeeStatus.Rest;
      EventPublisher.instance.publish(new EmployeeRest(this));
    }
  }

  private isAllDone(): boolean {
    return [...this.taskMap.values()].every((taskStatus) => taskStatus === EmployeeTaskStatus.Done);
  }
}
