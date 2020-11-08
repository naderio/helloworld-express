// import '~/common/init/exit-in-production';
import '~/common/init/role/script';
import '~/common/init';

import { GlobalEvents } from '~/common/events';

import * as CONFIG from '~/common/config';

import Data from '~/common/data';
import Job from '~/common/job';

import { createLogger } from '~/common/logger';

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
    Logger.info('initiating ...');
    await setup();
    Logger.info('processing ...');

    // @PLACEHOLDER for custom scripts

    Logger.info('done');
    GlobalEvents.emit('shutdown');
  } catch (error) {
    Logger.error(error.message, JSON.stringify(error, null, 2), error.stack);
    GlobalEvents.emit('shutdown', 1);
  }
})();

GlobalEvents.once('shutdown', shutdown);
