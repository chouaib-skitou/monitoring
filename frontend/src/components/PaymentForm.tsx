import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { paymentService } from '../services/api';
import './PaymentForm.css';

// Define types
interface PaymentFormState {
  name: string;
  email: string;
  amount: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
}

interface MessageState {
  text: string;
  type: 'success' | 'error' | '';
}

const PaymentForm: React.FC = () => {
  const [formState, setFormState] = useState<PaymentFormState>({
    name: '',
    email: '',
    amount: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<MessageState>({ text: '', type: '' });
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [publishableKey, setPublishableKey] = useState<string>('');

  const { name, email, amount, cardNumber, cardExpiry, cardCvc } = formState;

  useEffect(() => {
    // Fetch config from backend or use environment variable
    const fetchConfig = async (): Promise<void> => {
      try {
        // You can either fetch from backend or use the environment variable directly
        // const response = await paymentService.getConfig();
        // setPublishableKey(response.data.publishableKey);
        
        // Or use environment variable directly
        setPublishableKey(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
        console.log('✅ Stripe configuration loaded');
      } catch (error) {
        console.error('❌ Stripe config error:', error);
      }
    };

    fetchConfig();
  }, []);

  // Format card number with spaces
  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = '';
    
    for (let i = 0; i < v.length; i++) {
      if (i > 0 && i % 4 === 0) formattedValue += ' ';
      formattedValue += v[i];
    }
    
    return formattedValue;
  };

  // Format expiry date
  const formatExpiry = (value: string): string => {
    const v = value.replace(/\D/g, '');
    
    if (v.length > 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    
    return v;
  };

  // Handle input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target;
    
    let processedValue = value;
    
    if (id === 'card-number') {
      processedValue = formatCardNumber(value);
    } else if (id === 'card-expiry') {
      processedValue = formatExpiry(value);
    } else if (id === 'card-cvc') {
      processedValue = value.replace(/\D/g, '');
    }
    
    setFormState({
      ...formState,
      [id === 'name' ? 'name' : 
       id === 'email' ? 'email' : 
       id === 'amount' ? 'amount' : 
       id === 'card-number' ? 'cardNumber' : 
       id === 'card-expiry' ? 'cardExpiry' : 
       'cardCvc']: processedValue
    });
  };

  // Check if all inputs are filled
  useEffect(() => {
    if (name && email && amount && cardNumber && cardExpiry && cardCvc) {
      setCurrentStep(1);
    } else {
      setCurrentStep(0);
    }
  }, [name, email, amount, cardNumber, cardExpiry, cardCvc]);

  // Validate card number using Luhn algorithm
  const validateCardNumber = (number: string): boolean => {
    const v = number.replace(/\D/g, '');
    if (!/^\d{13,19}$/.test(v)) return false;
  
    let sum = 0;
    let shouldDouble = false;
    for (let i = v.length - 1; i >= 0; i--) {
      let digit = parseInt(v.charAt(i));
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    setIsLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      const paymentData = {
        amount: parseFloat(amount),
        paymentMethod: 'card',
        client: { name, email },
        card: {
          number: cardNumber.replace(/\s+/g, ''),
          expiry: cardExpiry,
          cvc: cardCvc
        }
      };
      
      // Log the data being sent to the server for debugging
      console.log('Sending payment data:', paymentData);
      
      // Create payment intent on server
      const response = await paymentService.createPayment(paymentData);
      
      console.log('Payment intent created:', response.data);
      
      // Show success message
      setCurrentStep(2);
      setMessage({
        text: 'Payment successful! Thank you for your purchase.',
        type: 'success'
      });
      
      // Reset form
      setFormState({
        name: '',
        email: '',
        amount: '',
        cardNumber: '',
        cardExpiry: '',
        cardCvc: ''
      });
      
    } catch (error) {
      console.error('Payment error:', error);
      setMessage({
        text: axios.isAxiosError(error) && error.response?.data?.message 
          ? error.response.data.message 
          : 'An error occurred. Please try again.',
        type: 'error'
      });
      setCurrentStep(0);
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
            <input 
              type="text" 
              id="name" 
              placeholder="John Doe" 
              value={name}
              onChange={handleInputChange}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
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
        
        <div className="form-group amount-input">
          <label htmlFor="amount">Amount (USD)</label>
          <input 
            type="number" 
            id="amount" 
            placeholder="100" 
            min="1" 
            value={amount}
            onChange={handleInputChange}
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="card-element">Card Information</label>
          <div className="card-icons">
            {/* Card icons */}
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
          </div>
          <div id="card-element">
            <div className="card-number-input">
              <input 
                type="text" 
                id="card-number" 
                placeholder="Card number" 
                maxLength={19} 
                value={cardNumber}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="card-expiry-cvc">
              <div>
                <input 
                  type="text" 
                  id="card-expiry" 
                  placeholder="MM/YY" 
                  maxLength={5} 
                  value={cardExpiry}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div>
                <input 
                  type="text" 
                  id="card-cvc" 
                  placeholder="CVC" 
                  maxLength={4} 
                  value={cardCvc}
                  onChange={handleInputChange}
                  required 
                />
              </div>
            </div>
          </div>
          <div id="card-errors" className="error" role="alert">
            {cardNumber && !validateCardNumber(cardNumber) && 'Invalid card number'}
          </div>
        </div>
        
        <button type="submit" id="submit-button" disabled={isLoading}>
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
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    </div>
  );
};

export default PaymentForm;