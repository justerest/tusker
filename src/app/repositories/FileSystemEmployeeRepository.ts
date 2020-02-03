import { FileSystemRepository } from './FileSystemRepository';
import { Employee } from 'src/core/employee/Employee';
import { EmployeeRepository } from 'src/core/employee/EmployeeRepository';

export class FileSystemEmployeeRepository extends FileSystemRepository<Employee>
  implements EmployeeRepository {
  protected entityName = Employee.name;
  protected serialize = Employee.serialize;
  protected deserialize = Employee.deserialize;
}
