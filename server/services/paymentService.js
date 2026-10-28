const crypto = require('crypto');
const Payment = require('../models/Payment');

const provider = process.env.PAYMENT_PROVIDER || 'dev_adapter';
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

let stripeInstance = null;
if (provider === 'stripe' && stripeSecretKey) {
  try {
    const Stripe = require('stripe');
    stripeInstance = new Stripe(stripeSecretKey);
  } catch (err) {
    console.warn('[PaymentService] Stripe failed to initialize, defaulting to dev_adapter:', err.message);
  }
}

/**
 * Creates a payment order/session or dev token
 */
const createPaymentIntent = async ({ amount, currency = 'USD', bookingReference, customerEmail, simulateFailure = false }) => {
  if (simulateFailure) {
    return {
      success: false,
      provider: 'dev_adapter',
      message: 'Payment simulation error: Card declined by issuing bank.',
      code: 'card_declined'
    };
  }

  if (stripeInstance) {
    try {
      const intent = await stripeInstance.paymentIntents.create({
        amount: Math.round(amount * 100), // in cents
        currency: currency.toLowerCase(),
        metadata: {
          bookingReference,
          customerEmail
        }
      });
      return {
        success: true,
        provider: 'stripe',
        clientSecret: intent.client_secret,
        transactionId: intent.id,
        isDevelopmentMode: false
      };
    } catch (err) {
      console.error('[PaymentService] Stripe error:', err.message);
      return {
        success: false,
        provider: 'stripe',
        message: `Stripe error: ${err.message}`,
        code: 'gateway_error'
      };
    }
  }

  // Development Adapter
  const devTransactionId = `DEV-TX-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  return {
    success: true,
    provider: 'dev_adapter',
    clientSecret: `dev_secret_${Date.now()}`,
    transactionId: devTransactionId,
    isDevelopmentMode: true,
    message: 'Development Payment Adapter Active: No actual charge made.'
  };
};

/**
 * Verifies and finalizes payment record idempotently
 */
const verifyAndRecordPayment = async ({
  bookingId,
  userId,
  amount,
  transactionId,
  cardLast4 = '4242',
  simulateFailure = false
}) => {
  // Check for intentional test failure (e.g. card ending in 0000 or simulateFailure true)
  if (simulateFailure || cardLast4 === '0000') {
    return {
      success: false,
      message: 'Card was declined. Insufficient funds or card expired.',
      code: 'card_declined'
    };
  }

  // Check idempotency: does this transaction already exist?
  let existingPayment = await Payment.findOne({ transactionId });
  if (existingPayment) {
    return {
      success: true,
      payment: existingPayment,
      isIdempotentRepeat: true
    };
  }

  // Generate clean receipt reference
  const receiptNumber = `REC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

  const payment = await Payment.create({
    booking: bookingId,
    user: userId,
    provider: stripeInstance ? 'stripe' : 'dev_adapter',
    transactionId,
    amount,
    currency: 'USD',
    status: 'completed',
    cardLast4: cardLast4.slice(-4),
    receiptNumber
  });

  return {
    success: true,
    payment,
    isIdempotentRepeat: false
  };
};

module.exports = {
  createPaymentIntent,
  verifyAndRecordPayment
};
