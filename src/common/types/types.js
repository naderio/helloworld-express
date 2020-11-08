/**
 * @typedef {string} ID
 */

/**
 * @typedef {string} DateString
 */

/**
 * @typedef {string} URI
 */

/**
 * @typedef {'user' | 'admin'} UserRole
 */

/**
 * @typedef {Object} UserAccount
 * @property {ID} id
 * @property {UserRole} role
 * @property {string} email
 * @property {boolean} emailVerified
 * @property {string} password
 * @property {string} name
 * @property {URI} pictureUrl
 * @property {DateString} createdAt
 * @property {DateString} updatedAt
 */

/**
 * @typedef {Object} UserProfile
 * @property {ID} id
 */

/**
 * @typedef {Object} Post
 * @property {ID} id
 * @property {string} title
 * @property {string} slug
 * @property {string} body
 * @property {URI} pictureUrl
 * @property {DateString} createdAt
 * @property {DateString} updatedAt
 */
