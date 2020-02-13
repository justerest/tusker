import { Task } from './Task';
import { Employee } from '../employee/Employee';
import { Board } from '../board/Board';

export interface TaskRepository {
  getById(id: Task['id']): Task;
  getAllForBoard(boardId: Board['id']): Task[];
  getAllByEmployee(employeeId: Employee['id']): Task[];
  findWorkingTaskByExecutor(employeeId: Employee['id']): Task | undefined;
  save(task: Task): void;
}
