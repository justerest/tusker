import { Employee } from './employee/Employee';
import { Task } from './task/Task';
import { assert } from 'src/utils/assert';
import { Time } from './task/Time';
import { WorkingTime } from './employee/WorkingTime';
import { Identity } from './common/Identity';

export class Board {
  private employeeSet: Set<Employee['id']> = new Set();
  private taskSet: Set<Task['id']> = new Set();
  private completed: boolean = false;

  id: Identity = Identity.generate();

  date: Date;

  constructor(date: Date) {
    this.date = date;
  }

  isCompleted(): boolean {
    return this.completed;
  }

  markAsCompleted(): void {
    this.completed = true;
  }

  getTaskIds(): Task['id'][] {
    return [...this.taskSet.values()];
  }

  getEmployeeIds(): Employee['id'][] {
    return [...this.employeeSet.values()];
  }

  planeTask(title: string, plannedTime: Time): Task {
    assert(!this.isCompleted());
    const task = new Task();
    task.title = title;
    task.plannedTime = plannedTime;
    this.taskSet.add(task.id);
    return task;
  }

  addEmployee(name: string, workingTime: WorkingTime): Employee {
    assert(!this.isCompleted());
    const employee = new Employee();
    employee.name = name;
    employee.workingTime = workingTime;
    this.employeeSet.add(employee.id);
    return employee;
  }

  createNextBoard(employeeIds: Employee['id'][] = [], taskIds: Task['id'][] = []): Board {
    const date = new Date(this.date);
    date.setDate(date.getDate());
    const board = new Board(date);
    board.employeeSet = new Set(employeeIds);
    board.taskSet = new Set(taskIds);
    return board;
  }
}
