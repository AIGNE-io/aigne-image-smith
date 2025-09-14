import payment from '@blocklet/payment-js';
import { auth, user } from '@blocklet/sdk/lib/middlewares';
import { BN } from '@ocap/util';
import { Router } from 'express';

import logger from '../libs/logger';
import { ensureCreditCheckoutSession, ensureCustomer, ensureMeter } from '../libs/payment';
import wsServer from '../ws';

const router = Router();

/**
 * Core function: Claim welcome credits - create creditGrant
 */
router.post('/credits/grants', auth(), user(), async (req, res) => {
  try {
    const userDid = req.user?.did!!;

    // Ensure customer exists
    const customer = await ensureCustomer(userDid);

    const meter = await ensureMeter();

    const { count } = await payment.creditGrants.list({
      customer_id: customer.id,
    });

    if (count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Credits already claimed',
      });
    }

    // Create credit grant
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
      message: 'Successfully claimed 5 welcome credits',
    });
  } catch (error) {
    logger.error('credit grant failed', {
      customerId: req.user?.did,
      error,
    });
    return res.status(400).json({
      success: false,
      error: error.message,
      message: 'Failed to claim welcome credits',
    });
  }
});

/**
 * Query user credit balance
 */
router.get('/credits/balance', auth(), user(), async (req, res) => {
  try {
    const userDid = req.user?.did!!;

    // Ensure customer exists
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
    // Current credit balance
    let balance = new BN(creditBalance?.[meter.currency_id!]?.remainingAmount || 0);
    // Unsettled credits
    const pending = new BN(pendingCredit?.[meter.currency_id!] || 0);
    if (pending.gt(balance)) {
      balance = new BN(0); // Balance cannot be negative
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
      message: 'Credit balance query successful',
    });
  } catch (error) {
    logger.error('credit balance get failed', {
      customerId: req.user?.did,
      error: error.message,
    });
    return res.status(400).json({
      success: false,
      error: error.message,
      message: 'Credit balance query failed',
    });
  }
});

router.post('/credits/checkout', auth(), user(), async (req, res) => {
  try {
    const { quantity = 10 } = req.body;

    // Validate credit quantity
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid credit quantity',
        message: 'Credit quantity must be an integer between 1 and 100',
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
        // Handle checkout session completion
        const session = body.data.object;
        logger.info('Checkout session completed', {
          sessionId: session.id,
          customerId: session.customer_id,
          amount: session.amount_total,
        });

        const meta = body.data.object;
        const { payment_status: paymentStatus } = meta;
        if (paymentStatus === 'paid') {
          // 1. Use key and customer to identify if a user has successfully participated in the rules
          const { customer } = meta;
          const userDid = customer.did;
          wsServer.broadcast(userDid, {
            event: 'finish-payment',
          });
        }

        break;
      }
      case 'customer.subscription.updated':
        logger.info('User subscription updated', { body });
        break;

      case 'customer.subscription.renewed':
        logger.info('User subscription renewed', { body });
        break;

      default:
        logger.info('Unhandled webhook event type', { type });
    }

    return res.status(200).json({ message: 'success' });
  } catch (error) {
    logger.error('handle webhook error', { error, body: JSON.stringify(req.body, null, 2) });
    return res.status(400).json({ message: `handle webhook error: ${error.message}` });
  }
};

router.post('/webhook', handleWebhook);

export default router;
