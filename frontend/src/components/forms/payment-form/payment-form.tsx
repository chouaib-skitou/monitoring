"use client"

import type React from "react"

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react"
import { useStripe, useElements, Elements, CardElement } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { paymentService } from "../../../services/api"
import "./payment-form.css"

// UI Components
import Input from "../../ui/input/input"
import Button from "../../ui/button/button"
import StripeCardElement from "../../ui/card/card-element"
import Message from "../../ui/message/message"
import ProgressSteps from "../../ui/progress/progress-steps"
import TestCard, { type TestCardData } from "../../ui/test-card/test-card"
import SuccessMessage from "../../ui/success-message/success-message"
import SecureBadge from "../../ui/secure-badge/secure-badge"

interface PaymentFormState {
  name: string
  email: string
  amount: string
}

interface MessageState {
  text: string
  type: "success" | "error" | ""
}

// Define test cards with realistic designs
const testCards: TestCardData[] = [
  {
    type: "success",
    title: "Accepted Payment",
    number: "4242 4242 4242 4242",
    expiry: "12/30",
    cvc: "123",
    bankName: "UNIVERSAL BANK",
    icon: (
      <svg viewBox="0 0 38 24" width="38" height="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#fff" />
        <path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#fff" />
        <path
          d="M15 19h2v-9h-2v9zm13-9h-3.5L21 15.4V10h-2v9h2v-1.8L22.2 16 25 19h2l-4-5.2L26 10zm-8 4c0-3-6-3-6 0h2c0-1 2-1 2 0s-2 1-2 2h4v-2zm-6-4v9h2v-4h2v-2h-2v-1h3v-2h-5z"
          fill="#142688"
        />
      </svg>
    ),
    description: "This simulates a successful payment.",
    color: "linear-gradient(135deg, #1a1f71, #2639c3)",
  },
  {
    type: "declined",
    title: "Card Declined",
    number: "4000 0000 0000 0002",
    expiry: "04/28",
    cvc: "456",
    bankName: "GLOBAL CREDIT",
    icon: (
      <svg viewBox="0 0 38 24" width="38" height="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#fff" />
        <path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#fff" />
        <circle fill="#EB001B" cx="15" cy="12" r="7" />
        <circle fill="#F79E1B" cx="23" cy="12" r="7" />
        <path
          fill="#FF5F00"
          d="M15 5c2.8 0 5.3 1.3 7 3.2C20.3 6.3 17.8 5 15 5c-2.8 0-5.3 1.3-7 3.2 1.7-2 4.2-3.2 7-3.2z"
        />
      </svg>
    ),
    description: "This card will be declined by the bank.",
    color: "linear-gradient(135deg, #cc0000, #ff5f00)",
  },
  {
    type: "insufficient",
    title: "Insufficient Funds",
    number: "4000 0000 0000 0341",
    expiry: "08/25",
    cvc: "789",
    bankName: "PREMIER BANK",
    icon: (
      <svg viewBox="0 0 38 24" width="38" height="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#fff" />
        <path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#fff" />
        <path
          fill="#006FCF"
          d="M8.971 10.268l.774 1.876H8.203l.768-1.876zm16.075-4.962h-7.465v11.395h7.465v-2.367h-4.942v-2.129h4.83v-2.361h-4.83v-2.163h4.942V5.306zm-10.474 0l-3.909 8.955-1.681-8.955h-3.256l2.668 11.395h3.803l3.868-8.968 1.674 8.968h3.788L25.186 5.306h-3.256l-1.734 8.955-3.909-8.955h-2.715zm-6.284 4.962l.774 1.876h-1.542l.768-1.876zm-4.968 6.433h2.48l.626-1.461h3.62l.625 1.461h2.482l-3.637-8.044h-2.549l-3.647 8.044zm23.135-3.662c0-.965.592-1.548 1.744-1.548.898 0 1.646.308 2.334.794l1.158-1.941c-.898-.514-1.937-.869-3.077-.869-2.604 0-4.41 1.603-4.41 3.688 0 4.04 5.568 2.448 5.568 4.854 0 .996-.66 1.609-1.881 1.609-1.196 0-2.186-.498-2.976-1.174l-1.154 1.907c.916.739 2.296 1.293 3.961 1.293 2.636 0 4.523-1.443 4.523-3.815 0-4.25-5.79-2.72-5.79-4.798z"
        />
      </svg>
    ),
    description: "This simulates a card with insufficient funds.",
    color: "linear-gradient(135deg, #006fcf, #00356b)",
  },
]

