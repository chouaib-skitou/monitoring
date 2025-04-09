import express from 'express';
import PaymentController from '../controllers/payment.controller';
import path from 'path';

const router = express.Router();

router.post('/create', PaymentController.createPayment);

// router.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, '../../index.html'));
// });

// router.get('/config', (req, res) => {
//     res.json({
//         publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
//     });
// });
  

export default router;
