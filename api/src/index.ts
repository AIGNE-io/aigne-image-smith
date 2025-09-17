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
import { getImageUrl } from './libs/utils';
import routes from './routes';
import AIProject from './store/models/ai-project';
import ProjectI18n from './store/models/project-i18n';
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
  app.use(
    fallback('index.html', {
      root: staticDir,
      getPageData: async (req) => {
        const [slug] = req.path.split('/').filter(Boolean);
        if (slug) {
          const project = await AIProject.findOne({
            where: { slug },
          });
          if (project) {
            // Extract locale from Accept-Language header or use 'en' as fallback
            const acceptLanguage = req.headers['accept-language'] || 'en';
            const locale = acceptLanguage.split(',')[0]?.split('-')[0] || 'en';

            // Get i18n content with fallback logic
            const projectI18n = await ProjectI18n.getWithFallback(project.id, locale);

            // Priority order for title and description:
            const defaultTitle = 'AIGNE ImageSmith';
            const defaultDescription =
              'Discover powerful AI-driven image applications that transform your creative workflow';

            const og: any = {
              title: project.getLocalizedName(locale) || defaultTitle,
              description: project.getLocalizedSubtitle(locale) || defaultDescription,
            };

            // Override with SEO data if available in ProjectI18n
            if (projectI18n?.content?.seo) {
              const { seo } = projectI18n.content;
              if (seo.imageUrl) {
                og.ogImage = getImageUrl(seo.imageUrl);
              }
            }

            return og;
          }
        }

        return {
          title: 'AIGNE ImageSmith',
          description: 'Discover powerful AI-driven image applications that transform your creative workflow',
        };
      },
    }),
  );

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
