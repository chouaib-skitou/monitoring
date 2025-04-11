import type React from "react"
import { CardElement } from "@stripe/react-stripe-js"
import "./card-element.css"

interface CardElementProps {
  label?: string
  options?: any
  hint?: React.ReactNode
}

const cardElementOptions = {
  style: {
    base: {
      color: "#374151", // var(--gray-700)
      fontFamily: '"Inter", -apple-system, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#9ca3af", // var(--gray-400)
      },
      padding: "16px",
    },
    invalid: {
      color: "#ef4444", // var(--danger)
      iconColor: "#ef4444", // var(--danger)
    },
  },
  hidePostalCode: true,
}

const StripeCardElement: React.FC<CardElementProps> = ({ label, options = cardElementOptions, hint }) => {
  return (
    <div className="form-group">
      {label && <label htmlFor="card-element">{label}</label>}
      <div id="card-element" className="stripe-card-element">
        <CardElement options={options} />
      </div>
      {hint && <div className="card-hint">{hint}</div>}
    </div>
  )
}

export default StripeCardElement
