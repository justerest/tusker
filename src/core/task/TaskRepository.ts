import { Task } from './Task';
import { Employee } from '../employee/Employee';
import { Board } from '../Board';

export interface TaskRepository {
  getById(id: Task['id']): Task;
  getAllForBoard(boardId: Board['id']): Task[];
  getAllByEmployee(employeeId: Employee['id']): Task[];
  getAll(): Task[];
  save(task: Task): void;
}
