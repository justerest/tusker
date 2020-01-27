import { Task } from '../../core/task/Task';
import { assert } from 'src/utils/assert';
import { TaskRepository } from '../../core/task/TaskRepository';
import { Employee } from 'src/core/employee/Employee';
import { Identity } from 'src/core/common/Identity';

export class InMemoryTaskRepository implements TaskRepository {
  private map: Map<Task['id'], Task> = new Map();

  getById(id: Task['id']): Task {
    const task = this.map.get(id);
    assert(task);
    return task;
  }

  getByEmployee(employeeId: Employee['id']): Task[] {
    return [...this.map.values()].filter((task) =>
      task.getAllExecutorIds().some((id) => Identity.equals(id, employeeId)),
    );
  }

  save(task: Task): void {
    if (!this.map.has(task.id)) {
      task.id = this.map.size;
    }
    this.map.set(task.id, task);
  }
}
