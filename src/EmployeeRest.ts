import { DomainEvent } from './common/EventPublisher';
import { Employee } from './Employee';

export class EmployeeRest extends DomainEvent {
  constructor(public employee: Employee) {
    super();
  }
}
