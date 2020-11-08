import * as AuthService from './AuthService';

import { createLogger } from '~/common/logger';

const Logger = createLogger($filepath(__filename));

export default async () => {
  let record;

  record = await AuthService.createAdministratorUser({
    userAccount: {
      password: 'password',
      email: 'admin@helloworld.nader.tech',
      name: 'Administrator',
      pictureUrl: 'https://randomuser.me/api/portraits/lego/1.jpg',
    },
    userProfile: {},
  });

  Logger.debug(record);

  record = await AuthService.createUser({
    userAccount: {
      password: 'password',
      email: 'user@helloworld.nader.tech',
      name: 'User',
      pictureUrl: 'https://randomuser.me/api/portraits/lego/2.jpg',
    },
    userProfile: {},
  });

  Logger.debug(record);

  for (let i = 1; i < 10; i += 1) {
    record = await AuthService.createAdministratorUser({
      userAccount: {
        password: 'password',
        email: `admin+${i}@helloworld.nader.tech`,
        name: `Administrator ${i}`,
      },
      userProfile: {},
    });

    record = await AuthService.createUser({
      userAccount: {
        password: 'password',
        email: `user+${i}@helloworld.nader.tech`,
        name: `User ${i}`,
        pictureUrl: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/1${i}.jpg`,
      },
      userProfile: {},
    });
  }
};
