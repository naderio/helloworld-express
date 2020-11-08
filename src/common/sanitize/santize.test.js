import * as sanitize from './sanitize';

describe('sanitize', () => {
  test('email', async () => {
    expect(sanitize.email(' hello@WORLD.com ')).toBe('hello@world.com');
  });
});
