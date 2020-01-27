import { Task } from '../../core/task/Task';
import { assert } from 'src/utils/assert';
import { TaskRepository } from '../../core/task/TaskRepository';
import { Employee } from 'src/core/employee/Employee';
import { Identity } from 'src/core/common/Identity';

export class InMemoryTaskRepository implements TaskRepository {
  private map: Map<Task['id'], Task> = new Map();

  getById(id: Task['id']): Task {
    const task = this.map.get(id.toString());
    assert(task);
    return task;
  }

  getAll(): Task[] {
    return [...this.map.values()];
  }

  getByEmployee(employeeId: Employee['id']): Task[] {
    return [...this.map.values()].filter((task) =>
      task.getAllExecutorIds().some((id) => Identity.equals(id, employeeId)),
    );
  }

  save(task: Task): void {
    this.map.set(task.id.toString(), task);
  }
}
