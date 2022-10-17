import express from 'express';
import 'express-async-errors';
import { graphqlHTTP as expressGraphql } from 'express-graphql';
import morgan from 'morgan';

import * as CONST from '~/common/const';

import * as CONFIG from '~/common/config';

import * as Errors from '~/common/errors';

import Data from '~/common/data';

import { withAuthenticatedUser, withRoleRestriction } from '~/module/auth/auth.middleware';

import { createLogger } from '~/common/logger';
import * as APP_CONFIG from '../../app-config';

const Logger = createLogger($filepath(__filename));

class API {
  constructor() {
    this.app = null;
    this.http = null;
  }

  async setup() {
    Logger.info('initiating ...');

    const app = express();

    // enable proxy trust
    app.enable('trust proxy');

    // show stack errors
    app.set('showStackError', true);

    // enable logger (morgan)
    app.use(morgan(process.env.LOGGER_FORMAT || 'dev'));

    // enable CORS in development or testing
    if (process.env.NODE_ENV !== 'production') {
      app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
        res.header(
          'Access-Control-Allow-Headers',
          'DNT,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization',
        );

        if (req.method === 'OPTIONS') {
          res.sendStatus(204);
          return;
        }

        next();
      });
    }

    // delay response in development
    if (process.env.NODE_ENV === 'development') {
      app.use((req, res, next) => setTimeout(() => next(), 1000));
    }

    // handle JSON
    app.use(express.json({}));

    // secure access

    app.use('/any', withAuthenticatedUser);

    app.use('/self', withAuthenticatedUser);

    app.use('/user', withAuthenticatedUser, withRoleRestriction[CONST.ROLE.USER]);

    app.use('/admin', withAuthenticatedUser, withRoleRestriction[CONST.ROLE.ADMIN]);

    // Status check
    app.get('/check', (req, res) => res.send({ status: 'ok' }));

    // load graphql
    app.use(
      '/any/graphql',
      expressGraphql({
        schema: Data.Graphql.schema,
        graphiql: process.env.NODE_ENV === 'development',
      }),
    );

    // load routers
    for (const filename of APP_CONFIG.API_FILES) {
      Logger.info('loading', filename);
      // eslint-disable-next-line no-await-in-loop
      const api = await import(filename);
      app.use(api.prefix || '/', api.router);
    }

    // handle errors
    app.use((err, req, res, next) => {
      console.error(err);

      if (err.name === 'UsageError') {
        err = Errors.InvalidRequestError.fromWaterlineError(err);
      }

      res.status(err.status || 500).json({
        code: err.code || 'Unknown',
        message: err.message || 'Unknown error',
        extra: err.extra || undefined,
      });
    });

    app.use((req, res) => {
      res.status(404).send({
        code: 'NotFound',
        message: 'API not found',
      });
    });

    this.app = app;
  }

  async run() {
    this.http = this.app.listen(CONFIG.API_PORT);
    if (Logger.info.enabled) {
      Logger.info(`ready on port ${CONFIG.API_PORT}`);
    } else {
      console.info(`ready on port ${CONFIG.API_PORT}`);
    }
  }

  shutdown() {
    return new Promise((resolve, reject) => {
      Logger.info('shutdown ...');

      if (!this.http) {
        Logger.info('shutdown done');
        resolve();
        return;
      }

      this.http.close((err) => {
        Logger.info('shutdown done', err || '');

        this.app = null;
        this.http = null;

        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export default new API();