// Define Stripe Element appearance
const appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#6366f1", // var(--primary)
    colorBackground: "#ffffff",
    colorText: "#1f2937", // var(--gray-800)
    colorDanger: "#ef4444", // var(--danger)
    fontFamily: "Inter, system-ui, sans-serif",
    spacingUnit: "4px",
    borderRadius: "10px", // var(--radius)
  },
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const PaymentFormInner: React.FC = () => {
  const [formState, setFormState] = useState<PaymentFormState>({
    name: "",
    email: "",
    amount: "",
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<MessageState>({ text: "", type: "" })
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false)
  const [selectedCard, setSelectedCard] = useState<TestCardData | null>(null)

  const stripe = useStripe()
  const elements = useElements()

  const { name, email, amount } = formState

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target
    setFormState({ ...formState, [id]: value })
  }

  const handleCardSelect = (card: TestCardData) => {
    setSelectedCard(card)

    // Auto-fill the form with test data when a test card is selected
    setFormState({
      name: "Test User",
      email: "test@example.com",
      amount: "100",
    })

    // Update the card field - this is a bit tricky with Stripe Elements
    // We'll just notify the user to enter the expiry and CVC
    setMessage({
      text: `Card selected: ${card.number}. Use expiry: ${card.expiry} and CVC: ${card.cvc}`,
      type: "",
    })
  }

  useEffect(() => {
    if (name && email && amount) {
      setCurrentStep(1)
    } else {
      setCurrentStep(0)
    }
  }, [name, email, amount])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    if (!stripe || !elements) return

    setIsLoading(true)
    setMessage({ text: "", type: "" })

    try {
      const { data } = await paymentService.createPayment({
        amount: Number.parseFloat(amount),
        paymentMethod: "card",
        client: { name, email },
      })

      const cardElement = elements.getElement(CardElement)
      if (!cardElement) throw new Error("Card element not found")

      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name,
            email,
          },
        },
      })

      if (error) {
        setMessage({ text: error.message || "Payment failed", type: "error" })
      } else if (paymentIntent?.status === "succeeded") {
        setCurrentStep(2)
        setPaymentSuccess(true)
        setMessage({ text: "Payment successful! Thank you for your purchase.", type: "success" })
      }
    } catch (err) {
      setMessage({ text: "An error occurred. Please try again.", type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setPaymentSuccess(false)
    setFormState({ name: "", email: "", amount: "" })
    setCurrentStep(0)
    setMessage({ text: "", type: "" })
    setSelectedCard(null)
  }

  const renderPaymentForm = () => (
    <>
      <ProgressSteps
        steps={[
          { number: 0, text: "Details" },
          { number: 1, text: "Payment" },
          { number: 2, text: "Confirmation" },
        ]}
        currentStep={currentStep}
      />

      <form id="payment-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <Input
            label="Full Name"
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={handleInputChange}
            required
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            }
          />

          <Input
            label="Email Address"
            id="email"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={handleInputChange}
            required
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            }
          />
        </div>

        <Input
          label="Amount (USD)"
          id="amount"
          type="number"
          placeholder="100"
          value={amount}
          onChange={handleInputChange}
          min="1"
          required
          className="amount-input"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          }
        />

        <StripeCardElement
          label="Card Information"
          hint={
            selectedCard && (
              <div className="selected-card-info">
                Using test card: <strong>{selectedCard.number}</strong>
                <br />
                <small>
                  Expiry: {selectedCard.expiry} | CVC: {selectedCard.cvc}
                </small>
              </div>
            )
          }
        />

        <Button type="submit" disabled={isLoading || !stripe || !elements} isLoading={isLoading}>
          {isLoading ? "Processing..." : "Complete Payment"}
        </Button>

        <Message text={message.text} type={message.type} />
      </form>

      <SecureBadge />
    </>
  )

  return (
    <div className="payment-page">
      <div className="test-cards-container">
        <div className="test-cards-header">
          <h2>Test Cards</h2>
          <p>Click a card to use it for testing</p>
        </div>

        <div className="test-cards">
          {testCards.map((card) => (
            <TestCard
              key={card.number}
              card={card}
              isSelected={selectedCard?.number === card.number}
              onSelect={() => handleCardSelect(card)}
            />
          ))}
        </div>
      </div>

      <div className="container">
        <div className="header">
          <h1>Secure Payment</h1>
          <p>Complete your purchase with confidence</p>
        </div>

        {paymentSuccess ? (
          <SuccessMessage amount={amount} name={name} email={email} onReset={resetForm} />
        ) : (
          renderPaymentForm()
        )}
      </div>
    </div>
  )
}

const PaymentForm: React.FC = () => (
  <Elements stripe={stripePromise} options={{ appearance }}>
    <PaymentFormInner />
  </Elements>
)

export default PaymentForm
