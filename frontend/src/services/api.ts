import axios from 'axios';

interface PaymentData {
  amount: number;
  paymentMethod: string;
  client: {
    name: string;
    email: string;
  };
}

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const paymentService = {
  createPayment: (data: PaymentData) => api.post('/payments/create', data),
};

export default api;
