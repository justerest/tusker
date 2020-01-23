import { assert } from './utils/assert';
import { DomainEvent, EventPublisher } from './common/EventPublisher';
import { Employee } from './Employee';
import { Identity } from './common/Identity';

export class TaskCreated extends DomainEvent {
  constructor(public task: Task) {
    super();
  }
}

export enum TaskStatus {
  Planned = 0,
  InProgress,
  Paused,
  Done,
  Approved,
}

export class Task {
  private status: TaskStatus = TaskStatus.Planned;
  private staff: Set<Employee['id']> = new Set();

  id: Identity;

  constructor(id: Identity = '') {
    this.id = id;
    EventPublisher.instance.publish(new TaskCreated(this));
  }

  getStatus(): TaskStatus {
    return this.status;
  }

  start(): void {
    assert(this.status === TaskStatus.Planned);
    this.status = TaskStatus.InProgress;
  }

  finish(employees: Employee[]): void {
    assert(this.status < TaskStatus.Done);
    this.status = TaskStatus.Done;
    assert(employees.every((employee) => this.staff.has(employee.id)));
    employees.forEach((employee) => employee.completeWorkOnTask(this));
  }

  attachEmployee(employee: Employee): void {
    assert(!this.staff.has(employee.id));
    this.staff.add(employee.id);
    employee.planeTask(this);
  }

  vacateEmployee(employee: Employee): void {
    assert(this.staff.has(employee.id));
    this.staff.delete(employee.id);
    employee.completeWorkOnTask(this);
  }
}
