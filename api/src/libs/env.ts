import Config from '@blocklet/sdk/lib/config';
import env from '@blocklet/sdk/lib/env';
import Joi from 'joi';

export const isDevelopment = Config.env.mode === 'development';

function parseDatabaseConfiguration(value: object) {
  // @ts-ignore
  value.logging = Boolean(value.logging);
  const result = Joi.object<{
    url: string;
    logging?: boolean;
    pool?: {
      max?: number;
      min?: number;
    };
  }>({
    url: Joi.string().empty([null, '']).default(`sqlite:${env.dataDir}/pix_loom.db`),
    logging: Joi.boolean().default(false),
    pool: Joi.object({
      max: Joi.number().integer().min(1).empty([null, '']),
      min: Joi.number().integer().min(0).empty([null, '']),
    }),
  }).validate(value, { stripUnknown: true });

  if (result.error) throw new Error(`validate database configuration error ${result.error.message}`);

  return result.value;
}

const envConfig = {
  ...env,
  chainHost: process.env.CHAIN_HOST || '',
};

export { envConfig as env };
export default envConfig;

function parseConfigFromPreferences() {
  const { preferences } = Config.env;

  return {
    _database: undefined as ReturnType<typeof parseDatabaseConfiguration> | undefined,
    get database() {
      this._database ??= parseDatabaseConfiguration({
        url: preferences.pix_loom_database_url
          ?.replace('{password}', preferences.pix_loom_database_password || '')
          .replace('{env.dataDir}', env.dataDir),
        logging: preferences.database_logging === undefined ? false : preferences.pix_loom_database_logging,
        pool: {
          min: preferences.pix_loom_database_pool_min,
          max: preferences.pix_loom_database_pool_max,
        },
      });

      return this._database;
    },

    defaultLanguage: 'en',
  };
}

export const config = parseConfigFromPreferences();

Config.events.on('envUpdate', parseConfigFromPreferences);
