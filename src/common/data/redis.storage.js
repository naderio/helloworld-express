/** @module common/data/redis.storage */

import Redis from 'redis';
// eslint-disable-next-line import/no-extraneous-dependencies
import RedisCommands from 'redis-commands';

import { promisify } from 'util';
import * as CONFIG from '~/common/config';

import { createLogger } from '~/common/logger';

const Logger = createLogger($filepath(__filename));

class DataRedisStorage {
  constructor() {
    this.client = null;
  }

  setup() {
    return new Promise((resolve, reject) => {
      Logger.info('setup ...');

      this.client = Redis.createClient(CONFIG.REDIS_STORAGE_URI);

      this.client.on('error', reject);

      this.client.on('ready', () => {
        Logger.info('setup done');

        RedisCommands.list.forEach((command) => {
          this.client[command] = promisify(this.client[command]).bind(this.client);
        });

        resolve(this.client);
      });
    });
  }

  shutdown() {
    return new Promise((resolve, reject) => {
      Logger.info('shutdown ...');

      if (!this.client) {
        Logger.info('shutdown done');
        resolve();
        return;
      }

      this.client.quit((err) => {
        Logger.info('shutdown done', err || '');

        this.client = null;

        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  clear() {
    return this.client.flushdb();
  }
}

export default new DataRedisStorage();
