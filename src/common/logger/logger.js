import createDebug from 'debug';

export function enableLogger(namespace) {
  createDebug.enable(namespace);
}

export function disableLogger() {
  createDebug.disable();
}

let PREFIX = 'HelloWorld';

export function createLogger(ns = '', ignorePrefix = false) {
  const namespace = ignorePrefix ? ns : `${PREFIX}:${ns}`;

  const logger = createDebug(`${namespace}`);

  const debug = logger.extend('DEBUG');
  debug.log = console.debug.bind(console);

  const info = logger.extend('INFO');
  info.log = console.info.bind(console);

  const warn = logger.extend('WARN');
  warn.log = console.warn.bind(console);

  const error = logger.extend('ERROR');
  error.log = console.error.bind(console);

  return {
    namespace,
    logger,
    debug,
    info,
    warn,
    error,
  };
}

export const Logger = createLogger(PREFIX, true);

export function setupLogger(namespace) {
  PREFIX = namespace;
  Object.assign(Logger, createLogger(namespace, true));
}
