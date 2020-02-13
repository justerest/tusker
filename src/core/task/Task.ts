import { assert } from '../../utils/assert';
import { Identity } from '../common/Identity';
import { Employee } from '../employee/Employee';
import { TrackerMap } from './TrackerMap';
import { Time } from './Time';
import { Percent } from './Percent';
import { Board } from '../board/Board';
import { Tag } from '../tag/Tag';
import { TaskRepository } from './TaskRepository';

export enum TaskStatus {
  Planned = 'Planned',
  InWork = 'InWork',
  Snoozed = 'Snoozed',
  Completed = 'Completed',
}

export class Task {
  static serialize(task: Task) {
    return {
      ...task,
      neededTime: task.neededTime.toMs(),
      plannedTime: task.plannedTime.toMs(),
      trackerMap: TrackerMap.serialize(task.trackerMap),
    };
  }

  static deserialize(taskSnapshot: any): Task {
    return Object.assign(new Task(), taskSnapshot, {
      neededTime: Time.fromMs(taskSnapshot.neededTime),
      plannedTime: Time.fromMs(taskSnapshot.plannedTime),
      trackerMap: TrackerMap.deserialize(taskSnapshot.trackerMap),
      creationDate: new Date(taskSnapshot.creationDate),
    });
  }

  private status: TaskStatus = TaskStatus.Planned;
  private trackerMap: TrackerMap = new TrackerMap();
  private executorId?: Employee['id'];

  id: Identity = Identity.generate();

  boardId!: Board['id'];

  title: string = '';

  plannedTime: Time = Time.fromMs(0);

  tagId?: Tag['id'];

  creationDate: Date = new Date();

  private neededTime = Time.fromMs(0);

  constructor() {}

  isPlanned(): boolean {
    return this.status === TaskStatus.Planned;
  }

  isInWork(): boolean {
    return this.status === TaskStatus.InWork;
  }

  isCompleted(): boolean {
    return this.status === TaskStatus.Completed;
  }

  private changeStatus(status: TaskStatus): void {
    assert(this.status !== status, 'Can not change status on same');
    this.status = status;
  }

  getSpentTime(): Time {
    return Time.fromMs(this.trackerMap.getTotalSpentTime());
  }

  getSpentTimeFor(employeeId: Employee['id']): Time {
    return Time.fromMs(this.trackerMap.getSpentTimeFor(employeeId));
  }

  getNeededTime(): Time {
    return Time.max(this.neededTime, this.plannedTime);
  }

  setNeededTime(neededTime: Time): void {
    this.neededTime = neededTime;
  }

  commitProgress(percent: Percent): void {
    this.setNeededTime(Time.fromMs(this.getSpentTime().toMs() / percent.toFloat()));
  }

  getExecutorId(): Employee['id'] | undefined {
    return this.executorId;
  }

  getAllExecutorIds(): Employee['id'][] {
    return this.trackerMap.getAllEmployeeIds();
  }

  assignExecutor(employeeId: Employee['id']): void {
    assert(!this.executorId, 'Can not assign second executor on task');
    this.executorId = employeeId;
    this.trackerMap.addEmployee(employeeId);
  }

  vacateExecutor(): void {
    assert(this.executorId, 'Executor not exist');
    if (this.status === TaskStatus.InWork) {
      this.trackerMap.stopTrackerFor(this.executorId);
    }
    this.executorId = undefined;
    if (this.status !== TaskStatus.Planned) {
      this.changeStatus(TaskStatus.Planned);
    }
  }

  takeInWork(taskRepository: TaskRepository): void {
    assert(this.executorId, 'Can not take in work not assigned task');
    assert(!taskRepository.findWorkingTaskByExecutor(this.executorId), 'Employee busy');
    this.trackerMap.startTrackerFor(this.executorId);
    this.changeStatus(TaskStatus.InWork);
  }

  snooze(): void {
    assert(this.executorId, 'Can not snooze not assigned task');
    assert(this.status !== TaskStatus.Planned, 'Can not snooze Planned task');
    if (this.status === TaskStatus.InWork) {
      this.trackerMap.stopTrackerFor(this.executorId);
    }
    this.changeStatus(TaskStatus.Snoozed);
  }

  complete(): void {
    if (this.status === TaskStatus.InWork) {
      assert(this.executorId);
      this.trackerMap.stopTrackerFor(this.executorId);
    }
    this.changeStatus(TaskStatus.Completed);
  }

  cancelCompletion(): void {
    assert(this.status === TaskStatus.Completed, 'Can not cancel completion of uncompleted task');
    if (this.executorId) {
      this.snooze();
    } else {
      this.plane();
    }
  }

  private plane() {
    assert(!this.executorId, 'Can not plane assigned task');
    this.changeStatus(TaskStatus.Planned);
  }

  setTag(tagId: Tag['id']): void {
    this.tagId = tagId;
  }
}
