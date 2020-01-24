import { Task } from './Task';

export interface TaskRepository {
  getById(id: Task['id']): Task;
  save(task: Task): void;
}
