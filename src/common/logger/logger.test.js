import { enableLogger, Logger, setupLogger, createLogger } from './logger';

describe('Logger', () => {
  const console = {
    ...globalThis.console,
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  globalThis.console = console;

  test('Logger', async () => {
    setupLogger('HelloWorld');
    enableLogger('HelloWorld*');

    expect(Logger.namespace).toBe('HelloWorld');
    expect(typeof Logger.logger).toBe('function');
    expect(typeof Logger.debug).toBe('function');
    expect(typeof Logger.info).toBe('function');
    expect(typeof Logger.warn).toBe('function');
    expect(typeof Logger.error).toBe('function');

    Logger.debug('test');
    expect(console.debug).toHaveBeenLastCalledWith('HelloWorld:DEBUG test');

    Logger.info('test');
    expect(console.info).toHaveBeenLastCalledWith('HelloWorld:INFO test');

    Logger.warn('test');
    expect(console.warn).toHaveBeenLastCalledWith('HelloWorld:WARN test');

    Logger.error('test');
    expect(console.error).toHaveBeenLastCalledWith('HelloWorld:ERROR test');
  });

  test('Logger after setup', async () => {
    setupLogger('MyApp');
    enableLogger('MyApp*');

    expect(Logger.namespace).toBe('MyApp');

    Logger.debug('test');
    expect(console.debug).toHaveBeenLastCalledWith('MyApp:DEBUG test');

    Logger.info('test');
    expect(console.info).toHaveBeenLastCalledWith('MyApp:INFO test');

    Logger.warn('test');
    expect(console.warn).toHaveBeenLastCalledWith('MyApp:WARN test');

    Logger.error('test');
    expect(console.error).toHaveBeenLastCalledWith('MyApp:ERROR test');
  });

  test('createLogger', async () => {
    setupLogger('HelloWorld');
    enableLogger('HelloWorld*');

    const logger = createLogger('MyModule');

    expect(logger.namespace).toBe('HelloWorld:MyModule');

    logger.debug('test');
    expect(console.debug).toHaveBeenLastCalledWith('HelloWorld:MyModule:DEBUG test');

    logger.info('test');
    expect(console.info).toHaveBeenLastCalledWith('HelloWorld:MyModule:INFO test');

    logger.warn('test');
    expect(console.warn).toHaveBeenLastCalledWith('HelloWorld:MyModule:WARN test');

    logger.error('test');
    expect(console.error).toHaveBeenLastCalledWith('HelloWorld:MyModule:ERROR test');
  });

  test('createLogger without prefix', async () => {
    setupLogger('HelloWorld');
    enableLogger('HelloWorld*,MyApp*');

    const logger = createLogger('MyApp', true);

    expect(logger.namespace).toBe('MyApp');

    logger.debug('test');
    expect(console.debug).toHaveBeenLastCalledWith('MyApp:DEBUG test');

    logger.info('test');
    expect(console.info).toHaveBeenLastCalledWith('MyApp:INFO test');

    logger.warn('test');
    expect(console.warn).toHaveBeenLastCalledWith('MyApp:WARN test');

    logger.error('test');
    expect(console.error).toHaveBeenLastCalledWith('MyApp:ERROR test');
  });
});
