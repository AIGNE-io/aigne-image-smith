/* eslint-disable @typescript-eslint/no-explicit-any */
import payment, { TCreditGrantExpanded } from '@blocklet/payment-js';
import { component } from '@blocklet/sdk';
import { BN } from '@ocap/util';

import logger from './logger';

// TypeScript interfaces
export interface CreditBalance {
  balance: string;
  paymentCurrency?: any;
  isNewUser: boolean;
}

export interface MeterEvent {
  id: string;
  event_name: string;
  timestamp: number;
  payload: {
    customer_id: string;
    value: string;
  };
  identifier: string;
  metadata?: Record<string, any>;
}

const isTestMode = String(process.env.PAYMENT_TEST_MODE) === 'true';
export const METER_NAME = isTestMode ? 'image_processing_test' : 'image_processing';
const IMAGE_PROCESSING_PRICE_KEY = isTestMode ? 'image_processing_per_credit_test' : 'image_processing_per_credit';

export const ensureMeter = async () => {
  try {
    const meter = await payment.meters.retrieve(METER_NAME);
    return meter;
  } catch (error) {
    const meter = await payment.meters.create({
      name: METER_NAME,
      description: 'AI image processing service meter',
      event_name: METER_NAME,
      aggregation_method: 'sum',
      unit: 'Credits',
    });
    return meter;
  }
};

export const ensureCreditPrice = async () => {
  try {
    const price = await payment.prices.retrieve(IMAGE_PROCESSING_PRICE_KEY);
    return price;
  } catch {
    try {
      const paymentCurrencies = await payment.paymentCurrencies.list({});
      if (paymentCurrencies.length === 0) {
        logger.error('No payment currencies found');
        return null;
      }
      const meter = await ensureMeter();
      if (!meter) {
        logger.error('No meter found');
        return null;
      }
      await payment.products.create({
        name: 'AI Image Processing Credits',
        description: 'AI image processing service credits, supports colorization, restoration and enhancement',
        type: 'credit',
        prices: [
          {
            type: 'one_time',
            unit_amount: '0.10',
            currency_id: paymentCurrencies[0]!.id,
            // @ts-ignore
            currency_options: paymentCurrencies.map((currency: any) => ({
              currency_id: currency.id,
              unit_amount: '0.10',
            })),
            lookup_key: IMAGE_PROCESSING_PRICE_KEY,
            nickname: 'Per Unit Credit For Image Processing',
            metadata: {
              credit_config: {
                priority: 50,
                valid_duration_value: 0,
                valid_duration_unit: 'days',
                currency_id: meter.currency_id,
                credit_amount: '1',
              },
              meter_id: meter.id,
            },
          },
        ],
      });
      const price = await payment.prices.retrieve(IMAGE_PROCESSING_PRICE_KEY);
      return price;
    } catch (error) {
      logger.error('failed to ensure credit price', { error });
      return null;
    }
  }
};

export const ensureCreditCheckoutSession = async (quantity: number = 1) => {
  try {
    const price = await ensureCreditPrice();
    if (!price) {
      logger.error('no price found');
      throw new Error('no price found');
    }
    const checkoutSession = await payment.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_id: price.id,
          quantity,
          adjustable_quantity: {
            enabled: true,
            minimum: 1,
            maximum: 100,
          },
        },
      ],
      success_url: component.getUrl('/payment/success'),
      cancel_url: component.getUrl('/payment/cancel'),
    });
    return checkoutSession;
  } catch (error) {
    logger.error('failed to ensure credit checkout session', { error });
    throw error;
  }
};

/**
 * Create current user information
 */
export const ensureCustomer = async (userDid: string) => {
  try {
    // @ts-ignore
    const customer = await payment.customers.retrieve(userDid, {
      create: true,
    });

    logger.info('found existing customer', { customerId: userDid, customer });
    return customer;
  } catch (error) {
    logger.error('failed to ensure customer', { userDid, error });
    throw error;
  }
};

// ===== Credit Management Functions =====

/**
 * Helper function: Query user credit balance
 */
export const getUserCreditBalance = async (userDid: string): Promise<CreditBalance> => {
  try {
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
    // Pending credits
    const pending = new BN(pendingCredit?.[meter.currency_id!] || 0);
    if (pending.gt(balance)) {
      balance = new BN(0); // Balance cannot be negative
    } else {
      balance = balance.sub(pending);
    }

    const { count } = await payment.creditGrants.list({
      customer_id: customer.id,
    });

    return {
      balance: balance.toString(),
      paymentCurrency,
      isNewUser: count === 0,
    };
  } catch (error) {
    logger.error('credit balance get failed', {
      customerId: userDid,
      error: error.message,
    });
    return {
      balance: '0',
      isNewUser: false,
    };
  }
};

/**
 * Core function 1: Grant welcome credits - create creditGrant
 */
export const grantWelcomeCredits = async (userDid: string, amount: number = 5): Promise<TCreditGrantExpanded> => {
  try {
    if (!userDid) {
      throw new Error('customerId is required');
    }

    // Ensure customer exists
    const customer = await ensureCustomer(userDid);

    const meter = await ensureMeter();

    // Create credit grant
    const creditGrant = await payment.creditGrants.create({
      customer_id: customer.id,
      amount: amount.toString(),
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
        service_type: METER_NAME,
        granted_by: 'system',
      },
    });

    logger.info('created credit grant', {
      customerId: userDid,
      amount,
      grantId: creditGrant.id,
    });

    return creditGrant;
  } catch (error) {
    logger.error('credit grant failed', {
      customerId: userDid,
      error,
    });
    throw error;
  }
};

/**
 * Core function 2: Image processing, report consumption
 */
export const consumeCredits = async (
  userDid: string,
  amount: number,
  sessionId: string,
  metadata: Record<string, any> = {},
): Promise<MeterEvent> => {
  try {
    if (!userDid || !amount || !sessionId) {
      throw new Error('customerId, amount, sessionId are all required fields');
    }

    // Ensure customer exists
    await ensureCustomer(userDid);

    // Check credit balance
    const balance = await getUserCreditBalance(userDid);
    const currentBalance = parseFloat(balance.balance);

    if (currentBalance < amount) {
      throw new Error(`Insufficient credits. Required: ${amount}, Available: ${currentBalance}`);
    }

    // Report image processing consumption
    const meterEvent = await payment.meterEvents.create({
      event_name: METER_NAME, // Keep consistent with meter name
      timestamp: Math.floor(Date.now() / 1000),
      payload: {
        customer_id: userDid,
        value: String(amount),
      },
      identifier: `${userDid}_${sessionId}_${Date.now()}`,
      metadata,
    });

    logger.info('settled processing session', {
      customerId: userDid,
      billedCredits: Number(amount),
      sessionId,
      eventId: meterEvent.id,
      metadata,
    });

    return meterEvent;
  } catch (error) {
    logger.error('meter report failed', {
      customerId: userDid,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Check if user is eligible for welcome credits
 */
export const isEligibleForWelcomeCredits = async (userDid: string): Promise<boolean> => {
  try {
    const balance = await getUserCreditBalance(userDid);
    return balance.isNewUser;
  } catch (error) {
    logger.error('check welcome credits eligibility failed', { userDid, error });
    return false;
  }
};
