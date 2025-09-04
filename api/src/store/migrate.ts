import { join } from 'path';
import { SequelizeStorage, Umzug } from 'umzug';

import { isDevelopment } from '../libs/env';
import { sequelize } from './models';

const umzug = new Umzug({
  migrations: {
    glob: [
      '**/migrations/*.{ts,js}',
      { cwd: isDevelopment ? __dirname : join(process.env.BLOCKLET_APP_DIR!, 'api/dist/store') },
    ],
    resolve: ({ name, path, context }) => {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const migration = require(path!);
      return {
        name: name.replace(/\.ts$/, '.js'),
        up: () => migration.up({ context }),
        down: () => migration.down({ context }),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

export default async function migrate() {
  await umzug.up();
}

export type Migration = typeof umzug._types.migration;
