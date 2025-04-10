import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from '@stripe/react-stripe-js';
import { paymentService } from '../services/api';
import './PaymentForm.css';

interface PaymentFormState {
  name: string;
  email: string;
  amount: string;
}

interface MessageState {
  text: string;
  type: 'success' | 'error' | '';
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentFormInner: React.FC = () => {
  const [formState, setFormState] = useState<PaymentFormState>({
    name: '',
    email: '',
    amount: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<MessageState>({ text: '', type: '' });
  const [currentStep, setCurrentStep] = useState<number>(0);

  const stripe = useStripe();
  const elements = useElements();

  const { name, email, amount } = formState;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target;
    setFormState({ ...formState, [id]: value });
  };

  useEffect(() => {
    if (name && email && amount) {
      setCurrentStep(1);
    } else {
      setCurrentStep(0);
    }
  }, [name, email, amount]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const { data } = await paymentService.createPayment({
        amount: parseFloat(amount),
        paymentMethod: 'card',
        client: { name, email }
      });

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name,
            email
          }
        }
      });

      if (error) {
        setMessage({ text: error.message || 'Payment failed', type: 'error' });
      } else if (paymentIntent?.status === 'succeeded') {
        setCurrentStep(2);
        setMessage({ text: 'Payment successful! Thank you for your purchase.', type: 'success' });
        setFormState({ name: '', email: '', amount: '' });
      }
    } catch (err) {
      setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Secure Payment</h1>
        <p>Complete your purchase with confidence</p>
      </div>

      <div className="progress-steps">
        <div className={`step ${currentStep === 0 ? 'active' : currentStep > 0 ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-text">Details</div>
        </div>
        <div className={`step ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-text">Payment</div>
        </div>
        <div className={`step ${currentStep === 2 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-text">Confirmation</div>
        </div>
      </div>

      <form id="payment-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input type="text" id="name" value={name} onChange={handleInputChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" value={email} onChange={handleInputChange} required />
          </div>
        </div>

        <div className="form-group amount-input">
          <label htmlFor="amount">Amount (USD)</label>
          <input type="number" id="amount" value={amount} onChange={handleInputChange} min="1" required />
        </div>

        <div className="form-group">
          <label htmlFor="card-element">Card Information</label>
          <CardElement options={{ hidePostalCode: true }} />
        </div>

        <button type="submit" disabled={isLoading || !stripe || !elements}>
          {isLoading ? <span>Processing...</span> : <span>Complete Payment</span>}
        </button>

        {message.text && (
          <div className={`message-container ${message.type}`}>
            {message.text}
          </div>
        )}
      </form>

      <div className="secure-badge">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        Secured by Stripe with 256-bit encryption
      </div>
    </div>
  );
};

const PaymentForm: React.FC = () => (
  <Elements stripe={stripePromise}>
    <PaymentFormInner />
  </Elements>
);

export default PaymentForm;
