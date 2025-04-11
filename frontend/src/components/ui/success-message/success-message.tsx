"use client"

import type React from "react"
import Button from "../button/button"
import "./success-message.css"

interface SuccessMessageProps {
  amount: string
  name: string
  email: string
  onReset: () => void
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ amount, name, email, onReset }) => {
  return (
    <div className="success-container">
      <div className="success-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
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
      <Button variant="success" onClick={onReset} className="reset-button">
        Make Another Payment
      </Button>
    </div>
  )
}

export default SuccessMessage
