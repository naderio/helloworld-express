import { createLogger } from '~/common/logger';

const Logger = createLogger($filepath(__filename));

class Core {
  constructor() {
    this.queues = {};
  }

  async setup() {
    Logger.info('setup ...');
    Logger.info('setup done');
  }

  async run() {
    // @PLACEHOLDER for running custom logic
  }

  async shutdown() {
    Logger.info('shutdown ...');
    Logger.info('shutdown done');
  }
}

export default new Core();
