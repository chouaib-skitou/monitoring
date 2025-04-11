"use client"

import type React from "react"
import { useState } from "react"
import "./credit-card.css"

interface CreditCardProps {
  number: string
  expiry: string
  cvc: string
  bankName: string
  icon: React.ReactNode
  color: string
  isSelected?: boolean
  onClick?: () => void
}

const CreditCard: React.FC<CreditCardProps> = ({
  number,
  expiry,
  cvc,
  bankName,
  icon,
  color,
  isSelected = false,
  onClick,
}) => {
  const [isFlipped, setIsFlipped] = useState(false)

  const toggleFlip = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFlipped(!isFlipped)
  }

  return (
    <div className={`credit-card-container ${isSelected ? "selected" : ""}`} onClick={onClick}>
      <div className={`credit-card ${isFlipped ? "flipped" : ""}`} onClick={toggleFlip}>
        <div className="credit-card-inner">
          <div className="credit-card-front">
            <div className="card-background" style={{ background: color }}></div>
            <div className="card-chip">
              <svg width="50" height="40" viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="5" width="40" height="30" rx="3" fill="#FFD700" stroke="#CDA000" strokeWidth="1" />
                <rect x="10" y="15" width="30" height="10" fill="#CDA000" />
                <rect x="20" y="5" width="10" height="30" fill="#CDA000" />
              </svg>
            </div>
            <div className="card-contactless">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM8.46 14.45L7.1 13.83C7.9 11.94 9.83 10.5 12 10.5C14.17 10.5 16.1 11.94 16.9 13.83L15.54 14.45C14.9 13.08 13.54 12.15 12 12.15C10.46 12.15 9.1 13.08 8.46 14.45ZM5.84 12.05L4.47 11.43C5.99 8.83 8.77 7 12 7C15.23 7 18.01 8.83 19.53 11.43L18.16 12.05C16.9 9.9 14.62 8.5 12 8.5C9.38 8.5 7.1 9.9 5.84 12.05ZM12 15.5C11.38 15.5 10.77 15.67 10.25 15.97C9.72 16.27 9.28 16.7 8.97 17.22C8.67 17.74 8.5 18.35 8.5 18.97C8.5 19.59 8.67 20.2 8.97 20.72C9.28 21.24 9.72 21.67 10.25 21.97C10.77 22.27 11.38 22.44 12 22.44C12.62 22.44 13.23 22.27 13.75 21.97C14.28 21.67 14.72 21.24 15.03 20.72C15.33 20.2 15.5 19.59 15.5 18.97C15.5 18.35 15.33 17.74 15.03 17.22C14.72 16.7 14.28 16.27 13.75 15.97C13.23 15.67 12.62 15.5 12 15.5Z"
                  fill="#fff"
                  fillOpacity="0.8"
                />
              </svg>
            </div>
            <div className="card-brand">{icon}</div>
            <div className="card-number-display">{number}</div>
            <div className="card-details">
              <div className="card-holder">TEST USER</div>
              <div className="card-expiry-display">
                <span>VALID THRU</span>
                <span>{expiry}</span>
              </div>
            </div>
            <div className="card-issuer">{bankName}</div>
            <div className="card-flip-hint">Click to see back</div>
          </div>
          <div className="credit-card-back">
            <div className="card-background" style={{ background: color }}></div>
            <div className="card-magnetic-stripe"></div>
            <div className="card-signature-panel">
              <div className="signature">TEST USER</div>
              <div className="cvc">{cvc}</div>
            </div>
            <div className="card-back-text">
              This card is issued by {bankName} pursuant to license by Visa/Mastercard/Amex. Use of this card is subject
              to the agreement.
            </div>
            <div className="card-flip-hint">Click to see front</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreditCard
