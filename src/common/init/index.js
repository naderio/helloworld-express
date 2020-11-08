/*
 * Load polyfills
 */

import '../polyfill';

/*
 * Define globals
 */

import './global';

/*
 * Load environment variables
 */
import './env';

/*
 * Load configurations
 */

import * as CONFIG from '../config';

/*
 * Load global event bus
 */

import { GlobalEvents } from '../events';

/*
 * Setup logger
 */

import { setupLogger, enableLogger, Logger } from '../logger';

const PREFIX = 'HelloWorld';

setupLogger(PREFIX);

const ENABLED_LOGGER = process.env.NODE_ENV === 'test' ? '' : process.env.DEBUG || `${PREFIX}*`;

enableLogger(ENABLED_LOGGER);

/*
 * Handle shutdown
 */

process.on('SIGINT', () => {
  Logger.info('shutdown initiated ...');
  process.nextTick(() => GlobalEvents.emit('shutdown'));
});

GlobalEvents.once('shutdown', (code = 0) => {
  setTimeout(() => {
    Logger.info('exiting');
    process.nextTick(() => process.exit(code));
  }, 1000);
});

/**
 * Log configurations in development
 */

if (process.env.NODE_ENV === 'development') {
  Logger.debug('CONFIG', JSON.stringify(CONFIG, null, 2));
}
