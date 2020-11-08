/** @module common/const */

import * as CONST from './const';

export * from './const';

export const DATE_REGEXP = /^\d{4}-\d{2}-\d{2}$/;

export const TIME_REGEXP = /^\d{2}:\d{2}$/;

export const AUDIENCE = Object.freeze({
  ADMIN: CONST.ROLE.ADMIN,
  USER: CONST.ROLE.USER,
});

export const AUDIENCE_TO_ROLES = {
  [AUDIENCE.ADMIN]: [CONST.ROLE.ADMIN],
  [AUDIENCE.USER]: [CONST.ROLE.USER],
};

export const ROLE_TO_ROLES = {
  [CONST.ROLE.ADMIN]: [CONST.ROLE.ADMIN, CONST.ROLE.USER],
  [CONST.ROLE.USER]: [CONST.ROLE.USER],
};
