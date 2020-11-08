/** @module common/data/graphql */

import * as graphql from 'graphql';

import DataWaterline from './waterline';

import * as APP_CONFIG from '../../../app-config';

import { GraphQLRaw, GraphQLJSON } from './graphql.types';

import { createLogger } from '~/common/logger';

const Logger = createLogger($filepath(__filename));

const DEFAULTS = {
  graphqlSettings: {
    exclude: false,
    reference: true,
    count: true,
    collection: true,
    record: true,
    customTypes: null,
  },
};

class DataGraphql {
  constructor() {
    // GraphQL schema
    this.schema = null;
  }

  /**
   * GraphQL types
   */

  getGraphqlFieldFromWaterlineAttribute(collectionName, attributeName, attributeConfig) {
    const result = {};

    if (attributeConfig.type === 'string') {
      result.type = graphql.GraphQLString;
    } else if (attributeConfig.type === 'number') {
      result.type = graphql.GraphQLFloat;
    } else if (attributeConfig.type === 'boolean') {
      result.type = graphql.GraphQLBoolean;
    } else if (attributeConfig.type === 'json') {
      result.type = GraphQLJSON;
    } else if (attributeConfig.type === 'ref') {
      result.type = GraphQLRaw;
    } else {
      return null;
    }

    // if (attributeConfig.validations && attributeConfig.validations.isIn) {
    //   result.type = new graphql.GraphQLEnumType({
    //     name: attributeName,
    //     values: attributeConfig.validations.isIn.reduce((acc, item) => ({ ...acc, [item]: { value: item } }), {}),
    //   });
    // }

    return result;
  }

