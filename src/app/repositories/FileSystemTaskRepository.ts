import { TaskRepository } from '../../core/task/TaskRepository';
import { Employee } from 'src/core/employee/Employee';
import { Identity } from 'src/core/common/Identity';
import { Task } from 'src/core/task/Task';
import { FileSystemRepository } from './FileSystemRepository';

export class FileSystemTaskRepository extends FileSystemRepository<Task> implements TaskRepository {
  protected entityName = Task.name;
  protected serialize = Task.serialize;
  protected deserialize = Task.deserialize;

  getByEmployee(employeeId: Employee['id']): Task[] {
    return this.getAll().filter((task) =>
      task.getAllExecutorIds().some((id) => Identity.equals(id, employeeId)),
    );
  }
}
