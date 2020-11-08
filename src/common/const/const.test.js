import * as CONST from './const';

describe('CONST.normalize', () => {
  test('should yield value when found in values map', () => {
    const output = CONST.normalize(CONST.ROLE.ADMIN, CONST.ROLE, CONST.ROLE.USER);

    expect(output).toMatch(CONST.ROLE.ADMIN);
  });

  test('should yield default value when not found in values map', () => {
    const output = CONST.normalize('whatever', CONST.ROLE, CONST.ROLE.USER);

    expect(output).toMatch(CONST.ROLE.USER);
  });
});
