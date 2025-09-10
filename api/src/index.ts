import blockletLogger from '@blocklet/logger';
import { csrf } from '@blocklet/sdk/lib/middlewares';
import fallback from '@blocklet/sdk/lib/middlewares/fallback';
import { xss } from '@blocklet/xss';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv-flow';
import express, { ErrorRequestHandler } from 'express';
import 'express-async-errors';
import path from 'path';

import logger from './libs/logger';
import routes from './routes';
import wsServer from './ws';

dotenv.config();

const { name, version } = require('../../package.json');

export const app = express();

blockletLogger.setupAccessLogger(app);

app.set('trust proxy', true);
app.use(cookieParser());
app.use(express.json({ limit: '1 mb' }));
app.use(express.urlencoded({ extended: true, limit: '1 mb' }));
app.use(cors());
app.use(xss());
app.use(csrf());

const router = express.Router();
router.use('/api', routes);
app.use(router);

const isProduction = process.env.NODE_ENV === 'production' || process.env.ABT_NODE_SERVICE_ENV === 'production';

if (isProduction) {
  const staticDir = path.resolve(process.env.BLOCKLET_APP_DIR!, 'dist');
  app.use(express.static(staticDir, { maxAge: '30d', index: false }));
  app.use(fallback('index.html', { root: staticDir }));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use(((err, _req, res, _next) => {
    // eslint-disable-next-line prettier/prettier
    logger.error(err.stack);
    res.status(400).send('Something broke!');
  }) as ErrorRequestHandler);
}

const port = parseInt(process.env.BLOCKLET_PORT!, 10);

const server = app.listen(port, (err?: any) => {
  if (err) throw err;
  logger.info(`> ${name} v${version} ready on ${port}`);
});

wsServer.attach(server);

export { server };
