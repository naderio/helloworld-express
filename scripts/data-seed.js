import '~/common/init/role/core-script';
import '~/common/init';

import { GlobalEvents } from '~/common/events';

import Data from '~/common/data';

import * as APP_CONFIG from '../app-config';

import { createLogger } from '~/common/logger';

const Logger = createLogger($filepath(__filename));

async function setup() {
  await Data.setup();
}

async function shutdown() {
  await Data.shutdown();
}

(async () => {
  try {
    Logger.info('initiating ...');
    await setup();
    Logger.info('processing ...');

    for (const filename of APP_CONFIG.SEED_FILES) {
      Logger.info('loading', filename);
      // eslint-disable-next-line no-await-in-loop
      const { default: seed } = await import(filename);
      // eslint-disable-next-line no-await-in-loop
      await seed();
    }

    Logger.info('done');
    GlobalEvents.emit('shutdown');
  } catch (error) {
    Logger.error(error.message, JSON.stringify(error, null, 2), error.stack);
    GlobalEvents.emit('shutdown', 1);
  }
})();

GlobalEvents.once('shutdown', shutdown);
