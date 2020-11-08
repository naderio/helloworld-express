/** @module common/data/utils */

import { spawn } from 'child_process';

import { promisify } from 'util';

import { v1 as uuidv1, v4 as uuidv4 } from 'uuid';

import { EventEmitter } from '~/common/events';

import * as DataMixin from './mixin';

import { createLogger } from '~/common/logger';

const Logger = createLogger($filepath(__filename));

/**
 * generate a unique id
 *
 * @returns {ID} - unique id (UUID v1)
 */
export function generateUniqueId() {
  return uuidv1();
}

/**
 * generate a token
 *
 * @returns {ID} - token (UUID v4)
 */
export function generateToken() {
  return uuidv4();
}

/**
 * prepare and augment model definition
 *
 * @param {Model} Model - model definition.
 */
export function prepareModelDefinition(Model) {
  const events = new EventEmitter();

  const result = {
    events,
    ...Model.definition,
  };

  result.tableName = result.tableName || result.identity;

  result.dontUseObjectIds = 'dontUseObjectIds' in result ? result.dontUseObjectIds : !result.junctionTable;

  result.primaryKey = result.primaryKey || 'id';

  if (result.dontUseObjectIds && result.primaryKey === 'id') {
    result.attributes = {
      id: {
        type: 'string',
        allowNull: false,
        validations: {
          isUUID: true,
        },
        autoMigrations: {
          columnType: 'string',
          unique: true,
          autoIncrement: false,
        },
      },
      ...result.attributes,
    };
  } else if (!result.attributes[result.primaryKey]) {
    result.attributes = {
      [result.primaryKey]: {
        type: 'string',
        columnName: '_id',
        autoMigrations: {
          autoIncrement: false,
        },
      },
      ...result.attributes,
    };
  }

  Object.values(result.attributes).forEach((config) => {
    config.autoMigrations = config.autoMigrations || {};
  });

  if (!result.validationOmitAttributes) {
    result.validationOmitAttributes = [];
  }

  if (!result.serializationOmitAttributes) {
    result.serializationOmitAttributes = [];
  }

  if (!result.graphqlOmitAttributes) {
    result.graphqlOmitAttributes = [];
  }

  const {
    beforeCreate,
    afterCreate,
    beforeUpdate,
    afterUpdate,
    beforeDestroy,
    afterDestroy,
    beforeSave,
    afterSave,
  } = result;

  if (beforeCreate) {
    events.on('beforeCreate', promisify(beforeCreate.bind(result)));
  }

  if (afterCreate) {
    events.on('afterCreate', promisify(afterCreate.bind(result)));
  }

  if (beforeUpdate) {
    events.on('beforeUpdate', promisify(beforeUpdate.bind(result)));
  }

  if (afterUpdate) {
    events.on('afterUpdate', promisify(afterUpdate.bind(result)));
  }

  if (beforeDestroy) {
    events.on('beforeDestroy', promisify(beforeDestroy.bind(result)));
  }

  if (afterDestroy) {
    events.on('afterDestroy', promisify(afterDestroy.bind(result)));
  }

  if (beforeSave) {
    events.on('beforeSave', promisify(beforeSave.bind(result)));
  }

  if (afterSave) {
    events.on('afterSave', promisify(afterSave.bind(result)));
  }

  Object.assign(result, {
    beforeCreate(recordToCreate, proceed) {
      if (result.dontUseObjectIds && result.primaryKey === 'id') {
        recordToCreate.id = recordToCreate.id || generateUniqueId();
      }

      events
        .emitAsync('beforeCreate', recordToCreate)
        .then(() => events.emitAsync('beforeSave', recordToCreate))
        .then(() => proceed(), proceed);
    },
    afterCreate(newlyCreatedRecord, proceed) {
      events
        .emitAsync('afterCreate', newlyCreatedRecord)
        .then(() => events.emitAsync('afterSave', newlyCreatedRecord))
        .then(() => proceed(), proceed);
    },
    beforeUpdate(valuesToSet, proceed) {
      events
        .emitAsync('beforeUpdate', valuesToSet)
        .then(() => events.emitAsync('beforeSave', valuesToSet))
        .then(() => proceed(), proceed);
    },
    afterUpdate(updatedRecord, proceed) {
      events
        .emitAsync('afterUpdate', updatedRecord)
        .then(() => events.emitAsync('afterSave', updatedRecord))
        .then(() => proceed(), proceed);
    },
    beforeDestroy(criteria, proceed) {
      events.emitAsync('beforeDestroy', criteria).then(() => proceed(), proceed);
    },
    afterDestroy(destroyedRecord, proceed) {
      events.emitAsync('afterDestroy', destroyedRecord).then(() => proceed(), proceed);
    },
  });

  if (!result.customToJSON) {
    result.customToJSON = function () {
      return DataMixin.customToJSON(Model, this);
    };
  }

  result.association = DataMixin.association;

  result.lookupByAssociationWithId = DataMixin.lookupByAssociationWithId;

  Model.definition = result;
}

/**
 * prepare and augment model helpers
 *
 * @param {Model} model - model definition.
 */
export function prepareModelHelpers(model) {
  const result = {
    validate(data, strictMode) {
      return DataMixin.validate(model, data, strictMode);
    },

    ...model.helpers,
  };

  model.helpers = result;
}

/**
 * clear out data stores
 *
 * @returns {Promise}
 */
export function clear() {
  return new Promise((resolve, reject) => {
    Logger.debug('running data:clear');
    spawn('npm', ['run', 'data:clear'], {
      stdio: 'ignore',
    }).on('close', (code) => (code === 0 ? resolve() : reject(new Error('data:clear failed'))));
  });
}

/**
 * seed data stores
 *
 * @returns {Promise}
 */
export function seed() {
  return new Promise((resolve, reject) => {
    Logger.debug('running data:seed');
    spawn('npm', ['run', 'data:seed'], {
      stdio: 'ignore',
    }).on('close', (code) => (code === 0 ? resolve() : reject(new Error('data:seed failed'))));
  });
}
