import Queue from 'bull';

import * as CONFIG from '~/common/config';

import { createLogger } from '~/common/logger';

const Logger = createLogger($filepath(__filename));

export const name = $jobname(__filename);

export const queue = new Queue(name, CONFIG.REDIS_JOB_URI);

export const concurrency = 1;

export async function processor(job) {
  Logger.debug('processing', job.id, job.data);
}
