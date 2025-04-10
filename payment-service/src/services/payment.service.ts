import Stripe from 'stripe';
import dotenv from 'dotenv';
import PaymentRepository from '../repositories/payment.repository';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-03-31.basil', // ✅ Updated Stripe API version
});

const createPaymentIntent = async (
  amount: number,
  paymentMethod: string,
  client: { name?: string; email: string }
) => {
  const intent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: 'usd',
    payment_method_types: [paymentMethod],
    receipt_email: client.email,
    metadata: {
      customer_name: client.name || '',
    },
  });

  const payment = await PaymentRepository.createPayment({
    amount,
    currency: 'usd',
    stripePaymentIntentId: intent.id,
    status: intent.status,
    clientEmail: client.email,
    clientName: client.name,
    paymentMethod,
  });

  return {
    clientSecret: intent.client_secret,
    payment,
  };
};

export default {
  createPaymentIntent,
};
