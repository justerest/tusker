import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export abstract class DomainEvent {
  created: Date = new Date();
}

export class EventPublisher {
  static readonly instance = new EventPublisher();

  private subject: Subject<DomainEvent> = new Subject();

  private constructor() {}

  on<T extends DomainEvent>(EventCtor: new (...args: any[]) => DomainEvent): Observable<T> {
    return this.subject.pipe(filter((event): event is T => event instanceof EventCtor));
  }

  publish(event: DomainEvent): void {
    this.subject.next(event);
  }
}
