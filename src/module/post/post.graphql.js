import * as graphql from 'graphql';

import * as Post from './Post.model';

export default () => ({
  queries: {
    postFeed: {
      description: 'fetch posts feed',
      get type() {
        return new graphql.GraphQLList(Post.collection.graphql.type);
      },
      resolve(parent, args, req) {
        return Post.collection.find();
      },
    },
    ownPosts: {
      description: 'fetch own posts',
      get type() {
        return new graphql.GraphQLList(Post.collection.graphql.type);
      },
      resolve(parent, args, req) {
        return Post.collection.find().where({
          _owner: req.userAccount.id,
        });
      },
    },
  },
});
