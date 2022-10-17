import express from 'express';

import * as CONST from '~/common/const';

import * as Errors from '~/common/errors';

import * as CONFIG from '~/common/config';

import * as Sanitize from '~/common/sanitize';

import * as EmailJob from '~/shared/email.job';
import * as DataUtils from '~/common/data/utils';
import * as TransientDataStore from '~/common/TransientDataStoreService';
import * as UserAccount from './UserAccount.model';
import * as UserProfile from './UserProfile.model';

import * as AuthService from './AuthService';

import { withAuthenticatedUser } from './auth.middleware';

export const prefix = '';

export const router = express.Router();

router.get('/auth/check', withAuthenticatedUser, async (req, res) => {
  res.send({});
});

router.post('/auth/login', async (req, res) => {
  let { username, password } = req.body;

  const audience = CONST.normalize(req.query.audience, CONST.AUDIENCE, CONST.AUDIENCE.USER);

  if (!username || !password) {
    throw new Errors.InvalidCredentialsError();
  }

  username = (username || '').trim().toLowerCase();

  const userAccount = await UserAccount.collection.findOne({
    email: username,
  });

  if (!userAccount || !CONST.AUDIENCE_TO_ROLES[audience].includes(userAccount.role)) {
    throw new Errors.InvalidCredentialsError();
  }

  const validPassword = await AuthService.comparePassword(password, userAccount.password);

  if (!validPassword) {
    throw new Errors.InvalidCredentialsError();
  }

  const userProfile = await UserProfile.collection.findOne(userAccount._profile);

  const accessToken = await AuthService.generateAccessToken(userAccount.id, audience);

  res.send({
    accessToken,
    userAccount: UserAccount.collection.toOwnUserAccount(userAccount),
    userProfile,
  });
});

router.post('/auth/signup', async (req, res) => {
  const record = await AuthService.createUser({
    userAccount: req.body.userAccount,
    userProfile: req.body.userProfile,
  });

  const { userAccount, userProfile } = record;

  EmailJob.queue.add({
    to: userAccount.email,
    subject: 'Welcome to Hello World',
    template: 'src/module/auth/signup-welcome',
    templateContext: {
      continueUrl: `${CONFIG.USER_APP_URL}/signup/perform?token=12346789`,
    },
  });

  const accessToken = await AuthService.generateAccessToken(userAccount.id);

  res.send({
    accessToken,
    userAccount: UserAccount.collection.toOwnUserAccount(userAccount),
    userProfile,
  });
});

router.post('/auth/password-reset/initiate', async (req, res) => {
  const email = Sanitize.email(req.body.email || '');

  if (!email) {
    throw new Errors.InvalidRequestError(); // @TODO better code and message
  }

  const userAccount = await UserAccount.collection.findOne({
    email,
  });

  if (userAccount) {
    const token = DataUtils.generateToken();
    const tokenPayload = {
      email,
    };

    await TransientDataStore.storeWithExpiry(`password-reset:${token}`, tokenPayload, (3 * CONST.DURATION_DAY) / 1000);

    EmailJob.queue.add({
      to: email,
      subject: 'Password Reset',
      template: 'src/module/auth/password-reset',
      templateContext: {
        continueUrl: `${CONFIG.USER_APP_URL}/password-reset/perform?token=${token}`,
      },
    });
  }

  res.send({});
});

router.post('/auth/password-reset/perform', async (req, res) => {
  const { token, password } = req.body;

  const tokenPayload = await TransientDataStore.retrieve(`password-reset:${token}`);

  if (tokenPayload === null) {
    throw new Errors.InvalidRequestError(); // @TODO better code and message
  }

  const encryptedPassword = await AuthService.encryptPassword(password);

  const userAcount = await UserAccount.collection.updateOne(
    {
      email: tokenPayload.email,
    },
    {
      password: encryptedPassword,
    },
  );

  await TransientDataStore.clear(`password-reset:${token}`);

  EmailJob.queue.add({
    to: userAcount.email,
    subject: 'Password Reset Confirmation',
    template: 'src/module/auth/password-reset-complete',
    templateContext: {
      userAccount: userAcount.toJSON(),
    },
  });

  res.send({});
});

router.post('/auth/change-email', withAuthenticatedUser, async (req, res) => {
  const payload = req.body;

  const existingUserAccount = await UserAccount.collection.findOne({
    email: payload.email,
  });

  if (!existingUserAccount) {
    throw new Errors.NotFoundError();
  }

  const userAccount = await UserAccount.collection.updateOne(req.userAccount.id, {
    email: payload.email,
  });

  // @TODO send validation email

  res.send({
    userAccount,
  });
});

router.post('/auth/change-password', withAuthenticatedUser, async (req, res) => {
  const { password, newPassword } = req.body;

  const isIdentical = await AuthService.comparePassword(password, req.userAccount.password);

  if (!isIdentical) {
    throw new Errors.InvalidCredentialsError();
  }

  const encryptedNewPassword = await AuthService.encryptPassword(newPassword);

  await UserAccount.collection.updateOne(req.userAccount.id, {
    password: encryptedNewPassword,
  });

  res.send({});
});
