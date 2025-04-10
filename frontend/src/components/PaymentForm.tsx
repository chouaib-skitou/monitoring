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

interface TestCard {
  type: 'success' | 'declined' | 'insufficient';
  title: string;
  number: string;
  expiry: string;
  cvc: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  bankName: string;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Define test cards with realistic designs
const testCards: TestCard[] = [
  {
    type: 'success',
    title: 'Accepted Payment',
    number: '4242 4242 4242 4242',
    expiry: '12/30',
    cvc: '123',
    bankName: 'UNIVERSAL BANK',
    icon: (
      <svg viewBox="0 0 38 24" width="38" height="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#fff"/>
        <path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#fff"/>
        <path d="M15 19h2v-9h-2v9zm13-9h-3.5L21 15.4V10h-2v9h2v-1.8L22.2 16 25 19h2l-4-5.2L26 10zm-8 4c0-3-6-3-6 0h2c0-1 2-1 2 0s-2 1-2 2h4v-2zm-6-4v9h2v-4h2v-2h-2v-1h3v-2h-5z" fill="#142688"/>
      </svg>
    ),
    description: 'This simulates a successful payment.',
    color: 'linear-gradient(135deg, #1a1f71, #2639c3)'
  },
  {
    type: 'declined',
    title: 'Card Declined',
    number: '4000 0000 0000 0002',
    expiry: '04/28',
    cvc: '456',
    bankName: 'GLOBAL CREDIT',
    icon: (
      <svg viewBox="0 0 38 24" width="38" height="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#fff"/>
        <path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#fff"/>
        <circle fill="#EB001B" cx="15" cy="12" r="7"/>
        <circle fill="#F79E1B" cx="23" cy="12" r="7"/>
        <path fill="#FF5F00" d="M15 5c2.8 0 5.3 1.3 7 3.2C20.3 6.3 17.8 5 15 5c-2.8 0-5.3 1.3-7 3.2 1.7-2 4.2-3.2 7-3.2z"/>
      </svg>
    ),
    description: 'This card will be declined by the bank.',
    color: 'linear-gradient(135deg, #cc0000, #ff5f00)'
  },
  {
    type: 'insufficient',
    title: 'Insufficient Funds',
    number: '4000 0000 0000 0341',
    expiry: '08/25',
    cvc: '789',
    bankName: 'PREMIER BANK',
    icon: (
      <svg viewBox="0 0 38 24" width="38" height="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#fff"/>
        <path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#fff"/>
        <path fill="#006FCF" d="M8.971 10.268l.774 1.876H8.203l.768-1.876zm16.075-4.962h-7.465v11.395h7.465v-2.367h-4.942v-2.129h4.83v-2.361h-4.83v-2.163h4.942V5.306zm-10.474 0l-3.909 8.955-1.681-8.955h-3.256l2.668 11.395h3.803l3.868-8.968 1.674 8.968h3.788L25.186 5.306h-3.256l-1.734 8.955-3.909-8.955h-2.715zm-6.284 4.962l.774 1.876h-1.542l.768-1.876zm-4.968 6.433h2.48l.626-1.461h3.62l.625 1.461h2.482l-3.637-8.044h-2.549l-3.647 8.044zm23.135-3.662c0-.965.592-1.548 1.744-1.548.898 0 1.646.308 2.334.794l1.158-1.941c-.898-.514-1.937-.869-3.077-.869-2.604 0-4.41 1.603-4.41 3.688 0 4.04 5.568 2.448 5.568 4.854 0 .996-.66 1.609-1.881 1.609-1.196 0-2.186-.498-2.976-1.174l-1.154 1.907c.916.739 2.296 1.293 3.961 1.293 2.636 0 4.523-1.443 4.523-3.815 0-4.25-5.79-2.72-5.79-4.798z"/>
      </svg>
    ),
    description: 'This simulates a card with insufficient funds.',
    color: 'linear-gradient(135deg, #006fcf, #00356b)'
  }
];

// Define Stripe Element styles
const cardElementOptions = {
  style: {
    base: {
      color: '#374151', // var(--gray-700)
      fontFamily: '"Inter", -apple-system, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#9ca3af', // var(--gray-400)
      },
      padding: '16px',
    },
    invalid: {
      color: '#ef4444', // var(--danger)
      iconColor: '#ef4444', // var(--danger)
    },
  },
  hidePostalCode: true,
};

