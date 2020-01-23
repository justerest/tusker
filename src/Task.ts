import { assert } from './utils/assert';
import { Identity } from './common/Identity';

export enum TaskStatus {
  Planned,
  InProgress,
  Paused,
  Done,
}

export class Task {
  private status: TaskStatus = TaskStatus.Planned;

  id: Identity;

  constructor(id: Identity = '') {
    this.id = id;
  }

  getStatus(): TaskStatus {
    return this.status;
  }

  start(): void {
    assert(this.status === TaskStatus.Planned);
    this.status = TaskStatus.InProgress;
  }
}
