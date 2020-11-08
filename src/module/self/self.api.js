import express from 'express';

import { withUserProfile } from '../auth/auth.middleware';

import * as UserAccount from '../auth/UserAccount.model';

export const router = express.Router();

router.get('/self', withUserProfile, async (req, res) => {
  const { userAccount, userProfile } = req;

  res.send({
    userAccount: UserAccount.collection.toOwnUserAccount(userAccount),
    userProfile,
  });
});

router.post('/self/edit', async (req, res) => {
  const { name, pictureUrl } = req.body;

  const userAccount = await UserAccount.collection.updateOne(req.userAccount.id, {
    name,
    pictureUrl,
  });

  res.send({
    userAccount,
  });
});
