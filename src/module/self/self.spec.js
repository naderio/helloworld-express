import { setupWithRunningApp } from '~/test/setup';
import { getAuthenticatedUserByEmail, testUnauthenticatedFetch } from '~/test/utils';

import * as CONST from '~/common/const';

import * as CONFIG from '~/common/config';

describe('User Profile integration test', () => {
  describe('/self', () => {
    setupWithRunningApp('seed');

    const DATA = {};

    DATA.defaultUser = {
      email: 'user@helloworld.nader.tech',
    };

    const CACHE = {};

    beforeAll(async () => {
      CACHE.defaultUser = await getAuthenticatedUserByEmail(DATA.defaultUser.email, CONST.ROLE.USER);
    });

    testUnauthenticatedFetch('GET /self should fail with unauthenticated access', () =>
      fetch(`${CONFIG.API_ENDPOINT}/self`),
    );

    test('GET /self should succeed with authenticated access', async () => {
      const response = await fetch(`${CONFIG.API_ENDPOINT}/self`, {
        headers: {
          Authorization: `Bearer ${CACHE.defaultUser.accessToken}`,
        },
      });
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.userAccount).toBeDefined();
      expect(result.userAccount).toMatchObject(CACHE.defaultUser.userAccount);
      expect(result.userProfile).toBeDefined();
    });
  });
});
