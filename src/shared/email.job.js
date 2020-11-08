import Queue from 'bull';

import NotifmeSdk from 'notifme-sdk';
// eslint-disable-next-line import/no-extraneous-dependencies
import nodemailer from 'nodemailer';

import ejs from 'ejs';
import juice from 'juice';

import * as CONFIG from '~/common/config';

export const name = $jobname(__filename);

export const queue = new Queue(name, CONFIG.REDIS_JOB_URI);

let notifmeSdk;
let transport;

const TEMPLATE_CONTEXT_DEFAULTS = {
  USER_APP_URL: CONFIG.USER_APP_URL,
};

export async function setup() {
  transport = nodemailer.createTransport(CONFIG.EMAIL_TRANSPORT_URI);

  notifmeSdk = new NotifmeSdk({
    channels: {
      email: {
        providers: [
          {
            type: 'custom',
            id: 'smtp',
            send: async (request) => {
              const result = await transport.sendMail(request);
              return result.messageId;
            },
          },
        ],
      },
    },
    useNotificationCatcher: process.env.NODE_ENV === 'development',
  });
}

export async function processor(job) {
  const context = {
    ...TEMPLATE_CONTEXT_DEFAULTS,
    subject: job.data.subject,
    ...job.data.templateContext,
  };

  let emailBody = await ejs.renderFile(`${job.data.template}.email.ejs`, context);

  emailBody = juice(emailBody);

  notifmeSdk.send({
    email: {
      from: job.data.from || CONFIG.EMAIL_FROM,
      to: job.data.to,
      subject: job.data.subject,
      html: emailBody,
    },
  });
}
