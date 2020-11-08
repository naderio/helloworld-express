import '~/common/init/role/console';
import '~/common/init';

import repl from 'repl';
import { GlobalEvents } from '~/common/events';

import Data from '~/common/data';
import Job from '~/common/job';

import { createLogger } from '~/common/logger';

import API from '~/common/api';
import * as CONFIG from '~/common/config';
import * as CONST from '~/common/const';
import * as Errors from '~/common/errors';
import * as Validate from '~/common/validate';
import * as Sanitize from '~/common/sanitize';
import * as DataUtils from '~/common/data/utils';
import * as PermanentDataStore from '~/common/PermanentDataStoreService';
import * as TransientDataStore from '~/common/TransientDataStoreService';

const Logger = createLogger($filepath(__filename));

const context = {
  Logger,
  API,
  CONFIG,
  GlobalEvents,
  CONST,
  Errors,
  Validate,
  Sanitize,
  Data,
  DataUtils,
  PermanentDataStore,
  TransientDataStore,
};

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

    let appConsole = null;

    Object.assign(context, Data.Waterline.models);

    context.Job = Job;

    context.$globalize = (...args) => {
      appConsole.context.$outcome = args;
    };

    context.$callback = (err, result) => {
      appConsole.context.$err = err;
      appConsole.context.$result = result;
    };

    context.$promiseResult = (result) => {
      appConsole.context.$result = result;
      appConsole.context.$error = null;
    };

    context.$promiseError = (error) => {
      appConsole.context.$result = null;
      appConsole.context.$error = error;
    };

    appConsole = repl.start();

    Object.assign(appConsole.context, context);

    Logger.info('ready');
  } catch (error) {
    Logger.error(error.message, JSON.stringify(error, null, 2), error.stack);
    GlobalEvents.emit('shutdown', 1);
  }
})();

GlobalEvents.once('shutdown', shutdown);
