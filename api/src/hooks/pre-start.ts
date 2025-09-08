import payment from '@blocklet/payment-js';
import '@blocklet/sdk/lib/error-handler';

import { ensureSqliteBinaryFile } from '../libs/ensure-sqlite';
import logger from '../libs/logger';
import { ensureCreditPrice, ensureMeter } from '../libs/payment';

const { name } = require('../../../package.json');

// 设置支付测试模式
payment.environments.setTestMode(String(process.env.PAYMENT_TEST_MODE) === 'true');

(async () => {
  try {
    // 初始化数据库
    await ensureSqliteBinaryFile();
    const migrate = await import('../store/migrate').then((m) => m.default);
    await migrate();

    // 初始化支付系统
    await ensureMeter();
    await ensureCreditPrice();

    logger.info(`${name} pre-start successfully`);
    process.exit(0);
  } catch (err) {
    logger.error(`${name} pre-start error: ${err}`);
    process.exit(1);
  }
})();
