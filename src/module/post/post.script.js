import '~/common/init/role/script';
import '~/common/init';

import { GlobalEvents } from '~/common/events';

import Data from '~/common/data';
import Job from '~/common/job';

import { createLogger } from '~/common/logger';
import * as Post from './Post.model';

const Logger = createLogger($filepath(__filename));

async function setup() {
  await Data.setup();
  await Job.setup();
}

async function shutdown() {
  await Job.shutdown();
  await Data.shutdown();
}

(async () => {
  try {
    Logger.debug('initiating ...');
    await setup();
    Logger.debug('processing ...');

    const records = await Post.collection.find().where({});

    Logger.debug(records);
    Logger.debug(JSON.stringify(records, null, 2));

    Logger.debug('done');
    GlobalEvents.emit('shutdown');
  } catch (error) {
    Logger.error(error.message, JSON.stringify(error, null, 2), error.stack);
    GlobalEvents.emit('shutdown', 1);
  }
})();

GlobalEvents.once('shutdown', shutdown);
