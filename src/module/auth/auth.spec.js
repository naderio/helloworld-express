import { setupWithRunningApp } from '~/test/setup';
import { testUnauthenticatedFetch, testUnauthorizedFetch } from '~/test/utils';

import * as CONST from '~/common/const';

import * as CONFIG from '~/common/config';

describe('Authentication', () => {
  describe('user scenario', () => {
    setupWithRunningApp();

    /* @TODO user scenario
     * - retrieve user profile as unauthenticated with failure
     * - signup X as user with failure and success
     *   - should not be able to signup with existing email
     * - login X as user with failure and success
     * - retrieve user profile with failure (unauthenticated) and success (authenticated)
     * - initiate password reset as X with failure and success
     * - perform password reset as X with failure and success
     * - relogin X as user
     * - make sure X login as admin do not work
     * - make sure X accessToken do not work for other audiences
     */

    const DATA = {};

    DATA.defaultUser = {
      userAccount: {
        password: 'password',
        email: 'user@helloworld.nader.tech',
        name: 'User',
        pictureUrl: 'https://randomuser.me/api/portraits/lego/2.jpg',
      },
      userProfile: {},
    };

    const CACHE = {};

    test('POST /auth/signup should fail with invalid payload', async () => {
      const response = await fetch(`${CONFIG.API_ENDPOINT}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAccount: {},
          userProfile: {},
        }),
      });
      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.code).toBe('InvalidRequest');
    });

    test('POST /auth/signup should succeed with valid payload', async () => {
      const response = await fetch(`${CONFIG.API_ENDPOINT}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAccount: DATA.defaultUser.userAccount,
          userProfile: DATA.defaultUser.userProfile,
        }),
      });
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.accessToken).toBeDefined();
      expect(result.userAccount).toBeDefined();
      expect(result.userAccount.password).toBeUndefined();
      expect(result.userAccount.email).toBe(DATA.defaultUser.userAccount.email);
      expect(result.userProfile).toBeDefined();
      CACHE.defaultUser = result;
    });

    test('POST /auth/login should fail with invalid credentials', async () => {
      const response = await fetch(`${CONFIG.API_ENDPOINT}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'incorrect@helloworld.nader.tech',
          password: 'incorrect',
        }),
      });
      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.code).toBe('InvalidCredentials');
    });

    test('POST /auth/login should succeed with valid credentials', async () => {
      const response = await fetch(`${CONFIG.API_ENDPOINT}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: DATA.defaultUser.userAccount.email,
          password: DATA.defaultUser.userAccount.password,
        }),
      });
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.accessToken).toBeDefined();
      expect(result.userAccount).toBeDefined();
      expect(result.userProfile).toBeDefined();
      CACHE.defaultUser = result;
    });

    testUnauthenticatedFetch('GET /auth/check should fail with unauthenticated access', () =>
      fetch(`${CONFIG.API_ENDPOINT}/auth/check`),
    );

    test('GET /auth/check should succeed with authenticated access', async () => {
      const response = await fetch(`${CONFIG.API_ENDPOINT}/auth/check`, {
        headers: {
          Authorization: `Bearer ${CACHE.defaultUser.accessToken}`,
        },
      });
      expect(response.status).toBe(200);
    });

    // ...
  });

  // describe('admin as user', () => {
  //   setupWithRunningApp('seed');

  //   const CACHE = {};

  //   /* @TODO admin as user scenario
  //    * - login Y as user
  //    * - retrieve user profile for Y
  //    * - make sure Y accessToken do not work for other audiences
  //    */
  // });

  // describe('admin as admin', () => {
  //   setupWithRunningApp('seed');

  //   const CACHE = {};

  //   /* @TODO admin as admin scenario
  //    * - login Y as admin
  //    * - retrieve user profile ad Y
  //    * - make sure Y accessToken do not work for other audiences
  //    */
  // });

  // describe('user as admin', () => {
  //   setupWithRunningApp('seed');

  //   const CACHE = {};

  //   /* @TODO user as admin scenario
  //    * - login Y as admin should fail
  //    */
  // });
});
