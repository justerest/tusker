import { Identity } from '../common/Identity';
import { WorkingTime } from './WorkingTime';

export class Employee {
  static serialize(employee: Employee) {
    return { ...employee, workingTime: WorkingTime.serialize(employee.workingTime) };
  }

  static deserialize(employeeSnapshot: any): Employee {
    return Object.assign(new Employee(), employeeSnapshot, {
      workingTime: WorkingTime.deserialize(employeeSnapshot.workingTime),
    });
  }

  id: Identity = Identity.generate();

  name: string = '';

  workingTime!: WorkingTime;

  constructor() {}
}
