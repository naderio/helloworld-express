/** @module common/data */

import { createLogger } from '~/common/logger';
import DataWaterline from './waterline';
import DataGraphql from './graphql';
import DataRedisStorage from './redis.storage';
import DataRedisCache from './redis.cache';

import bootstrap from '../bootstrap';

const Logger = createLogger($filepath(__filename));

class Data {
  constructor() {
    this.Waterline = null;
    this.Graphql = null;
    this.RedisStorage = null;
    this.RedisCache = null;
  }

  /**
   * setup
   *
   * @returns {Promise}
   */
  async setup() {
    Logger.info('setup ...');

    await Promise.all([
      DataWaterline.setup().then(() => DataGraphql.setup()),
      DataRedisStorage.setup(),
      DataRedisCache.setup(),
    ]);

    this.Waterline = DataWaterline;
    this.Graphql = DataGraphql;
    this.RedisStorage = DataRedisStorage;
    this.RedisCache = DataRedisCache;

    await bootstrap();

    Logger.info('setup done');
  }

  /**
   * shutdown
   *
   * @returns {Promise}
   */
  async shutdown() {
    Logger.info('shutdown ...');

    await Promise.all([
      DataWaterline.shutdown(),
      DataGraphql.shutdown(),
      DataRedisStorage.shutdown(),
      DataRedisCache.shutdown(),
    ]);

    this.Waterline = null;
    this.Graphql = null;
    this.RedisStorage = null;
    this.RedisCache = null;

    Logger.info('shutdown done');
  }

  /**
   * clear
   *
   * @returns {Promise}
   */
  async clear() {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    await Promise.all([DataWaterline.clear(), DataGraphql.clear(), DataRedisStorage.clear(), DataRedisCache.clear()]);
  }
}

export default new Data();
