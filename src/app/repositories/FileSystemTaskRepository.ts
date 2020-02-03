import { assert } from 'src/utils/assert';
import { TaskRepository } from '../../core/task/TaskRepository';
import { Employee } from 'src/core/employee/Employee';
import { Identity } from 'src/core/common/Identity';
import { resolve } from 'path';
import { readJSONSync, writeJSONSync, existsSync, ensureFileSync } from 'fs-extra';
import { Task } from 'src/core/task/Task';

export class FileSystemTaskRepository implements TaskRepository {
  private filePath: string = resolve(process.cwd(), 'db/tasks.json');

  getById(id: Task['id']): Task {
    const task = this.getAll().find((t) => Identity.equals(t.id, id));
    assert(task, 'Task not found');
    return task;
  }

  getAll(): Task[] {
    if (!existsSync(this.filePath)) {
      ensureFileSync(this.filePath);
      writeJSONSync(this.filePath, []);
    }
    return (readJSONSync(this.filePath) as unknown[]).map(Task.deserialize);
  }

  getByEmployee(employeeId: Employee['id']): Task[] {
    return this.getAll().filter((task) =>
      task.getAllExecutorIds().some((id) => Identity.equals(id, employeeId)),
    );
  }

  save(task: Task): void {
    const tasks = this.getAll();
    const index = tasks.findIndex((t) => Identity.equals(t.id, task.id));
    if (index === -1) {
      tasks.push(task);
    } else {
      tasks.splice(index, 1, task);
    }
    writeJSONSync(this.filePath, tasks.map(Task.serialize));
  }
}
