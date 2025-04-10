import express from 'express';
import PaymentController from '../controllers/payment.controller';

const router = express.Router();

router.post('/create', PaymentController.createPayment);

export default router;