  async generateGraphQLFromWaterline() {
    const { ontology } = DataWaterline;

    const queries = {
      hello: {
        args: {
          name: {
            type: graphql.GraphQLString,
          },
        },
        type: graphql.GraphQLString,
        resolve(parent, args) {
          return `Hello ${args.name || 'World'}!`;
        },
      },
    };

    const mutations = {
      sayHello: {
        args: {
          name: {
            type: graphql.GraphQLString,
          },
        },
        type: graphql.GraphQLString,
        resolve(parent, args) {
          return `Hello ${args.name}!`;
        },
      },
    };

    Object.values(ontology.collections).forEach((collection) => {
      if (collection.junctionTable || collection.identity === 'archive') {
        collection.graphqlSettings = {
          exclude: true,
        };
        return;
      }

      collection.graphqlSettings = {
        ...DEFAULTS.graphqlSettings,
        ...collection.graphqlSettings,
      };
    });

    Object.values(ontology.collections).forEach((collection) => {
      if (collection.graphqlSettings.exclude) {
        return;
      }

      const collectionName = collection.tableName;

      const collectionFields = Object.entries(collection.attributes).reduce((acc, [attributeName, attributeConfig]) => {
        if (collection.serializationOmitAttributes.includes(attributeName)) {
          return acc;
        }

        if (collection.graphqlOmitAttributes.includes(attributeName)) {
          return acc;
        }

        let field;

        if (attributeName === collection.primaryKey) {
          field = {
            type: graphql.GraphQLID,
          };
        } else if (attributeConfig.model && ontology.collections[attributeConfig.model].graphqlSettings.reference) {
          field = {
            get type() {
              return ontology.collections[attributeConfig.model].graphql.type;
            },
            resolve(parent) {
              return ontology.collections[attributeConfig.model].findOne(parent[attributeName]);
            },
          };
        } else if (
          attributeConfig.collection &&
          ontology.collections[attributeConfig.collection].graphqlSettings.reference
        ) {
          field = {
            get type() {
              return new graphql.GraphQLList(ontology.collections[attributeConfig.collection].graphql.type);
            },
            async resolve(parent, args) {
              const [targetCollection, throughCollection, attributes] = collection.association(attributeName);

              let ids = null;

              if (throughCollection) {
                const data = await throughCollection.find().where({
                  [attributes.self]: parent.id,
                });
                ids = data.map((item) => item[attributes.target]);
              }

              let data = [];

              if (ids) {
                data = await targetCollection.find(ids);
              } else {
                data = await targetCollection.find().where({
                  [attributes.self]: parent.id,
                });
              }

              return data;
            },
          };
        } else {
          field = this.getGraphqlFieldFromWaterlineAttribute(collectionName, attributeName, attributeConfig);
        }

        if (!field) {
          return acc;
        }

        return {
          ...acc,
          [attributeName]: field,
        };
      }, {});

      const CollectionType = new graphql.GraphQLObjectType({
        name: collectionName,
        fields: collectionFields,
      });

      const collectionArgs = Object.entries(collectionFields).reduce((acc, [key, value]) => {
        if (collection.attributes[key].collection) {
          return acc;
        }
        return {
          ...acc,
          [key]: value.resolve
            ? {
                type: graphql.GraphQLID,
              }
            : value,
        };
      }, {});

      collection.graphql = {
        name: collectionName,
        args: collectionArgs,
        fields: collectionFields,
        type: CollectionType,
      };

      const FilterType = new graphql.GraphQLInputObjectType({
        name: `${collectionName}Filter`,
        fields: {
          ...collectionArgs,
        },
      });

      if (collection.graphqlSettings.count) {
        const query =
          collection.graphqlSettings.count === 'simple'
            ? {
                name: `${collectionName}Count`,
                description: `fetch ${collectionName} count`,
                type: graphql.GraphQLInt,
                resolve(parent, args) {
                  return collection.count();
                },
              }
            : {
                name: `${collectionName}Count`,
                description: `fetch ${collectionName} count`,
                args: {
                  filter: {
                    type: FilterType,
                  },
                },
                type: graphql.GraphQLInt,
                resolve(parent, args) {
                  return collection.count().where(args.filter);
                },
              };

        queries[query.name] = query;
      }

      if (collection.graphqlSettings.collection) {
        const query =
          collection.graphqlSettings.collection === 'simple'
            ? {
                name: `${collectionName}Collection`,
                description: `fetch ${collectionName} collection`,
                type: new graphql.GraphQLList(CollectionType),
                resolve(parent, args) {
                  return collection.find();
                },
              }
            : {
                name: `${collectionName}Collection`,
                description: `fetch ${collectionName} collection`,
                args: {
                  filter: {
                    type: FilterType,
                  },
                  offset: {
                    type: graphql.GraphQLInt,
                  },
                  limit: {
                    type: graphql.GraphQLInt,
                  },
                  sort: {
                    type: graphql.GraphQLString,
                  },
                },
                type: new graphql.GraphQLList(CollectionType),
                resolve(parent, args) {
                  return collection.find().where(args.filter).skip(args.offset).limit(args.limit).sort(args.sort);
                },
              };

        queries[query.name] = query;
      }

      if (collection.graphqlSettings.record) {
        const query = {
          name: `${collectionName}Record`,
          description: `fetch ${collectionName} record`,
          args: {
            [collection.primaryKey]: { type: graphql.GraphQLID },
          },
          type: CollectionType,
          resolve(parent, args) {
            return collection.findOne(args);
          },
        };

        queries[query.name] = query;
      }

      if (collection.graphqlSettings.customTypes) {
        collection.graphql.customTypes = collection.graphqlSettings.customTypes(collection);
      }
    });

    for (const filename of APP_CONFIG.GRAPHQL_FILES) {
      Logger.info('loading', filename);
      // eslint-disable-next-line no-await-in-loop
      const { default: getGraphqlDefinition } = await import(filename);
      const graphqlDefinition = getGraphqlDefinition();
      Object.assign(queries, graphqlDefinition.queries);
      Object.assign(mutations, graphqlDefinition.mutations);
    }

    const query = new graphql.GraphQLObjectType({
      name: 'Query',
      description: 'Query',
      fields: () => queries,
    });

    const mutation = new graphql.GraphQLObjectType({
      name: 'Mutation',
      description: 'Mutation',
      fields: () => mutations,
    });

    const schema = new graphql.GraphQLSchema({
      query,
      mutation,
    });

    return schema;
  }

  /**
   * setup
   *
   * @returns {Promise}
   */
  async setup() {
    Logger.info('setup ...');

    this.schema = await this.generateGraphQLFromWaterline();

    Logger.info('setup done');

    return this.schema;
  }

  /**
   * shutdown
   *
   * @returns {Promise}
   */
  async shutdown() {
    Logger.info('shutdown ...');

    this.schema = null;

    Logger.info('shutdown done');
  }

  /**
   * clear
   *
   * @returns {Promise}
   */
  async clear() {
    // nothing to clear
  }
}

export default new DataGraphql();

// @TODO allow filtering by many-to-many association in collection queries
