import { Employee } from './Employee';
import { Task } from './Task';

describe('Employee', () => {
  let employee: Employee;
  let task: Task;

  beforeEach(() => {
    employee = new Employee();
    task = new Task();
  });

  it('should be created', () => {
    expect(employee).toBeInstanceOf(Employee);
  });
});
