/**
 * Sanitation
 */

/**
 *
 * @param {string} value
 * @returns {string}
 */
export function email(value) {
  return value.trim().toLowerCase();
}
