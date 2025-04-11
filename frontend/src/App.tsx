// import React from 'react';
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements } from '@stripe/react-stripe-js';
// import PaymentForm from './components/forms/payment-form';
// import './App.css';

// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// function App() {
//   return (
//     <Elements stripe={stripePromise}>
//       <div className="app">
//         <PaymentForm />
//       </div>
//     </Elements>
//   );
// }

// export default App;


import PaymentForm from "./components/forms/payment-form/payment-form"
import "./App.css"

function App() {
  return (
    <div className="app">
      <PaymentForm />
    </div>
  )
}

export default App



