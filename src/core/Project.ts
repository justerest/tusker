import { Identity } from './common/Identity';
import { Board } from './Board';
import { assert } from 'src/utils/assert';
import { Employee } from './employee/Employee';
import { last } from 'lodash';

export class Project {
  private boardList: Board[] = [];
  private employeeSet: Set<Employee['id']> = new Set();

  id: Identity = Identity.generate();

  constructor() {}

  getBoards(): Board[] {
    return this.boardList.slice();
  }

  getActiveBoard(): Board {
    const activeBoard = this.boardList.find((board) => !board.isCompleted());
    assert(activeBoard, 'Active board not found');
    return activeBoard;
  }

  geEmployeeIds(): Employee['id'][] {
    return [...this.employeeSet.values()];
  }

  planeNextBoard(date?: Date): Board {
    const activeBoard = this.getActiveBoard();
    assert(activeBoard === last(this.boardList), 'Can plane only one board after active');
    const board = activeBoard.createNextBoard(this.geEmployeeIds());
    if (date) {
      assert(date > activeBoard.date, 'Can not plane board for past');
      board.date = date;
    }
    this.boardList.push(board);
    return board;
  }

  addEmployee(employeeId: Employee['id']): void {
    assert(!this.employeeSet.has(employeeId), 'Employee already exist');
    this.employeeSet.add(employeeId);
  }
}
