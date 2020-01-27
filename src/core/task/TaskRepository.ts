import { Task } from './Task';
import { Employee } from '../employee/Employee';

export interface TaskRepository {
  getById(id: Task['id']): Task;
  getByEmployee(employeeId: Employee['id']): Task[];
  getAll(): Task[];
  save(task: Task): void;
}
