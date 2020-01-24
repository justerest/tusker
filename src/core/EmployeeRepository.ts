import { Employee } from './Employee';

export interface EmployeeRepository {
  getById(id: Employee['id']): Employee;
  save(employee: Employee): void;
}
