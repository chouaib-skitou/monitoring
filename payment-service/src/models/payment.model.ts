import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  amount: number;
  currency: string;
  status: string;
  stripePaymentIntentId: string;
  clientEmail?: string;
  clientName?: string;
  paymentMethod?: string;
}

const PaymentSchema = new Schema<IPayment>(
  {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'usd' },
    status: { type: String, default: 'pending' },
    stripePaymentIntentId: { type: String, required: true },
    clientEmail: { type: String },
    clientName: { type: String },
    paymentMethod: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);
