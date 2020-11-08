import express from 'express';

import * as Errors from '~/common/errors';

import { withAuthenticatedUser } from '~/module/auth/auth.middleware';

import * as Post from './Post.model';

export const prefix = '';

export const router = express.Router();

// @TODO validate `postId` route param: if value is not a uuid, throw 404 status

// router.param('postId', (req, res, next, id) => {
//   console.log(id);
//   if (!Validate.isUUID(id)) {
//     next(404);
//     return;
//   }
//   next();
// });

router.get('/user/post/collection', withAuthenticatedUser, async (req, res) => {
  const data = await Post.collection.find().where({
    _owner: req.userAccount.id,
  });

  res.send({
    data,
  });
});

router.get('/user/post/:postId', withAuthenticatedUser, async (req, res) => {
  const data = await Post.collection.findOne(req.params.postId);

  if (!data) {
    throw new Errors.NotFoundError();
  }

  res.send({
    data,
  });
});

router.post('/user/post/create', withAuthenticatedUser, async (req, res) => {
  const [record, issues] = Post.helpers.validate(
    {
      ...req.body.data,
      _owner: req.userAccount.id,
    },
    true,
  );

  if (issues.length) {
    throw new Errors.ValidationError(null, null, { issues });
  }

  // record._owner = req.userAccount.id;

  const data = await Post.collection.create(record).fetch();

  res.send({
    data,
  });
});

router.post('/user/post/:postId/edit', withAuthenticatedUser, async (req, res) => {
  const [record, issues] = Post.helpers.validate(req.body.data);

  if (issues.length) {
    throw new Errors.ValidationError(null, null, { issues });
  }

  const data = await Post.collection.updateOne(req.params.postId, record);

  if (!data) {
    throw new Errors.NotFoundError();
  }

  res.send({
    data,
  });
});

router.post('/user/post/:postId/delete', withAuthenticatedUser, async (req, res) => {
  const data = await Post.collection.archiveOne(req.params.postId);

  if (!data) {
    throw new Errors.NotFoundError();
  }

  res.send({});
});
