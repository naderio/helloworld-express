import * as validate from '.';

describe('validate', () => {
  test('email', async () => {
    expect(validate.email('hello@world.com')).toBe(true);
    expect(validate.email('helloworld.com')).toBe(false);
  });
});
