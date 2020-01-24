import { Task } from './Task';
import { assert } from 'src/utils/assert';

export interface TaskRepository {
  getById(id: Task['id']): Task;
  save(task: Task): void;
}

export class InMemoryTaskRepository implements TaskRepository {
  private map: Map<Task['id'], Task> = new Map();

  getById(id: Task['id']): Task {
    const task = this.map.get(id);
    assert(task);
    return task;
  }

  save(task: Task): void {}
}
