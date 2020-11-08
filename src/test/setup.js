/* eslint-env jest */

import { spawn } from 'child_process';

import * as CONFIG from '~/common/config';

import Data from '~/common/data';
import * as DataUtils from '~/common/data/utils';

import { createLogger } from '~/common/logger';

const Logger = createLogger($filepath(__filename));

export function setupWithData(mode) {
  beforeAll(async () => {
    jest.setTimeout(30000);

    if (mode === 'seed') {
      await DataUtils.seed();
    } else {
      await DataUtils.clear();
    }

    await Data.setup();
  });

  afterAll(async (next) => {
    await Data.shutdown();
    next();
  });
}

export function setupWithRunningApp(mode) {
  let app = null;

  beforeAll(async (next) => {
    jest.setTimeout(30000);

    if (mode === 'seed') {
      await DataUtils.seed();
    } else {
      await DataUtils.clear();
    }

    await Data.setup();

    Logger.debug('running app');

    app = spawn('node', ['-r', 'esm', './app-all.js']);

    let started = false;

    app.stdout.on('data', (data) => {
      if (!started && data.toString().includes(`ready on port ${CONFIG.API_PORT}`)) {
        started = true;
        setTimeout(() => next(), 1000);
      }
    });
  });

  beforeEach((next) => {
    setTimeout(() => next(), 1000);
  });

  afterAll(async (next) => {
    await Data.shutdown();
    app.on('exit', () => next());
    app.kill('SIGINT');
  });
}
