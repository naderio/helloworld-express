export const definition = {
  identity: 'store',

  tableName: 'store',

  primaryKey: 'id',

  attributes: {
    id: {
      type: 'string',
      required: true,
      autoMigrations: {
        unique: true,
      },
    },
    value: {
      type: 'json',
      required: true,
    },
  },

  graphqlSettings: {
    exclude: true,
  },
};

export const helpers = {};

export const collection = {};
