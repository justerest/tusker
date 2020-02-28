import { FileSystemRepository } from './FileSystemRepository';
import { TimeTracker } from 'src/core/task-manager/TimeTracker';
import { TimeTrackerRepository } from 'src/core/task-manager/TimeTrackerRepository';
import { Identity } from 'src/core/common/Identity';
import { assert } from 'src/utils/assert';

export class FileSystemTimeTrackerRepository extends FileSystemRepository<TimeTracker & { id: any }>
  implements TimeTrackerRepository {
  protected entityName = TimeTracker.name;
  protected serialize = TimeTracker.serialize;
  protected deserialize = TimeTracker.deserialize as any;

  get(employeeId: Identity, taskId: Identity): TimeTracker {
    const tracker = this.find(employeeId, taskId);
    assert(tracker, 'Tracker not found');
    return tracker;
  }

  find(employeeId: Identity, taskId: Identity): TimeTracker | undefined {
    return this.getAll().find(
      (tracker) =>
        Identity.equals(tracker.taskId, taskId) && Identity.equals(tracker.employeeId, employeeId),
    );
  }

  getAllByTask(taskId: Identity): TimeTracker[] {
    return this.getAll().filter((tracker) => Identity.equals(tracker.taskId, taskId));
  }

  getByEmployee(employeeId: Identity): TimeTracker[] {
    return this.getAll().filter((tracker) => Identity.equals(tracker.employeeId, employeeId));
  }

  protected equals(entity1: TimeTracker, entity2: TimeTracker): boolean {
    return (
      Identity.equals(entity1.taskId, entity2.taskId) &&
      Identity.equals(entity1.employeeId, entity2.employeeId)
    );
  }
}
