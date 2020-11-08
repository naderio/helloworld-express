import '~/common/init/role/job';
import '~/common/init/id';
import '~/common/init';

import { GlobalEvents } from '~/common/events';

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

    await Job.run();

    process.nextTick(() => GlobalEvents.emit('job-ready'));

    Logger.info('ready');
  } catch (error) {
    Logger.error(error.message, JSON.stringify(error, null, 2), error.stack);
    GlobalEvents.emit('shutdown', 1);
  }
})();

GlobalEvents.once('shutdown', shutdown);
