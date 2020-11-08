/** @module common/auth/middleware */

import * as CONST from '~/common/const';

import * as Errors from '~/common/errors';

import * as UserAccount from './UserAccount.model';
import * as UserProfile from './UserProfile.model';

import * as AuthService from './AuthService';

const throwError = (error) => {
  if (error) {
    throw error;
  }
};

/**
 * Anonymous User
 */

export function withAnonymousUser(req, res, next) {
  req.allowAnonymous = true;
  next();
}

/**
 * Authenticated User
 */

export async function withAuthenticatedUser(req, res, next) {
  const accessToken = AuthService.extractAccessTokenFromRequest(req);

  const accessTokenPayload = await AuthService.validateAccessToken(accessToken);

  if (accessTokenPayload) {
    req.audience = accessTokenPayload.aud;
    req.userAccount = await UserAccount.collection.findOne(accessTokenPayload.id);
  }

  if (req.allowAnonymous && !req.userAccount) {
    req.audience = CONST.AUDIENCE.USER;
    req.userAccount = {
      id: 'anonymous',
      role: CONST.ROLE.USER,
      _profile: 'anonymous',
      toJSON() {
        return this;
      },
    };
  }

  if (!req.userAccount) {
    next(new Errors.UnauthenticatedError());
    return;
  }

  if (!CONST.AUDIENCE_TO_ROLES[req.audience].includes(req.userAccount.role)) {
    next(new Errors.UnauthorizedError());
    return;
  }

  next();
}

/**
 * Role-restricted Access
 */

export function withRoleRestriction(role) {
  return (req, res, next = throwError) => {
    if (!CONST.ROLE_TO_ROLES[req.userAccount.role].includes(role)) {
      next(new Errors.UnauthorizedError());
      return;
    }
    next();
  };
}

withRoleRestriction[CONST.ROLE.ADMIN] = withRoleRestriction(CONST.ROLE.ADMIN);
withRoleRestriction[CONST.ROLE.USER] = withRoleRestriction(CONST.ROLE.USER);

/**
 * Permission-restricted Access
 */

export function withPermissionRestriction(permission) {
  return (req, res, next = throwError) => {
    if (!req.userAccount.permissions.include(permission)) {
      next(new Errors.UnauthorizedError());
      return;
    }
    next();
  };
}

/**
 * Load user profile
 */

export async function withUserProfile(req, res, next = throwError) {
  req.userProfile = await UserProfile.collection.findOne(req.userAccount._profile);
  next();
}
