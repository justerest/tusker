import { Tag } from './Tag';
import { restoreTime } from 'src/utils/time-mocks';

describe('Tag', () => {
  let tag: Tag;

  beforeEach(() => (tag = new Tag()));

  afterEach(() => restoreTime());

  it('should be created', () => {
    expect(tag).toBeInstanceOf(Tag);
  });
});
