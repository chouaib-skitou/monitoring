import type React from "react"
import "./progress-steps.css"

interface Step {
  number: number
  text: string
}

interface ProgressStepsProps {
  steps: Step[]
  currentStep: number
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ steps, currentStep }) => {
  return (
    <div className="progress-steps">
      {steps.map((step) => (
        <div
          key={step.number}
          className={`step ${currentStep === step.number ? "active" : currentStep > step.number ? "completed" : ""}`}
        >
          <div className="step-number">{step.number}</div>
          <div className="step-text">{step.text}</div>
        </div>
      ))}
    </div>
  )
}

export default ProgressSteps
