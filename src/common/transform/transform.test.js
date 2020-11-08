import * as transform from '.';

describe('transform', () => {
  test('slugify', async () => {
    expect(transform.slugify(' TEST 1  2   3   ')).toBe('test-1-2-3');
  });
});
