import { Employee } from './Employee';
import { assert } from 'src/utils/assert';

export interface EmployeeRepository {
  getById(id: Employee['id']): Employee;
  save(employee: Employee): void;
}

export class InMemoryEmployeeRepository implements EmployeeRepository {
  private map: Map<Employee['id'], Employee> = new Map();

  getById(id: Employee['id']): Employee {
    const employee = this.map.get(id);
    assert(employee);
    return employee;
  }

  save(employee: Employee): void {}
}
