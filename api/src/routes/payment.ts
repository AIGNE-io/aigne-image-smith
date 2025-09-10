import payment from '@blocklet/payment-js';
import { auth, user } from '@blocklet/sdk/lib/middlewares';
import { BN } from '@ocap/util';
import { Router } from 'express';

import logger from '../libs/logger';
import { ensureCreditCheckoutSession, ensureCustomer, ensureMeter } from '../libs/payment';
import wsServer from '../ws';

const router = Router();

/**
 * 核心功能：领取欢迎积分 - 创建 creditGrant
 */
router.post('/credits/grants', auth(), user(), async (req, res) => {
  try {
    const userDid = req.user?.did!!;

    // 确保客户存在
    const customer = await ensureCustomer(userDid);

    const meter = await ensureMeter();

    const { count } = await payment.creditGrants.list({
      customer_id: customer.id,
    });

    if (count > 0) {
      return res.status(400).json({
        success: false,
        message: '已经领取过积分',
      });
    }

    // 创建信用额度
    const creditGrant = await payment.creditGrants.create({
      customer_id: customer.id,
      amount: '5',
      currency_id: meter.currency_id!,
      applicability_config: {
        scope: {
          price_type: 'metered',
        },
      },
      category: 'promotional',
      name: 'New User Welcome',
      metadata: {
        granted_at: new Date().toISOString(),
        service_type: 'image_processing',
        granted_by: 'system',
      },
    });

    logger.info('created credit grant', {
      customerId: userDid,
      amount: 5,
      grantId: creditGrant.id,
    });

    return res.json({
      success: true,
      data: creditGrant,
      message: '成功领取 5 个欢迎积分',
    });
  } catch (error) {
    logger.error('credit grant failed', {
      customerId: req.user?.did,
      error,
    });
    return res.status(400).json({
      success: false,
      error: error.message,
      message: '领取欢迎积分失败',
    });
  }
});

/**
 * 查询用户积分余额
 */
router.get('/credits/balance', auth(), user(), async (req, res) => {
  try {
    const userDid = req.user?.did!!;

    // 确保客户存在
    const customer = await ensureCustomer(userDid);

    const meter = await ensureMeter();

    const creditBalance = await payment.creditGrants.summary({
      customer_id: userDid,
    });

    const pendingCredit = await payment.meterEvents.pendingAmount({
      customer_id: userDid,
    });

    logger.info('retrieved credit balance', {
      customerId: userDid,
      amount: creditBalance.amount,
      currency: creditBalance.currency_id,
    });

    const paymentCurrency = meter?.paymentCurrency;
    // 当前Credit 余额
    let balance = new BN(creditBalance?.[meter.currency_id!]?.remainingAmount || 0);
    // 未结算 Credit
    const pending = new BN(pendingCredit?.[meter.currency_id!] || 0);
    if (pending.gt(balance)) {
      balance = new BN(0); // 余额不能为负数
    } else {
      balance = balance.sub(pending);
    }

    const { count } = await payment.creditGrants.list({
      customer_id: customer.id,
    });

    return res.json({
      success: true,
      data: {
        balance: balance.toString(),
        paymentCurrency,
        isNewUser: count === 0,
      },
      message: '信用余额查询成功',
    });
  } catch (error) {
    logger.error('credit balance get failed', {
      customerId: req.user?.did,
      error: error.message,
    });
    return res.status(400).json({
      success: false,
      error: error.message,
      message: '信用余额查询失败',
    });
  }
});

router.post('/credits/checkout', auth(), user(), async (req, res) => {
  try {
    const { quantity = 10 } = req.body;

    // 验证积分数量
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 100) {
      return res.status(400).json({
        success: false,
        error: '无效的积分数量',
        message: '积分数量必须是1到100之间的整数',
      });
    }

    const checkoutSession = await ensureCreditCheckoutSession(quantity);
    return res.json({
      success: true,
      data: checkoutSession,
      message: 'checkout session created',
    });
  } catch (error) {
    logger.error('checkout session creation failed', { error });
    return res.status(400).json({
      success: false,
      error: error.message,
      message: 'checkout session creation failed',
    });
  }
});

const handleWebhook = async (req: any, res: any) => {
  try {
    const { body } = req;
    const { type } = req.body;

    logger.info('received payment-kit webhook', {
      eventId: body.id,
      objectId: body.data?.object?.id,
      eventType: type,
    });

    if (type === 'customer.credit.insufficient') {
      logger.info('customer credit insufficient', { body });
      return res.status(200).json({ message: 'success' });
    }

    switch (type) {
      case 'checkout.session.completed': {
        // 处理结账会话完成
        const session = body.data.object;
        logger.info('结账会话完成', {
          sessionId: session.id,
          customerId: session.customer_id,
          amount: session.amount_total,
        });

        const meta = body.data.object;
        const { payment_status: paymentStatus } = meta;
        if (paymentStatus === 'paid') {
          // 1. 通过 key 和 customer 来标识一个用户是否成功参加了规则
          const { customer } = meta;
          const userDid = customer.did;
          wsServer.broadcast(userDid, {
            event: 'finish-payment',
          });
        }

        break;
      }
      case 'customer.subscription.updated':
        logger.info('用户订阅更新', { body });
        break;

      case 'customer.subscription.renewed':
        logger.info('用户订阅续费', { body });
        break;

      default:
        logger.info('未处理的 webhook 事件类型', { type });
    }

    return res.status(200).json({ message: 'success' });
  } catch (error) {
    logger.error('handle webhook error', { error, body: JSON.stringify(req.body, null, 2) });
    return res.status(400).json({ message: `handle webhook error: ${error.message}` });
  }
};

router.post('/webhook', handleWebhook);

export default router;
