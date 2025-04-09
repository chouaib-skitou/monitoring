import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db';
import paymentRoutes from './routes/payment.routes';
import path from 'path';

dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
    // return server is running
    res.send('Payment Service is running...');
});
  

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
});
