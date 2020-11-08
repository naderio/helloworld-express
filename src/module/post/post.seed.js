import * as CONST from '~/common/const';

import * as UserAccount from '../auth/UserAccount.model';
import * as Post from './Post.model';

import * as SharedUtils from '~/shared/utils';

import { createLogger } from '~/common/logger';

const Logger = createLogger($filepath(__filename));

export default async () => {
  const users = await UserAccount.collection.find().where({
    role: CONST.ROLE.USER,
  });

  const mainUser = users.find((user) => user.email === 'user@helloworld.nader.tech');
  const otherUsers = users.filter((user) => user.email !== 'user@helloworld.nader.tech');

  let record;

  for (let i = 1; i < 10; i += 1) {
    record = await Post.collection
      .create({
        title: `Title #${i}`,
        body: '...',
        // pictureUrl: 'https://placeimg.com/640/480/nature',
        pictureUrl: `https://picsum.photos/seed/helloworld-${i}/600/400`,
        _owner: i <= 3 ? mainUser.id : SharedUtils.getRandomArrayItem(otherUsers).id,
        // _owner: users[0].id,
      })
      .fetch();

    Logger.debug(record);
  }
};
