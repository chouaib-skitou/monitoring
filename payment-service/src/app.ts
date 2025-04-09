import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db';
import paymentRoutes from './routes/payment.routes';

dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
