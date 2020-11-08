/** @module common/config */

export { RELEASE_VERSION } from './release';

export const INSTANCE_ROLE = process.env.INSTANCE_ROLE || (process.env.INSTANCE_ID || '').split('-')[0] || '?';

process.env.INSTANCE_ROLE = process.env.INSTANCE_ROLE || INSTANCE_ROLE;

export const INSTANCE_ID =
  process.env.INSTANCE_ID ||
  (INSTANCE_ROLE === 'api' || INSTANCE_ROLE === 'job' ? `${INSTANCE_ROLE}-?` : INSTANCE_ROLE);

process.env.INSTANCE_ID = process.env.INSTANCE_ID || INSTANCE_ID;

export const MIGRATE = process.env.MIGRATE || 'safe';

export const API_PORT = process.env.API_PORT || 5000;
export const API_ENDPOINT = process.env.API_ENDPOINT || `http://localhost:${API_PORT}`;

export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/helloworld';
export const REDIS_STORAGE_URI = process.env.REDIS_STORAGE_URI || 'redis://localhost:6379/0';
export const REDIS_CACHE_URI = process.env.REDIS_CACHE_URI || 'redis://localhost:6379/1';
export const REDIS_JOB_URI = process.env.REDIS_JOB_URI || 'redis://localhost:6379/2';

export const EMAIL_TRANSPORT_URI = process.env.EMAIL_TRANSPORT_URI || 'smtp://localhost:1025';
export const EMAIL_FROM = process.env.EMAIL_FROM || 'Hello World <no-reply@helloworld.nader.tech>';

export const USER_APP_URL = process.env.USER_APP_URL || 'http://localhost:3000';

export const IS_CORE = INSTANCE_ROLE === 'core' || INSTANCE_ROLE === 'all';
export const IS_API = INSTANCE_ROLE === 'api' || INSTANCE_ROLE === 'all';
export const IS_JOB = INSTANCE_ROLE === 'job' || INSTANCE_ROLE === 'all';
export const IS_CONSOLE = INSTANCE_ROLE === 'console';
export const IS_SCRIPT = INSTANCE_ROLE === 'script';

export const IS_PRIMARY = INSTANCE_ROLE === 'core' || INSTANCE_ROLE === 'all' || INSTANCE_ID === `${INSTANCE_ROLE}-0`;
