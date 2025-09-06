import '@blocklet/sdk/lib/error-handler';
import dotenv from 'dotenv-flow';

import { ensureSqliteBinaryFile } from '../libs/ensure-sqlite';
import logger from '../libs/logger';
import { ensureWebhooks, ensureMeter, ensureCreditPrice, payment } from '../libs/payment';

dotenv.config();

const { name } = require('../../../package.json');

// 设置支付测试模式
payment.environments.setTestMode(String(process.env.PAYMENT_TEST_MODE) === 'true');

(async () => {
  try {
    // 初始化数据库
    await ensureSqliteBinaryFile();
    await import('../store/migrate').then((m) => m.default());
    
    // 初始化支付系统
    await ensureWebhooks();
    await ensureMeter();
    await ensureCreditPrice();
    
    logger.info(`${name} pre-start successfully`);
    process.exit(0);
  } catch (err) {
    logger.error(`${name} pre-start error: ${err}`);
    process.exit(1);
  }
})();
