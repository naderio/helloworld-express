/* eslint-disable max-classes-per-file */
/** @module common/error */

import * as Errors from './errors';

export { BaseError, FailureError, FetchError } from './errors';

/**
 * InvalidRequestError
 *
 * @example throw new InvalidRequestError()
 * @example throw new InvalidRequestError(400, 'InvalidRequest', 'Invalid request', {})
 */

export class InvalidRequestError extends Errors.FailureError {
  constructor(status, code, message, extra) {
    super(code || 'InvalidRequest', message || 'Invalid request', extra);
    this.name = 'InvalidRequestError';
    this.status = status || 400;
  }

  static fromWaterlineError(err) {
    const extra = {
      _err: err,
      issues: [],
    };

    extra.issues.push({
      field: err.details.split('`')[1],
      code: '?', // required, unique, ...
      message: err.details,
    });

    return new InvalidRequestError(null, null, err.details, extra);
  }
}

/**
 * ValidationError
 *
 * @example throw new Errors.ValidationError()
 * @example throw new Errors.ValidationError('InvalidPayload', 'Invalid payload')
 * @example throw new Errors.ValidationError(null, null, { issues: ['email', 'name']})
 */

export class ValidationError extends InvalidRequestError {
  constructor(code, message, extra) {
    super(400, code || 'InvalidRequest', message || 'Invalid request', extra);
    this.name = 'ValidationError';
  }
}

/**
 * InvalidCredentialsError
 *
 * @example throw new Errors.InvalidCredentialsError()
 */

export class InvalidCredentialsError extends InvalidRequestError {
  constructor(message, extra = null) {
    super(400, 'InvalidCredentials', message || 'Invalid credentials', extra);
    this.name = 'InvalidCredentialsError';
  }
}

/**
 * UnauthenticatedError
 *
 * @example throw new Errors.UnauthenticatedError()
 */

export class UnauthenticatedError extends InvalidRequestError {
  constructor(message, extra = null) {
    super(401, 'Unauthenticated', message || 'Unauthenticated', extra);
    this.name = 'UnauthenticatedError';
  }
}

/**
 * UnauthorizedError
 *
 * @example throw new Errors.UnauthorizedError()
 */

export class UnauthorizedError extends InvalidRequestError {
  constructor(message, extra = null) {
    super(403, 'Unauthorized', message || 'Unauthorized', extra);
    this.name = 'UnauthorizedError';
  }
}

/**
 * NotFoundError
 *
 * @example throw new Errors.NotFoundError()
 */

export class NotFoundError extends InvalidRequestError {
  constructor(message, extra = null) {
    super(404, 'NotFound', message || 'Not found', extra);
    this.name = 'NotFoundError';
  }
}
