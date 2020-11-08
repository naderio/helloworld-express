export const definition = {
  identity: 'user_profile',

  tableName: 'user_profile',

  attributes: {
    _account: {
      model: 'user_account',
    },
  },

  serializationOmitAttributes: ['_account'],

  graphqlSettings: {
    count: false,
    collection: false,
    record: false,
  },
};

export const helpers = {};

export const collection = {};
