import { Request, Response } from 'express';
import PaymentService from '../services/payment.service';

const createPayment = async (req: Request, res: Response) => {
  try {
    const { amount, paymentMethod, client } = req.body;

    if (!amount || !paymentMethod || !client?.email) {
      return res.status(400).json({
        error: 'amount, paymentMethod, and client.email are required',
      });
    }

    const result = await PaymentService.createPaymentIntent(amount, paymentMethod, client);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating payment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  createPayment,
};
