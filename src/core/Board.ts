import { Employee } from './employee/Employee';
import { Task } from './task/Task';
import { assert } from 'src/utils/assert';
import { Time } from './task/Time';
import { WorkingTime } from './employee/WorkingTime';
import { Identity } from './common/Identity';

export class Board {
  static serialize(board: Board): unknown {
    return {
      ...board,
      employeeWorkingTimeMap: [...board.employeeWorkingTimeMap.entries()].map(([key, value]) => [
        key,
        WorkingTime.serialize(value),
      ]),
    };
  }

  static deserialize(boardSnapshot: any): Board {
    return Object.assign(new Board(), boardSnapshot, {
      date: new Date(boardSnapshot.date),
      employeeWorkingTimeMap: new Map(
        boardSnapshot.employeeWorkingTimeMap.map(([key, value]: any) => [
          key,
          WorkingTime.deserialize(value),
        ]),
      ),
    });
  }

  private employeeWorkingTimeMap: Map<Employee['id'], WorkingTime> = new Map();
  private completed: boolean = false;

  id: Identity = Identity.generate();

  date!: Date;

  constructor() {}

  isCompleted(): boolean {
    return this.completed;
  }

  markAsCompleted(): void {
    this.completed = true;
  }

  planeTask(title: string, plannedTime: Time): Task {
    assert(!this.isCompleted());
    const task = new Task();
    task.boardId = this.id;
    task.title = title;
    task.plannedTime = plannedTime;
    return task;
  }

  getEmployeeIds(): Employee['id'][] {
    return [...this.employeeWorkingTimeMap.keys()];
  }

  addEmployee(name: string, workingTime: WorkingTime): Employee {
    assert(!this.isCompleted());
    const employee = new Employee();
    employee.name = name;
    employee.workingTime = workingTime;
    this.employeeWorkingTimeMap.set(employee.id, workingTime);
    return employee;
  }

  createNextBoard(): Board {
    const date = new Date(this.date);
    date.setDate(date.getDate());
    const board = new Board();
    board.date = date;
    board.employeeWorkingTimeMap = new Map(this.employeeWorkingTimeMap);
    return board;
  }
}
