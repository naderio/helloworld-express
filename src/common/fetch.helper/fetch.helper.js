import { EventEmitter } from '../events';

import { FetchError } from '../errors';

import { createLogger } from '../logger';

const Logger = createLogger('FetchHelper');

/**
 * Query String and Form Data
 */

/**
 *
 * @param {URLSearchParams|FormData} result
 * @param {string} name
 * @param {*} value
 * @returns {void}
 */
export function encode(result, name, value) {
  if (typeof value === 'object' && value) {
    if (value instanceof Date) {
      result.set(name, value.toJSON());
    } else if (typeof value.toJSON === 'function') {
      encode(result, name, JSON.parse(value.toJSON()));
    } else if (Array.isArray(value)) {
      for (let index = 0; index < value.length; index += 1) {
        encode(result, `${name}[${index}]`, value[index]);
      }
    } else {
      for (const [key, val] of Object.entries(value)) {
        encode(result, `${name}[${key}]`, val);
      }
    }
  } else if (typeof value === 'undefined') {
    result.set(name, '');
  } else {
    result.set(name, value);
  }
}

/**
 *
 * @param {Object} data
 * @returns {string}
 */
export function toQueryString(data) {
  const result = new URLSearchParams();

  for (const [name, value] of Object.entries(data)) {
    encode(result, name, value);
  }

  return result.toString();
}

/**
 *
 * @param {Object} data
 * @returns {FormData}
 */
export function toFormData(data) {
  const result = new FormData();

  for (const [name, value] of Object.entries(data)) {
    encode(result, name, value);
  }

  return result;
}

/**
 *
 * @param {string} method
 * @param {string} url
 * @param {Object} options
 * @returns {Request}
 */
export function Request(method, url, options = {}) {
  let { route, query, headers, body, ...more } = options;

  route = route || {};
  query = query || {};
  headers = headers || {};

  Object.entries(route).forEach(([param, value]) => {
    url = url.replace(new RegExp(`:${param}`), encodeURIComponent(value));
  });

  const queryString = toQueryString(query);

  url += queryString ? `?${queryString}` : '';

  headers.Accept = 'application/json';

  if (body && typeof body === 'object') {
    if (body instanceof FormData) {
      headers['Content-Type'] = 'multipart/form-data';
    } else if (body instanceof URLSearchParams) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    } else if (toString.call(body) === '[object Object]' || toString.call(body) === '[object Array]') {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(body);
    }
  }

  const request = new globalThis.Request(url, {
    method,
    headers,
    body,
    ...more,
  });

  return request;
}

/**
 * Response Listeners
 */
export const events = new EventEmitter();

/**
 * Handle fetch request, converts JSON to Object and throws error for non-success statuses
 *
 * @param {Promise<Response>} fetchPromise
 * @param {(data: Object, meta: Response) => Object} [successModifier]
 * @param {(error: Error, meta: Response) => error} [failureModifier]
 * @returns {Promise<{ meta: Response, data: Object }>}
 */
export async function handle(fetchPromise, successModifier = (data) => data, failureModifier = (error) => error) {
  let meta;

  try {
    meta = await fetchPromise;

    let contentPromise;

    const contentType = meta.headers.get('Content-Type') || null;

    if (contentType === null) {
      contentPromise = Promise.resolve(null);
    } else if (contentType.startsWith('application/json')) {
      contentPromise = meta.json();
    } else {
      contentPromise = meta.text().then((text) => ({ text }));
    }

    let data = await contentPromise;

    data = data || {};

    let error = null;

    if (data.error && typeof data.error === 'object') {
      error = data.error;
    }

    if (error || !meta.ok) {
      error = error || data;

      let { code, message, ...extra } = error;

      if (typeof data.error === 'string') {
        message = message || data.error;
      }

      if (meta.status === 400) {
        code = code || 'Invalid';
        message = message || 'Invalid request';
      } else if (meta.status === 401) {
        code = code || 'Unauthenticated';
        message = message || 'Unauthenticated';
      } else if (meta.status === 403) {
        code = code || 'Unauthorized';
        message = message || 'Unauthorized';
      } else if (meta.status === 404) {
        code = code || 'NotFound';
        message = message || 'Not found';
      } else if (meta.status >= 500) {
        code = code || 'Server';
        message = message || 'Server error';
      } else {
        code = code || 'Unknown';
        message = message || 'Unknown error';
      }

      error = FetchError.from(error, { code, message, ...extra });

      throw error;
    }

    data = successModifier(data, meta);

    events.emit('success', { meta, data });

    return { meta, data };
  } catch (failureError) {
    let error;

    if (failureError instanceof FetchError) {
      error = failureError;
    } else {
      const code = failureError.code || 'Unknown';
      const message = failureError.message || failureError.error || 'Unknown error';

      error = FetchError.from(failureError, { code, message });
    }

    meta = meta || new Response('http://localhost');

    error = failureModifier(error, meta);

    events.emit('failure', { meta, error });

    throw error;
  }
}

if (process.env.NODE_ENV === 'development') {
  globalThis.FetchHelper = {
    encode,
    toQueryString,
    toFormData,
    Request,
    events,
    handle,
  };

  events.on('success', ({ meta, data }) => {
    Logger.debug('@success', meta.url, meta.status, data);
  });

  events.on('failure', ({ meta, error }) => {
    Logger.debug('@failure', meta.url, meta.status, error.code, error, error.extra);
  });
}
