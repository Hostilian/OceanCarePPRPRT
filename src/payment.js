/**
 * Payment Processing Module
 * Handles Stripe integration for donations and recurring payments
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

/**
 * Create a payment intent for a one-time donation
 * @param {number} amount - Amount in cents (e.g., 2500 for $25.00)
 * @param {string} email - Donor's email address
 * @param {string} name - Donor's name
 * @param {string} purpose - Purpose of donation (optional)
 * @returns {Promise<Object>} - Stripe PaymentIntent object
 */
async function createDonationPaymentIntent(amount, email, name, purpose = null) {
  try {
    if (amount < 50) {
      throw new Error('Minimum donation amount is $0.50');
    }
    if (amount > 100000000) {
      throw new Error('Maximum donation amount is $1,000,000');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Stripe expects amount in cents
      currency: 'usd',
      payment_method_types: ['card'],
      receipt_email: email,
      metadata: {
        donor_email: email,
        donor_name: name,
        donation_purpose: purpose || 'General Conservation',
        created_at: new Date().toISOString()
      },
      description: `Ocean Conservation Donation - ${name}`
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Return as dollars
      currency: paymentIntent.currency
    };
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Confirm a payment that has been processed on the client side
 * @param {string} paymentIntentId - Stripe PaymentIntent ID
 * @returns {Promise<Object>} - Confirmation result
 */
async function confirmPayment(paymentIntentId) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      return {
        success: true,
        status: 'succeeded',
        amount: paymentIntent.amount / 100,
        email: paymentIntent.receipt_email,
        paymentIntentId: paymentIntent.id,
        created: paymentIntent.created * 1000 // Convert to milliseconds
      };
    }

    if (paymentIntent.status === 'processing') {
      return {
        success: true,
        status: 'processing',
        message: 'Payment is being processed'
      };
    }

    if (paymentIntent.status === 'requires_payment_method') {
      return {
        success: false,
        status: 'requires_payment_method',
        message: 'Payment method is required'
      };
    }

    return {
      success: false,
      status: paymentIntent.status,
      message: `Payment status: ${paymentIntent.status}`
    };
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create a recurring subscription for monthly donations
 * @param {number} amount - Monthly amount in dollars
 * @param {string} email - Donor's email
 * @param {string} name - Donor's name
 * @param {string} paymentMethodId - Stripe PaymentMethod ID
 * @returns {Promise<Object>} - Subscription object
 */
async function createRecurringDonation(amount, email, name, paymentMethodId) {
  try {
    if (amount < 5) {
      throw new Error('Minimum monthly recurring donation is $5.00');
    }

    // Create or retrieve customer
    const customers = await stripe.customers.list({ email });
    let customer;

    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          donated_to: 'Ocean Conservation'
        }
      });
    }

    // Create price object for recurring donation
    const price = await stripe.prices.create({
      currency: 'usd',
      unit_amount: Math.round(amount * 100),
      recurring: {
        interval: 'month',
        interval_count: 1
      },
      product_data: {
        name: 'Monthly Ocean Conservation Donation',
        description: 'Support ocean conservation projects with a monthly donation'
      }
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription'
      },
      metadata: {
        donor_email: email,
        donor_name: name,
        subscription_type: 'monthly_donation'
      }
    });

    return {
      success: true,
      subscriptionId: subscription.id,
      customerId: customer.id,
      status: subscription.status,
      amount: amount,
      interval: 'monthly',
      nextBillingDate: subscription.current_period_end * 1000
    };
  } catch (error) {
    console.error('Recurring donation creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cancel a recurring subscription
 * @param {string} subscriptionId - Stripe Subscription ID
 * @returns {Promise<Object>} - Cancellation result
 */
async function cancelSubscription(subscriptionId) {
  try {
    const subscription = await stripe.subscriptions.del(subscriptionId);

    return {
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      canceledAt: subscription.canceled_at * 1000
    };
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Retrieve subscription details
 * @param {string} subscriptionId - Stripe Subscription ID
 * @returns {Promise<Object>} - Subscription details
 */
async function getSubscriptionDetails(subscriptionId) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    return {
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      customer: subscription.customer,
      amount: subscription.items.data[0].price.unit_amount / 100,
      currency: subscription.items.data[0].price.currency,
      interval: subscription.items.data[0].price.recurring.interval,
      nextBillingDate: subscription.current_period_end * 1000,
      createdAt: subscription.created * 1000
    };
  } catch (error) {
    console.error('Subscription retrieval error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Retrieve donor's payment methods
 * @param {string} customerId - Stripe Customer ID
 * @returns {Promise<Object>} - List of payment methods
 */
async function getPaymentMethods(customerId) {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card'
    });

    return {
      success: true,
      count: paymentMethods.data.length,
      paymentMethods: paymentMethods.data.map(pm => ({
        id: pm.id,
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year
      }))
    };
  } catch (error) {
    console.error('Payment methods retrieval error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Retrieve donation receipt
 * @param {string} paymentIntentId - Stripe PaymentIntent ID
 * @returns {Promise<Object>} - Receipt details
 */
async function getDonationReceipt(paymentIntentId) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return {
        success: false,
        message: 'Payment was not successful'
      };
    }

    const charge = paymentIntent.charges.data[0];

    return {
      success: true,
      receiptUrl: charge.receipt_url,
      receiptNumber: charge.id,
      amount: charge.amount / 100,
      currency: charge.currency.toUpperCase(),
      date: new Date(charge.created * 1000).toISOString(),
      email: paymentIntent.receipt_email,
      donorName: paymentIntent.metadata.donor_name,
      purpose: paymentIntent.metadata.donation_purpose
    };
  } catch (error) {
    console.error('Receipt retrieval error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Handle webhook event from Stripe
 * @param {string} eventType - Type of webhook event
 * @param {Object} data - Event data
 * @param {Object} db - Database connection
 * @returns {Promise<Object>} - Processing result
 */
async function handleWebhookEvent(eventType, data, db) {
  try {
    switch (eventType) {
      case 'payment_intent.succeeded':
        // Record successful donation
        if (db) {
          return recordDonationFromPayment(data, db);
        }
        return { success: true, message: 'Payment recorded' };

      case 'customer.subscription.created':
        // Record recurring donation
        if (db) {
          return recordRecurringDonation(data, db);
        }
        return { success: true, message: 'Subscription recorded' };

      case 'customer.subscription.deleted':
        // Mark subscription as cancelled
        if (db) {
          return cancelRecurringDonation(data, db);
        }
        return { success: true, message: 'Subscription cancelled' };

      default:
        return { success: false, message: `Unhandled webhook event: ${eventType}` };
    }
  } catch (error) {
    console.error('Webhook handling error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Record donation in database after successful payment
 * @private
 */
function recordDonationFromPayment(paymentData, db) {
  return new Promise((resolve) => {
    const { amount, currency, receipt_email, metadata } = paymentData;

    db.run(
      `INSERT INTO donations (email, name, amount, purpose, payment_method, stripe_payment_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        receipt_email,
        metadata.donor_name,
        amount / 100,
        metadata.donation_purpose,
        'stripe',
        paymentData.id,
        'completed'
      ],
      function(err) {
        if (err) {
          resolve({ success: false, error: err.message });
        } else {
          resolve({ success: true, donationId: this.lastID });
        }
      }
    );
  });
}

/**
 * Record recurring donation in database
 * @private
 */
function recordRecurringDonation(subscriptionData, db) {
  return new Promise((resolve) => {
    const amount = subscriptionData.items.data[0].price.unit_amount / 100;

    db.run(
      `INSERT INTO recurring_donations (customer_id, subscription_id, email, amount, interval, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        subscriptionData.customer,
        subscriptionData.id,
        subscriptionData.metadata?.donor_email || 'unknown',
        amount,
        'monthly',
        'active'
      ],
      function(err) {
        if (err) {
          resolve({ success: false, error: err.message });
        } else {
          resolve({ success: true, subscriptionId: subscriptionData.id });
        }
      }
    );
  });
}

/**
 * Cancel recurring donation in database
 * @private
 */
function cancelRecurringDonation(subscriptionData, db) {
  return new Promise((resolve) => {
    db.run(
      `UPDATE recurring_donations SET status = ? WHERE subscription_id = ?`,
      ['cancelled', subscriptionData.id],
      function(err) {
        if (err) {
          resolve({ success: false, error: err.message });
        } else {
          resolve({ success: true, subscriptionId: subscriptionData.id });
        }
      }
    );
  });
}

module.exports = {
  createDonationPaymentIntent,
  confirmPayment,
  createRecurringDonation,
  cancelSubscription,
  getSubscriptionDetails,
  getPaymentMethods,
  getDonationReceipt,
  handleWebhookEvent
};
