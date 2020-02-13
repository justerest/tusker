import { FileSystemRepository } from './FileSystemRepository';
import { Employee } from 'src/core/employee/Employee';
import { EmployeeRepository } from 'src/core/employee/EmployeeRepository';
import { Board } from 'src/core/board/Board';

export class FileSystemEmployeeRepository extends FileSystemRepository<Employee>
  implements EmployeeRepository {
  protected entityName = Employee.name;
  protected serialize = Employee.serialize;
  protected deserialize = Employee.deserialize;

  getAllForBoard(board: Board): Employee[] {
    const employeeIdSet = new Set(board.getEmployeeIds());
    return this.getAll().filter((employee) => employeeIdSet.has(employee.id));
  }
}
