import { Identity } from './common/Identity';
import { Board } from './Board';
import { assert } from 'src/utils/assert';
import { Employee } from './employee/Employee';
import { last } from 'lodash';

export class Project {
  static serialize(project: Project): unknown {
    return {
      ...project,
      employeeSet: [...project.employeeSet.values()],
    };
  }

  static deserialize(projectSnapshot: any): Project {
    return Object.assign(new Project(projectSnapshot.activeBoardId), projectSnapshot, {
      employeeSet: new Set(projectSnapshot.employeeSet),
    });
  }

  private employeeSet: Set<Employee['id']> = new Set();
  private boardIds: Board['id'][];
  private activeBoardId: Board['id'];

  id: Identity = Identity.generate();

  constructor(activeBoardId: Board['id']) {
    this.boardIds = [activeBoardId];
    this.activeBoardId = activeBoardId;
  }

  getActiveBoardId(): Board['id'] {
    return this.activeBoardId;
  }

  getBoardIds(): Board['id'][] {
    return this.boardIds.slice();
  }

  canCreateNextBoard(): boolean {
    return this.getActiveBoardId() === last(this.boardIds);
  }

  createNextBoard(): Board {
    assert(this.canCreateNextBoard(), 'Can plane only one board after active');
    const board = new Board();
    this.boardIds.push(board.id);
    return board;
  }

  getEmployeeIds(): Employee['id'][] {
    return [...this.employeeSet.values()];
  }

  addEmployee(employeeId: Employee['id']): void {
    assert(!this.employeeSet.has(employeeId), 'Employee already exist');
    this.employeeSet.add(employeeId);
  }
}
