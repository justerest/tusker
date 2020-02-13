import { Identity } from './Identity';

describe('Identity', () => {
  describe('+Identity.primary()', () => {
    it('should parse float', () => {
      expect(Identity.primary('0.1')).toBe(0.1);
    });

    it('should return string that not parsed', () => {
      expect(Identity.primary('a0.1')).toBe('a0.1');
    });
  });
});
