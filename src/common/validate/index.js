export * from './validate';

const UUID_REGEXP = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 *
 * @param {string} value
 * @returns {boolean}
 */
export function isID(value) {
  return UUID_REGEXP.test(value);
}
