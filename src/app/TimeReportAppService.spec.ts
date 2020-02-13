import { TimeReportAppService } from './TimeReportAppService';
import { Task } from '../core/task/Task';
import { TaskRepository } from '../core/task/TaskRepository';

describe('TimeReportAppService', () => {
  let service: TimeReportAppService;
  let task: Task;
  let taskRepository: TaskRepository;

  beforeEach(() => {
    task = new Task();
    service = new TimeReportAppService({ getAllByEmployee: () => [task, task] } as any, {} as any);
    taskRepository = { findWorkingTaskByExecutor: (_) => undefined } as TaskRepository;
  });

  it('should be created', () => {
    expect(service).toBeInstanceOf(TimeReportAppService);
  });

  it('should returns time report list for employee', () => {
    const employeeId = 1;
    task.assignExecutor(employeeId);
    task.takeInWork(taskRepository);
    expect(service.getTimeReports(employeeId)).toBeInstanceOf(Array);
    expect(service.getTimeReports(employeeId).length).toBe(1);
  });

  it('should returns time report for employee', () => {
    const employeeId = 1;
    task.assignExecutor(employeeId);
    task.takeInWork(taskRepository);
    expect(service.getTimeReports(employeeId)[0]).toMatchObject({ spentTime: {}, date: {} });
  });
});
