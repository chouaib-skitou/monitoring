// src/services/api.ts
import axios from 'axios';

// Define types
interface PaymentData {
  amount: number;
  paymentMethod: string;
  client: {
    name: string;
    email: string;
  };
  card: {
    number: string;
    expiry: string;
    cvc: string;
  };
}

interface ConfigResponse {
  publishableKey: string;
}

// Create axios instance
const api = axios.create({
  // Use relative URLs instead of absolute URLs with the host
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Payment service
export const paymentService = {
  // Get Stripe config
  getConfig: () => api.get<ConfigResponse>('/payments/config'),
  
  // Create payment
  createPayment: (data: PaymentData) => api.post('/payments/create', data),
};

export default api;