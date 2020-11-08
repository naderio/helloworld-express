/** @module common/TransientDataStore */

import DataRedisStorage from './data/redis.storage';

/**
 * retrieve `key` from redis store
 *
 * @param {string} key
 * @param {*} defaultValue
 */
export async function retrieve(key, defaultValue = null) {
  const value = await DataRedisStorage.client.get(key);
  return value ? JSON.parse(value) : defaultValue;
}

/**
 * store `value` with `key` in redis store
 *
 * @param {string} key
 * @param {*} value
 */
export async function store(key, value) {
  if (typeof value === 'undefined') {
    value = null;
  }
  await DataRedisStorage.client.set(key, JSON.stringify(value));
}

/**
 * clear `key` from redis store
 *
 * @param {*} key
 */
export async function clear(key) {
  await DataRedisStorage.client.del(key);
}

/**
 * store `value` with `key` and expiry in redis store
 *
 * @param {string} key
 * @param {*} value
 * @param {number} expiry - in seconds
 */
export async function storeWithExpiry(key, value, expiry) {
  if (typeof value === 'undefined') {
    value = null;
  }
  await DataRedisStorage.client.setex(key, expiry, JSON.stringify(value));
}
