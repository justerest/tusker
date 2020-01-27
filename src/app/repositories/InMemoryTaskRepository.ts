import { Task } from '../../core/task/Task';
import { assert } from 'src/utils/assert';
import { TaskRepository } from '../../core/task/TaskRepository';

export class InMemoryTaskRepository implements TaskRepository {
  private map: Map<Task['id'], Task> = new Map();

  getById(id: Task['id']): Task {
    const task = this.map.get(id);
    assert(task);
    return task;
  }

  save(task: Task): void {
    if (!this.map.has(task.id)) {
      task.id = this.map.size;
    }
    this.map.set(task.id, task);
  }
}
