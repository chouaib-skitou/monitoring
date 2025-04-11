"use client"

import type React from "react"
import CreditCard from "../credit-card/credit-card"
import "./test-card.css"

export interface TestCardData {
  type: "success" | "declined" | "insufficient"
  title: string
  number: string
  expiry: string
  cvc: string
  icon: React.ReactNode
  description: string
  color: string
  bankName: string
}

interface TestCardProps {
  card: TestCardData
  isSelected: boolean
  onSelect: () => void
}

const TestCard: React.FC<TestCardProps> = ({ card, isSelected, onSelect }) => {
  return (
    <div className={`test-card ${card.type} ${isSelected ? "selected" : ""}`} onClick={onSelect}>
      <CreditCard
        number={card.number}
        expiry={card.expiry}
        cvc={card.cvc}
        bankName={card.bankName}
        icon={card.icon}
        color={card.color}
        isSelected={isSelected}
      />
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
  )
}

export default TestCard
