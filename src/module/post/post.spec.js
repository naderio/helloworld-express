import { setupWithRunningApp } from '~/test/setup';
import { getAuthenticatedUserByEmail, testUnauthenticatedFetch } from '~/test/utils';

import * as CONST from '~/common/const';

import * as CONFIG from '~/common/config';

describe('Post integration test', () => {
  describe('/user/post/collection', () => {
    setupWithRunningApp('seed');

    const DATA = {};

    DATA.defaultUser = {
      email: 'user@helloworld.nader.tech',
    };

    const CACHE = {};

    beforeAll(async () => {
      CACHE.defaultUser = await getAuthenticatedUserByEmail(DATA.defaultUser.email, CONST.ROLE.USER);
    });

    testUnauthenticatedFetch('GET /user/post/collection should fail with unauthenticated access', () =>
      fetch(`${CONFIG.API_ENDPOINT}/user/post/collection'`),
    );

    test('GET /user/post/collection', async () => {
      const response = await fetch(`${CONFIG.API_ENDPOINT}/user/post/collection`, {
        headers: {
          Authorization: `Bearer ${CACHE.defaultUser.accessToken}`,
        },
      });
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length > 0).toBe(true);
    });
  });
});
