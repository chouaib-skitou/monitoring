import Payment, { IPayment } from '../models/payment.model';

const createPayment = async (data: Partial<IPayment>) => {
  return await Payment.create(data);
};

const updatePaymentStatus = async (id: string, status: string) => {
  return await Payment.findByIdAndUpdate(id, { status }, { new: true });
};

export default {
  createPayment,
  updatePaymentStatus,
};
