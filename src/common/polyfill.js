// @ts-nocheck
/* eslint-disable global-require, no-undef */

if (!globalThis.FormData) {
  globalThis.FormData = require('formdata-node');
}

if (!globalThis.fetch) {
  const { default: fetch, Request, Response, Headers, FetchError } = require('node-fetch');

  Object.assign(globalThis, {
    fetch,
    Request,
    Response,
    Headers,
    FetchError,
  });
}
