// NOTE: add next line to keep sqlite3 in the bundle
import 'mariadb';
import { Sequelize } from 'sequelize';
import 'sqlite3';

import { config } from '../../libs/env';
import logger from '../../libs/logger';
// Initialize models with sequelize instance to avoid circular dependency issues
import { initAIProject } from './ai-project';
import { initProjectI18n } from './project-i18n';

// eslint-disable-next-line import/prefer-default-export
export const sequelize = new Sequelize(config.database.url, {
  logging: config.database.logging === false ? false : logger.log,
  pool: config.database.pool,
});

sequelize.query('pragma journal_mode = WAL;');
sequelize.query('pragma synchronous = normal;');
sequelize.query('pragma journal_size_limit = 67108864;');

// import { initImageGeneration } from './image-generation';

// Initialize models
initAIProject(sequelize);
initProjectI18n(sequelize);
// initImageGeneration(sequelize);
