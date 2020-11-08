import * as CONFIG from '~/common/config';

import * as APP_CONFIG from '../../app-config';

import { createLogger } from '~/common/logger';

const Logger = createLogger($filepath(__filename));

export default async () => {
  if (!CONFIG.IS_CORE) {
    return;
  }

  for (const filename of APP_CONFIG.BOOTSTRAP_FILES) {
    Logger.info('loading', filename);
    // eslint-disable-next-line no-await-in-loop
    const { default: bootstrap } = await import(filename);
    // eslint-disable-next-line no-await-in-loop
    await bootstrap();
  }
};
