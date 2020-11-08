import * as graphql from 'graphql';

import * as UserAccount from '../auth/UserAccount.model';
import * as UserProfile from '../auth/UserProfile.model';

import { withUserProfile } from '../auth/auth.middleware';

export default () => ({
  queries: {
    self: {
      description: 'fetch user account and profile',
      get type() {
        return new graphql.GraphQLObjectType({
          name: 'UserSelf',
          fields: () => ({
            userAccount: { type: UserAccount.collection.graphql.customTypes.OwnUserAccount },
            userProfile: { type: UserProfile.collection.graphql.type },
          }),
        });
      },
      async resolve(parent, args, req) {
        await withUserProfile(req);

        const { userAccount, userProfile } = req;

        return {
          userAccount: UserAccount.collection.toOwnUserAccount(userAccount),
          userProfile,
        };
      },
    },
  },
});
