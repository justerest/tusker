import { Employee } from './Employee';
import { Board } from '../board/Board';

export interface EmployeeRepository {
  getById(employeeId: Employee['id']): Employee;
  getAllForBoard(board: Board): Employee[];
  save(employee: Employee): void;
}
