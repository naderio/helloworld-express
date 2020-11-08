/**
 * Transformation
 */

/**
 *
 * @param {string} value
 * @returns {string}
 */
export function slugify(value) {
  return value
    .normalize('NFD')
    .trim()
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+)|(-+$)/g, '');
}
