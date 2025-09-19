import payment from '@blocklet/payment-js';
import { getUrl } from '@blocklet/sdk/lib/component';
import '@blocklet/sdk/lib/error-handler';

import { ensureSqliteBinaryFile } from '../libs/ensure-sqlite';
import logger from '../libs/logger';
import { ensureCreditPrice, ensureMeter } from '../libs/payment';

const { name } = require('../../../package.json');

const ensureWebhooks = async () => {
  const { list: endpoints } = await payment.webhookEndpoints.list({ page: 1, size: 100 });
  const data = {
    url: getUrl('/api/payment/webhook'),
    enabled_events: ['checkout.session.completed'],
  };

  if (endpoints.length > 0) {
    const webhook = await payment.webhookEndpoints.update(endpoints[0]?.id as string, data);
    logger.info('webhooks updated', webhook);
    return;
  }

  const webhook = await payment.webhookEndpoints.create(data);
  logger.info('webhooks created', webhook);
};

(async () => {
  try {
    // 初始化数据库
    await ensureSqliteBinaryFile();
    const migrate = await import('../store/migrate').then((m) => m.default);
    await migrate();

    // 初始化支付系统
    await ensureMeter();
    await ensureCreditPrice();
    // 依赖 payment kit 先启动
    await ensureWebhooks();

    logger.info(`${name} pre-start successfully`);
    process.exit(0);
  } catch (err) {
    logger.error(`${name} pre-start error: ${err}`);
    process.exit(1);
  }
})();