// Define Stripe Element appearance
const appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#6366f1', // var(--primary)
    colorBackground: '#ffffff',
    colorText: '#1f2937', // var(--gray-800)
    colorDanger: '#ef4444', // var(--danger)
    fontFamily: 'Inter, system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '10px', // var(--radius)
  },
};

const PaymentFormInner: React.FC = () => {
  const [formState, setFormState] = useState<PaymentFormState>({
    name: '',
    email: '',
    amount: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<MessageState>({ text: '', type: '' });
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<TestCard | null>(null);
  const [cardFlipped, setCardFlipped] = useState<string | null>(null);

  const stripe = useStripe();
  const elements = useElements();

  const { name, email, amount } = formState;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target;
    setFormState({ ...formState, [id]: value });
  };

  const handleCardSelect = (card: TestCard) => {
    setSelectedCard(card);
    
    // Auto-fill the form with test data when a test card is selected
    setFormState({
      name: 'Test User',
      email: 'test@example.com',
      amount: '100'
    });
    
    // Update the card field - this is a bit tricky with Stripe Elements
    // We'll just notify the user to enter the expiry and CVC
    setMessage({
      text: `Card selected: ${card.number}. Use expiry: ${card.expiry} and CVC: ${card.cvc}`,
      type: ''
    });
  };

  const toggleCardFlip = (cardNumber: string) => {
    if (cardFlipped === cardNumber) {
      setCardFlipped(null);
    } else {
      setCardFlipped(cardNumber);
    }
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
        setPaymentSuccess(true);
        setMessage({ text: 'Payment successful! Thank you for your purchase.', type: 'success' });
      }
    } catch (err) {
      setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderSuccessMessage = () => (
    <div className="success-container">
      <div className="success-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M8 12l2 2 6-6"></path>
        </svg>
      </div>
      <h2>Payment Successful!</h2>
      <p>Your transaction has been processed successfully.</p>
      <div className="payment-details">
        <div className="detail-row">
          <span>Amount:</span>
          <span>${amount}</span>
        </div>
        <div className="detail-row">
          <span>Name:</span>
          <span>{name}</span>
        </div>
        <div className="detail-row">
          <span>Email:</span>
          <span>{email}</span>
        </div>
        <div className="detail-row">
          <span>Transaction ID:</span>
          <span>TXN_{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
        </div>
        <div className="detail-row">
          <span>Date:</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>
      <button 
        className="reset-button"
        onClick={() => {
          setPaymentSuccess(false);
          setFormState({ name: '', email: '', amount: '' });
          setCurrentStep(0);
          setMessage({ text: '', type: '' });
          setSelectedCard(null);
        }}
      >
        Make Another Payment
      </button>
    </div>
  );

  const renderPaymentForm = () => (
    <>
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
            <div className="input-with-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input 
                type="text" 
                id="name" 
                placeholder="John Doe"
                value={name} 
                onChange={handleInputChange} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input 
                type="email" 
                id="email" 
                placeholder="john@example.com"
                value={email} 
                onChange={handleInputChange} 
                required 
              />
            </div>
          </div>
        </div>

        <div className="form-group amount-input">
          <label htmlFor="amount">Amount (USD)</label>
          <div className="input-with-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <input 
              type="number" 
              id="amount" 
              placeholder="100"
              value={amount} 
              onChange={handleInputChange} 
              min="1" 
              required 
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="card-element">Card Information</label>
          {/* <div className="card-icons">
            <div className="card-icon">
              <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#fff"/>
                <path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#fff"/>
                <path d="M15 19h2v-9h-2v9zm13-9h-3.5L21 15.4V10h-2v9h2v-1.8L22.2 16 25 19h2l-4-5.2L26 10zm-8 4c0-3-6-3-6 0h2c0-1 2-1 2 0s-2 1-2 2h4v-2zm-6-4v9h2v-4h2v-2h-2v-1h3v-2h-5z" fill="#142688"/>
              </svg>
            </div>
            <div className="card-icon">
              <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#fff"/>
                <path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#fff"/>
                <circle fill="#EB001B" cx="15" cy="12" r="7"/>
                <circle fill="#F79E1B" cx="23" cy="12" r="7"/>
                <path fill="#FF5F00" d="M15 5c2.8 0 5.3 1.3 7 3.2C20.3 6.3 17.8 5 15 5c-2.8 0-5.3 1.3-7 3.2 1.7-2 4.2-3.2 7-3.2z"/>
              </svg>
            </div>
            <div className="card-icon">
              <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#fff"/>
                <path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#fff"/>
                <path fill="#006FCF" d="M8.971 10.268l.774 1.876H8.203l.768-1.876zm16.075-4.962h-7.465v11.395h7.465v-2.367h-4.942v-2.129h4.83v-2.361h-4.83v-2.163h4.942V5.306zm-10.474 0l-3.909 8.955-1.681-8.955h-3.256l2.668 11.395h3.803l3.868-8.968 1.674 8.968h3.788L25.186 5.306h-3.256l-1.734 8.955-3.909-8.955h-2.715zm-6.284 4.962l.774 1.876h-1.542l.768-1.876zm-4.968 6.433h2.48l.626-1.461h3.62l.625 1.461h2.482l-3.637-8.044h-2.549l-3.647 8.044zm23.135-3.662c0-.965.592-1.548 1.744-1.548.898 0 1.646.308 2.334.794l1.158-1.941c-.898-.514-1.937-.869-3.077-.869-2.604 0-4.41 1.603-4.41 3.688 0 4.04 5.568 2.448 5.568 4.854 0 .996-.66 1.609-1.881 1.609-1.196 0-2.186-.498-2.976-1.174l-1.154 1.907c.916.739 2.296 1.293 3.961 1.293 2.636 0 4.523-1.443 4.523-3.815 0-4.25-5.79-2.72-5.79-4.798z"/>
              </svg>
            </div>
            <div className="card-icon">
              <svg viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#fff"/>
                <path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#fff"/>
                <path d="M3.57 7.16H2v5.5h1.57c.83 0 1.43-.2 1.96-.63.63-.52 1-1.3 1-2.11-.01-1.63-1.22-2.76-2.96-2.76zm1.26 4.14c-.34.3-.77.44-1.47.44h-.29V8.1h.29c.69 0 1.11.12 1.47.44.37.33.59.84.59 1.37 0 .53-.22 1.06-.59 1.39zm2.19-4.14h1.07v5.5H7.02v-5.5zm3.69 2.11c-.64-.24-.83-.4-.83-.69 0-.35.34-.61.8-.61.32 0 .59.13.86.45l.56-.73c-.46-.4-1.01-.61-1.62-.61-.97 0-1.72.68-1.72 1.58 0 .76.35 1.15 1.35 1.51.42.15.63.25.74.31.21.14.32.34.32.57 0 .45-.35.78-.83.78-.51 0-.92-.26-1.17-.73l-.69.67c.49.73 1.09 1.05 1.9 1.05 1.11 0 1.9-.74 1.9-1.81.02-.89-.35-1.29-1.57-1.74zm1.92.65c0 1.62 1.27 2.87 2.9 2.87.46 0 .86-.09 1.34-.32v-1.26c-.43.43-.81.6-1.29.6-1.08 0-1.85-.78-1.85-1.9 0-1.06.79-1.89 1.8-1.89.51 0 .9.18 1.34.62V7.38c-.47-.24-.86-.34-1.32-.34-1.61 0-2.92 1.28-2.92 2.88zm12.76.94l-1.47-3.7h-1.17l2.33 5.64h.58l2.37-5.64h-1.16l-1.48 3.7zm3.13 1.8h3.04v-.93h-1.97v-1.48h1.9v-.93h-1.9V8.1h1.97v-.94h-3.04v5.5zm7.29-3.87c0-1.03-.71-1.62-1.95-1.62h-1.59v5.5h1.07v-2.21h.14l1.48 2.21h1.32l-1.73-2.32c.81-.17 1.26-.72 1.26-1.56zm-2.16.91h-.31V8.03h.33c.67 0 1.03.28 1.03.82 0 .55-.36.85-1.05.85z" fill="#231F20"/>
                <path d="M20.16 12.86a2.931 2.931 0 100-5.862 2.931 2.931 0 000 5.862z" fill="#F48120"/>
              </svg>
            </div>
          </div> */}
          <div id="card-element" className="stripe-card-element">
            <CardElement options={cardElementOptions} />
          </div>
          <div className="card-hint">
            {selectedCard && (
              <div className="selected-card-info">
                Using test card: <strong>{selectedCard.number}</strong>
                <br />
                <small>Expiry: {selectedCard.expiry} | CVC: {selectedCard.cvc}</small>
              </div>
            )}
          </div>
        </div>

        <button type="submit" disabled={isLoading || !stripe || !elements}>
          {isLoading ? (
            <>
              <span className="spinner"></span>
              <span>Processing...</span>
            </>
          ) : (
            <span>Complete Payment</span>
          )}
        </button>

        {message.text && (
          <div className={`message-container ${message.type}`}>
            {message.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            ) : message.type === 'error' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            )}
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
    </>
  );

  return (
    <div className="payment-page">
      <div className="test-cards-container">
        <div className="test-cards-header">
          <h2>Test Cards</h2>
          <p>Click a card to use it for testing</p>
        </div>
        
        <div className="test-cards">
          {testCards.map((card) => (
            <div 
              key={card.number}
              className={`test-card ${card.type} ${selectedCard?.number === card.number ? 'selected' : ''}`}
              onClick={() => handleCardSelect(card)}
            >
              <div 
                className={`credit-card ${cardFlipped === card.number ? 'flipped' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCardFlip(card.number);
                }}
              >
                <div className="credit-card-inner">
                  <div className="credit-card-front">
                    <div className="card-background" style={{ background: card.color }}></div>
                    <div className="card-chip">
                      <svg width="50" height="40" viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="5" y="5" width="40" height="30" rx="3" fill="#FFD700" stroke="#CDA000" strokeWidth="1"/>
                        <rect x="10" y="15" width="30" height="10" fill="#CDA000"/>
                        <rect x="20" y="5" width="10" height="30" fill="#CDA000"/>
                      </svg>
                    </div>
                    <div className="card-contactless">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM8.46 14.45L7.1 13.83C7.9 11.94 9.83 10.5 12 10.5C14.17 10.5 16.1 11.94 16.9 13.83L15.54 14.45C14.9 13.08 13.54 12.15 12 12.15C10.46 12.15 9.1 13.08 8.46 14.45ZM5.84 12.05L4.47 11.43C5.99 8.83 8.77 7 12 7C15.23 7 18.01 8.83 19.53 11.43L18.16 12.05C16.9 9.9 14.62 8.5 12 8.5C9.38 8.5 7.1 9.9 5.84 12.05ZM12 15.5C11.38 15.5 10.77 15.67 10.25 15.97C9.72 16.27 9.28 16.7 8.97 17.22C8.67 17.74 8.5 18.35 8.5 18.97C8.5 19.59 8.67 20.2 8.97 20.72C9.28 21.24 9.72 21.67 10.25 21.97C10.77 22.27 11.38 22.44 12 22.44C12.62 22.44 13.23 22.27 13.75 21.97C14.28 21.67 14.72 21.24 15.03 20.72C15.33 20.2 15.5 19.59 15.5 18.97C15.5 18.35 15.33 17.74 15.03 17.22C14.72 16.7 14.28 16.27 13.75 15.97C13.23 15.67 12.62 15.5 12 15.5Z" fill="#fff" fillOpacity="0.8"/>
                      </svg>
                    </div>
                    <div className="card-brand">
                      {card.icon}
                    </div>
                    <div className="card-number-display">{card.number}</div>
                    <div className="card-details">
                      <div className="card-holder">TEST USER</div>
                      <div className="card-expiry-display">
                        <span>VALID THRU</span>
                        <span>{card.expiry}</span>
                      </div>
                    </div>
                    <div className="card-issuer">{card.bankName}</div>
                    <div className="card-flip-hint">Click to see back</div>
                  </div>
                  <div className="credit-card-back">
                    <div className="card-background" style={{ background: card.color }}></div>
                    <div className="card-magnetic-stripe"></div>
                    <div className="card-signature-panel">
                      <div className="signature">TEST USER</div>
                      <div className="cvc">{card.cvc}</div>
                    </div>
                    <div className="card-back-text">
                      This card is issued by {card.bankName} pursuant to license by Visa/Mastercard/Amex. Use of this card is subject to the agreement.
                    </div>
                    <div className="card-flip-hint">Click to see front</div>
                  </div>
                </div>
              </div>
              <div className="card-info-container">
                <h3>{card.title}</h3>
                <p className="card-description">{card.description}</p>
                <div className="card-details-row">
                  <div className="card-detail">
                    <span>Expiry</span>
                    <strong>{card.expiry}</strong>
                  </div>
                  <div className="card-detail">
                    <span>CVC</span>
                    <strong>{card.cvc}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="container">
        <div className="header">
          <h1>Secure Payment</h1>
          <p>Complete your purchase with confidence</p>
        </div>
        
        {paymentSuccess ? renderSuccessMessage() : renderPaymentForm()}
      </div>
    </div>
  );
};

const PaymentForm: React.FC = () => (
  <Elements stripe={stripePromise} options={{ appearance }}>
    <PaymentFormInner />
  </Elements>
);

export default PaymentForm;