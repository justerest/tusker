import { WorkingTime } from './WorkingTime';
import { Time } from '../task/Time';
import { restoreTime } from 'src/utils/time-mocks';

describe(WorkingTime.name, () => {
  let workingTime: WorkingTime;

  beforeEach(() => (workingTime = new WorkingTime(Time.fromHr(9), Time.fromHr(17))));

  afterEach(() => restoreTime());

  it('should be created', () => {
    expect(workingTime).toBeInstanceOf(WorkingTime);
  });

  describe(WorkingTime.prototype.getAmount.name, () => {
    it('should returns total time of working day', () => {
      expect(workingTime.getAmount().toHr()).toBe(8);
    });
  });

  describe(WorkingTime.prototype.getTodaySpentTime.name, () => {
    it('should returns spent time from start of working time', () => {
      const today = new Date();
      today.setHours(10, 40, 0, 0);
      Date.now = () => today.getTime();
      expect(Math.floor(workingTime.getTodaySpentTime().toMin())).toBe(100);
    });

    it('should returns amount if working time is end', () => {
      const today = new Date();
      today.setHours(18, 0, 0, 0);
      Date.now = () => today.getTime();
      expect(workingTime.getTodaySpentTime().toHr()).toBe(workingTime.getAmount().toHr());
    });

    it('should returns 0 if working time is not started yet', () => {
      const today = new Date();
      today.setHours(8, 0, 0, 0);
      Date.now = () => today.getTime();
      expect(workingTime.getTodaySpentTime().toMs()).toBe(0);
    });
  });
});
