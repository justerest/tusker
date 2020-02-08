import { TimeReportService } from './TimeReportService';
import { Employee } from './employee/Employee';
import { Task } from './task/Task';
import { Time } from './task/Time';
import { SimpleDate } from './SimpleDate';

describe('TimeReportService', () => {
  let service: TimeReportService;
  let task: Task;

  beforeEach(() => {
    task = new Task();
    service = new TimeReportService({ getAllByEmployee: () => [task, task] } as any, {} as any);
  });

  it('should be created', () => {
    expect(service).toBeInstanceOf(TimeReportService);
  });

  it('should returns time reports for employee', () => {
    const employeeId = 1;
    task.assignExecutor(employeeId);
    task.takeInWork();
    expect(
      service.getTimeReports(employeeId).map((tr) => ({ ...tr, date: tr.date.toInt() })),
    ).toEqual([{ spentTime: Time.fromMs(0), date: SimpleDate.fromDate(new Date()).toInt() }]);
  });
});
