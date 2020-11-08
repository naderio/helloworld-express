import { setupWithData } from '~/test/setup';

import * as CONST from '~/common/const';

import * as AuthService from './AuthService';

describe('Authentication', () => {
  describe('password encryption and comparison', () => {
    test('password encryption and comparison should fail with different password', async () => {
      const password = 'test';
      const encryptedPassword = await AuthService.encryptPassword(password);
      const result = await AuthService.comparePassword('wrong', encryptedPassword);
      expect(result).toBe(false);
    });

    test('password encryption and comparison should succeed with same password', async () => {
      const password = 'test';
      const encryptedPassword = await AuthService.encryptPassword(password);
      const result = await AuthService.comparePassword(password, encryptedPassword);
      expect(result).toBe(true);
    });

    test('password encryption and comparison should work with empty password', async () => {
      const password = '';
      const encryptedPassword = await AuthService.encryptPassword(password);
      const result = await AuthService.comparePassword(password, encryptedPassword);
      expect(result).toBe(true);
    });
  });

  describe('access token generation and validation', () => {
    test('access token generation and validation should succeed with user', async () => {
      const userId = 'd90ed360-e744-11e8-b4de-0d7fd38ce0e5';
      const accessToken = await AuthService.generateAccessToken(userId);
      const result = await AuthService.validateAccessToken(accessToken);
      expect(result.aud).toBe(CONST.AUDIENCE.USER);
      expect(result.id).toBe(userId);
    });
    test('access token generation and validation should succeed with admin', async () => {
      const userId = 'd90ed360-e744-11e8-b4de-0d7fd38ce0e5';
      const accessToken = await AuthService.generateAccessToken(userId, CONST.AUDIENCE.ADMIN);
      const result = await AuthService.validateAccessToken(accessToken);
      expect(result.aud).toBe(CONST.AUDIENCE.ADMIN);
      expect(result.id).toBe(userId);
    });
  });

  describe('access token extraction', () => {
    test('access token extraction should fail with authorization header', async () => {
      const userId = 'd90ed360-e744-11e8-b4de-0d7fd38ce0e5';
      let accessToken = await AuthService.generateAccessToken(userId);
      const req = {
        headers: {
          authorization: accessToken,
        },
        query: {},
      };
      accessToken = AuthService.extractAccessTokenFromRequest(req);
      expect(accessToken).toBe('');
    });

    test('access token extraction should succeed with `Bearer` authorization header', async () => {
      const userId = 'd90ed360-e744-11e8-b4de-0d7fd38ce0e5';
      let accessToken = await AuthService.generateAccessToken(userId);
      const req = {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        query: {},
      };
      accessToken = AuthService.extractAccessTokenFromRequest(req);
      const result = await AuthService.validateAccessToken(accessToken);
      expect(result.id).toBe(userId);
    });

    test('access token extraction should succeed with `JWT` authorization header', async () => {
      const userId = 'd90ed360-e744-11e8-b4de-0d7fd38ce0e5';
      let accessToken = await AuthService.generateAccessToken(userId);
      const req = {
        headers: {
          authorization: `JWT ${accessToken}`,
        },
        query: {},
      };
      accessToken = AuthService.extractAccessTokenFromRequest(req);
      const result = await AuthService.validateAccessToken(accessToken);
      expect(result.id).toBe(userId);
    });
  });

  describe('User creation', () => {
    setupWithData();

    test('createAdministratorUser() should fail with invalid payload', async () => {
      const payload = {
        userAccount: {},
        userProfile: {},
      };
      try {
        await AuthService.createAdministratorUser(payload);
      } catch (error) {
        expect(error.name).toBe('ValidationError');
      }
    });
    test('createAdministratorUser() should succeed with valid payload', async () => {
      const payload = {
        userAccount: {
          password: 'password',
          email: 'admin@helloworld.nader.tech',
          name: 'Administrator',
        },
        userProfile: {},
      };
      const result = await AuthService.createAdministratorUser(payload);
      delete payload.userAccount.password;
      expect(result).toMatchObject(payload);
      expect(result.userAccount.id).toBeDefined();
      expect(result.userProfile.id).toBeDefined();
      expect(result.userProfile.id).toBe(result.userAccount.id);
      expect(result.userAccount._profile).toBe(result.userProfile.id);
    });

    test('createUser() should fail with invalid payload', async () => {
      const payload = {
        userAccount: {},
        userProfile: {},
      };
      try {
        await AuthService.createUser(payload);
      } catch (error) {
        expect(error.name).toBe('ValidationError');
      }
    });
    test('createUser() should succeed with valid payload', async () => {
      const payload = {
        userAccount: {
          password: 'password',
          email: 'user@helloworld.nader.tech',
          name: 'User',
          pictureUrl: 'https://randomuser.me/api/portraits/lego/2.jpg',
        },
        userProfile: {},
      };
      const result = await AuthService.createUser(payload);
      delete payload.userAccount.password;
      expect(result).toMatchObject(payload);
      expect(result.userAccount.id).toBeDefined();
      expect(result.userProfile.id).toBeDefined();
      expect(result.userProfile.id).toBe(result.userAccount.id);
      expect(result.userAccount._profile).toBe(result.userProfile.id);
    });
  });
});
