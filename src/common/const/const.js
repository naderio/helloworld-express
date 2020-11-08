export function normalize(value, valueMap, defaultValue) {
  const values = Object.values(valueMap);

  return values.includes(String(value).trim()) ? value : defaultValue || values[0];
}

/**
 * Time Constants
 */

export const DURATION_SECOND = 1000;
export const DURATION_MINUTE = 60 * DURATION_SECOND;
export const DURATION_HOUR = 60 * DURATION_MINUTE;
export const DURATION_DAY = 24 * DURATION_HOUR;
export const DURATION_WEEK = 7 * DURATION_DAY;

/**
 * Shared Constants
 */

export const LANGUAGE = Object.freeze({
  ENGLISH: 'en',
  FRENCH: 'fr',
});

export const ROLE = Object.freeze({
  USER: 'user',
  ADMIN: 'admin',
});
