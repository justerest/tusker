import { Employee } from '../../core/employee/Employee';
import { assert } from 'src/utils/assert';
import { EmployeeRepository } from '../../core/employee/EmployeeRepository';

export class InMemoryEmployeeRepository implements EmployeeRepository {
  private map: Map<Employee['id'], Employee> = new Map();

  getById(id: Employee['id']): Employee {
    const employee = this.map.get(id);
    assert(employee);
    return employee;
  }

  save(employee: Employee): void {
    this.map.set(employee.id, employee);
  }
}
