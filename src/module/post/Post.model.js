import * as DataMixin from '~/common/data/mixin';
import { slugify } from '~/common/transform';

export const definition = {
  identity: 'post',

  tableName: 'Post',

  attributes: {
    title: {
      type: 'string',
      required: true,
    },

    slug: {
      type: 'string',
    },

    body: {
      type: 'string',
      required: true,
    },

    pictureUrl: {
      type: 'string',
      defaultsTo: '',
    },

    createdAt: { ...DataMixin.attributes.createdAt },

    updatedAt: { ...DataMixin.attributes.updatedAt },

    _owner: {
      model: 'user_account',
    },
  },

  // graphqlSettings: {
  //   count: false,
  //   collection: false,
  //   record: false,
  // },

  async onReady() {
    await this.nativeCollection.ensureIndex({
      title: 1,
    });
  },

  beforeSave(record, next) {
    if (record.title) {
      record.slug = slugify(record.title);
    }
    next();
  },
};

export const helpers = {};

export const collection = {};
