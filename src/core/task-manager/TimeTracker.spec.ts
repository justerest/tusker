import { TimeTracker } from './TimeTracker';
import { restoreTime, spentHour } from 'src/utils/time-mocks';
import { Time } from '../Time';
import { Period } from './Period';

describe(TimeTracker.name, () => {
  let timeTracker: TimeTracker;

  beforeEach(() => (timeTracker = new TimeTracker()));

  afterEach(() => restoreTime());

  it('+getStentTime() should calc spent time', () => {
    timeTracker.start();
    spentHour();
    expect(timeTracker.getSpentTime().toMin()).toBe(Time.fromHr(1).toMin());
  });

  describe('+getSpentPeriods() should returns working periods', () => {
    it('on init should be empty', () => {
      expect(timeTracker.getSpentPeriods()).toEqual([]);
    });

    it('should add period for every work unit', () => {
      timeTracker.start();
      timeTracker.stop();
      expect(timeTracker.getSpentPeriods()).toHaveLength(1);
    });

    it('should add period for every work unit (2)', () => {
      timeTracker.start();
      timeTracker.stop();
      timeTracker.start();
      timeTracker.stop();
      expect(timeTracker.getSpentPeriods()).toHaveLength(2);
    });

    it('period spent time sum should be tracker spent time', () => {
      timeTracker.start();
      spentHour();
      timeTracker.stop();
      timeTracker.start();
      spentHour();
      expect(
        timeTracker
          .getSpentPeriods()
          .reduce((sum, period) => sum + period.getSpentTime().toMs(), 0),
      ).toBe(timeTracker.getSpentTime().toMs());
      expect(timeTracker.getSpentTime().toHr()).toBe(2);
    });
  });
});
