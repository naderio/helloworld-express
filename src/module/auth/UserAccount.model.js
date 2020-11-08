import * as graphql from 'graphql';

import * as CONST from '~/common/const';

import * as DataMixin from '~/common/data/mixin';

export const definition = {
  identity: 'user_account',

  tableName: 'UserAccount',

  attributes: {
    role: {
      type: 'string',
      required: true,
      validations: {
        isIn: Object.values(CONST.ROLE),
      },
    },

    email: {
      type: 'string',
      required: true,
      validations: {
        isEmail: true,
      },
      autoMigrations: {
        unique: true,
      },
    },

    emailVerified: {
      type: 'boolean',
      defaultsTo: false,
    },

    password: {
      type: 'string',
      required: true,
    },

    name: {
      type: 'string',
      required: true,
    },

    pictureUrl: {
      type: 'string',
      defaultsTo: 'https://randomuser.me/api/portraits/lego/1.jpg',
    },

    createdAt: { ...DataMixin.attributes.createdAt },

    updatedAt: { ...DataMixin.attributes.updatedAt },

    _profile: {
      model: 'user_profile',
    },

    _post_s: {
      collection: 'post',
      via: '_owner',
    },
  },

  validationOmitAttributes: ['role', 'email', 'emailVerified', 'password'],

  serializationOmitAttributes: ['role', 'email', 'emailVerified', 'password', '_profile'],

  graphqlSettings: {
    count: false,
    collection: false,
    record: false,
    customTypes(collection) {
      return {
        OwnUserAccount: new graphql.GraphQLObjectType({
          name: 'OwnUserAccount',
          fields: () => ({
            ...collection.graphql.fields,
            role: { type: graphql.GraphQLString },
            email: { type: graphql.GraphQLString },
            emailVerified: { type: graphql.GraphQLBoolean },
          }),
        }),
      };
    },
  },

  async onReady() {
    await this.nativeCollection.ensureIndex({
      email: 1,
    });
    await this.nativeCollection.ensureIndex({
      name: 1,
    });
  },

  // customToJSON() {
  //   const record = DataMixin.customToJSON(module.exports, this);
  //   record.initials = record.name
  //     .split(/\W+/)
  //     .map((w) => w[0] || '')
  //     .join('')
  //     .toUpperCase();
  //   return record;
  // },

  toOwnUserAccount(userAccount) {
    return {
      role: userAccount.role,
      email: userAccount.email,
      emailVerified: userAccount.emailVerified,
      ...userAccount.toJSON(),
    };
  },
};

export const helpers = {};

export const collection = {};
