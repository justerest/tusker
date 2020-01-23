import { DomainEvent } from './common/EventPublisher';
import { Employee } from './Employee';

export class EmployeeFree extends DomainEvent {
  constructor(public employee: Employee) {
    super();
  }
}
