/** @module common/data/waterline */

import { promisify } from 'util';

import Waterline from 'waterline';
// eslint-disable-next-line import/no-extraneous-dependencies
import WaterlineUtils from 'waterline-utils';

import MemoryAdapter from 'sails-disk';
import MongoAdapter from 'sails-mongo';

import * as CONFIG from '~/common/config';

import { createLogger } from '~/common/logger';
import * as DataUtils from './utils';

import * as APP_CONFIG from '../../../app-config';

const Logger = createLogger($filepath(__filename));

class DataWaterline {
  constructor() {
    this.ontology = null;
    this.models = null;
  }

  /**
   * setup
   *
   * @returns {Promise}
   */
  async setup() {
    Logger.info('setup ...');

    this.models = {};

    for (const filename of APP_CONFIG.MODEL_FILES) {
      Logger.info('loading', filename);
      // eslint-disable-next-line no-await-in-loop
      const Model = await import(filename);
      if (Model.definition) {
        DataUtils.prepareModelDefinition(Model);
        DataUtils.prepareModelHelpers(Model);
        this.models[Model.definition.tableName] = Model;
      }
    }

    const config = {
      adapters: {
        'sails-disk': MemoryAdapter,
        'sails-mongo': MongoAdapter,
      },

      datastores: {
        memory: {
          adapter: 'sails-disk',
          inMemoryOnly: true,
        },
        mongo: {
          adapter: 'sails-mongo',
          url: CONFIG.MONGODB_URI,
        },
        // 'mongo-secondary': {
        //   adapter: 'sails-mongo',
        //   url: CONFIG.MONGODB_SECONDARY_URI,
        // },
      },

      models: Object.values(this.models).reduce(
        (acc, Model) => ({
          ...acc,
          [Model.definition.identity]: Model.definition,
        }),
        {},
      ),

      defaultModelSettings: {
        datastore: 'mongo',
        migrate: process.env.MIGRATE,
        schema: true,
        primaryKey: 'id',
        attributes: {
          id: {
            type: 'string',
            columnName: '_id',
            autoMigrations: {
              autoIncrement: false,
            },
          },
        },
      },
    };

    this.ontology = await promisify(Waterline.start)(config);

    Object.values(this.ontology.collections).forEach((collection) => {
      const { manager } = this.ontology.datastores[collection.datastore].adapter.datastores[collection.datastore];

      collection.nativeManager = manager;

      collection.nativeCollection = manager.collection(collection.tableName);

      if (!this.models[collection.tableName]) {
        return;
      }

      this.models[collection.tableName].collection = collection;
    });

    if (CONFIG.IS_CORE && process.env.MIGRATE !== 'safe') {
      Logger.info('migrate...');
      await new Promise((resolve, reject) => {
        WaterlineUtils.autoMigrations(process.env.MIGRATE, this.ontology, async (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(this.ontology);
          }
        });
      });
      Logger.info('migrate done');
    }

    if (CONFIG.IS_CORE) {
      await Promise.all(
        Object.values(this.models).map(async (Model) => {
          if (!Model.collection.onReady) {
            return;
          }

          await Model.collection.onReady();
        }),
      );
    }

    Logger.info('setup done');

    return this.ontology;
  }

  /**
   * shutdown
   *
   * @returns {Promise}
   */
  shutdown() {
    return new Promise((resolve, reject) => {
      Logger.info('shutdown ...');

      if (!this.ontology) {
        Logger.info('shutdown done');
        resolve();
        return;
      }

      this.ontology.teardown((err) => {
        Logger.info('shutdown done', err || '');

        this.ontology = null;

        this.models = null;

        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * clear
   *
   * @returns {Promise}
   */
  async clear() {
    const nativeClient = this.ontology.datastores.mongo.adapter.datastores.mongo.manager;
    await nativeClient.dropDatabase();
  }
}

export default new DataWaterline();
