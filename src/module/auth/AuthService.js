import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';

import * as CONST from '~/common/const';

import * as Errors from '~/common/errors'; // in seconds, @TODO move to config? or param?

import * as UserAccount from './UserAccount.model';
import * as UserProfile from './UserProfile.model';

const AUTH_JWT_SECRET = process.env.AUTH_JWT_SECRET || 'secret';
const AUTH_JWT_EXPIRATION = process.env.AUTH_JWT_EXPIRATION || (30 * CONST.DURATION_DAY) / CONST.DURATION_SECOND;

const SALT_ROUNDS = 8;

export async function encryptPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password, targetPassword) {
  return bcrypt.compare(password, targetPassword);
}

export async function generateAccessToken(userId, audience = CONST.AUDIENCE.USER) {
  return new Promise((resolve, reject) => {
    const payload = {
      id: userId,
    };

    jsonwebtoken.sign(
      payload,
      AUTH_JWT_SECRET,
      {
        audience,
        expiresIn: AUTH_JWT_EXPIRATION,
        noTimestamp: true,
      },
      (err, token) => {
        if (err) {
          reject(err);
        } else {
          // TokenStore.setex(`auth:${token}`, AUTH_JWT_EXPIRATION, userId);
          resolve(token);
        }
      },
    );
  });
}

export async function validateAccessToken(token, audience = CONST.ROLE.USER) {
  return new Promise((resolve, reject) => {
    jsonwebtoken.verify(
      token,
      AUTH_JWT_SECRET,
      {
        // audience,
      },
      (err, payload) => {
        if (err) {
          // reject(err);
          resolve(null);
        } else {
          // TokenStore.get(`auth:${token}`, () => { /* ... */});
          resolve(payload);
        }
      },
    );
  });
}

const AUTH_HEADER_BEARER = /^Bearer /g;
const AUTH_HEADER_JWT = /^JWT /g;

export function extractAccessTokenFromRequest(req) {
  let token;

  token = req.headers.authorization || '';

  if (AUTH_HEADER_BEARER.test(token)) {
    token = token.replace(AUTH_HEADER_BEARER, '').trim();
  } else if (AUTH_HEADER_JWT.test(token)) {
    token = token.replace(AUTH_HEADER_JWT, '').trim();
  } else if (process.env.NODE_ENV === 'development' && req.query.accessToken) {
    token = req.query.accessToken;
  } else {
    token = '';
  }

  return token;
}

export async function createAdministratorUser({ userAccount: userAccountData, userProfile: userProfileData }) {
  userAccountData = userAccountData || {};
  userProfileData = userProfileData || {};

  let userAccountRecord = { ...userAccountData };
  let userProfileRecord = { ...userProfileData };

  let issues = [];
  let _issues;

  [userAccountRecord, _issues] = UserAccount.helpers.validate(userAccountRecord, true);
  issues = [...issues, ..._issues];

  [userProfileRecord, _issues] = UserProfile.helpers.validate(userProfileRecord, true);
  issues = [...issues, ..._issues];

  if (issues.length) {
    throw new Errors.ValidationError(null, null, { issues });
  }

  userAccountRecord.role = CONST.ROLE.ADMIN;
  userAccountRecord.email = userAccountData.email;
  userAccountRecord.password = await encryptPassword(userAccountData.password || 'password');

  let userAccount = await UserAccount.collection.create(userAccountRecord).fetch();

  const userProfile = await UserProfile.collection
    .create({
      ...userProfileRecord,
      id: userAccount.id,
      _account: userAccount.id,
    })
    .fetch();

  userAccount = await UserAccount.collection.updateOne(userAccount.id, {
    _profile: userProfile.id,
  });

  return {
    userAccount,
    userProfile,
  };
}

export async function createUser({ userAccount: userAccountData, userProfile: userProfileData }) {
  userAccountData = userAccountData || {};
  userProfileData = userProfileData || {};

  let userAccountRecord = { ...userAccountData };
  let userProfileRecord = { ...userProfileData };

  let issues = [];
  let _issues;

  [userAccountRecord, _issues] = UserAccount.helpers.validate(userAccountRecord, true);
  issues = [...issues, ..._issues];

  [userProfileRecord, _issues] = UserProfile.helpers.validate(userProfileRecord, true);
  issues = [...issues, ..._issues];

  if (issues.length) {
    throw new Errors.ValidationError(null, null, { issues });
  }

  userAccountRecord.role = CONST.ROLE.USER;
  userAccountRecord.email = userAccountData.email;
  userAccountRecord.password = await encryptPassword(userAccountData.password || 'password');

  let userAccount = await UserAccount.collection.create(userAccountRecord).fetch();

  const userProfile = await UserProfile.collection
    .create({
      ...userProfileRecord,
      id: userAccount.id,
      _account: userAccount.id,
    })
    .fetch();

  userAccount = await UserAccount.collection.updateOne(userAccount.id, {
    _profile: userProfile.id,
  });

  return {
    userAccount,
    userProfile,
  };
}
