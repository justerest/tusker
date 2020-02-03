import { Employee } from '../../core/employee/Employee';
import { assert } from 'src/utils/assert';
import { EmployeeRepository } from '../../core/employee/EmployeeRepository';
import { resolve } from 'path';
import { existsSync, ensureFileSync, writeJSONSync, readJSONSync } from 'fs-extra';
import { Identity } from 'src/core/common/Identity';

export class FileSystemEmployeeRepository implements EmployeeRepository {
  private filePath: string = resolve(process.cwd(), 'db/employees.json');

  getById(id: Employee['id']): Employee {
    const employee = this.getAll().find((t) => Identity.equals(t.id, id));
    assert(employee, 'Employee not found');
    return employee;
  }

  getAll(): Employee[] {
    if (!existsSync(this.filePath)) {
      ensureFileSync(this.filePath);
      writeJSONSync(this.filePath, []);
    }
    return (readJSONSync(this.filePath) as unknown[]).map(Employee.deserialize);
  }

  save(employee: Employee): void {
    const employees = this.getAll();
    const index = employees.findIndex((t) => Identity.equals(t.id, employee.id));
    if (index === -1) {
      employees.push(employee);
    } else {
      employees.splice(index, 1, employee);
    }
    writeJSONSync(this.filePath, employees.map(Employee.serialize));
  }
}
