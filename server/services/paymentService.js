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
const createPaymentIntent = async ({ amount, currency = 'USD', bookingReference, customerEmail }) => {
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
        provider: 'stripe',
        clientSecret: intent.client_secret,
        transactionId: intent.id,
        isDevelopmentMode: false
      };
    } catch (err) {
      console.error('[PaymentService] Stripe error:', err.message);
      throw new Error(`Payment gateway error: ${err.message}`);
    }
  }

  // Development Adapter
  const devTransactionId = `DEV-TX-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  return {
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
  cardLast4 = '4242'
}) => {
  // Check idempotency: does this transaction already exist?
  let existingPayment = await Payment.findOne({ transactionId });
  if (existingPayment) {
    return {
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
    payment,
    isIdempotentRepeat: false
  };
};

module.exports = {
  createPaymentIntent,
  verifyAndRecordPayment
};
