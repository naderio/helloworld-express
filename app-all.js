import '~/common/init/role/all';
import '~/common/init';

import { GlobalEvents } from '~/common/events';

import Data from '~/common/data';
import Job from '~/common/job';
import Core from '~/common/core';
import API from '~/common/api';

import { createLogger } from '~/common/logger';

const Logger = createLogger($filepath(__filename));

async function setup() {
  await Data.setup();
  await Job.setup();
  await Core.setup();
  await API.setup();
}

async function shutdown() {
  await API.shutdown();
  await Core.shutdown();
  await Job.shutdown();
  await Data.shutdown();
}

(async () => {
  try {
    Logger.info('initiating ...');
    await setup();

    await Core.run();

    await Promise.all([API.run(), Job.run()]);

    process.nextTick(() => {
      GlobalEvents.emit('core-ready');
      GlobalEvents.emit('api-ready');
      GlobalEvents.emit('job-ready');
    });

    Logger.info('ready');
  } catch (error) {
    Logger.error(error.message, JSON.stringify(error, null, 2), error.stack);
    GlobalEvents.emit('shutdown', 1);
  }
})();

GlobalEvents.once('shutdown', shutdown);
