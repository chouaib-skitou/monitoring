import type React from "react"
import type { InputHTMLAttributes } from "react"
import "./input.css"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: React.ReactNode
  error?: string
}

const Input: React.FC<InputProps> = ({ label, icon, error, id, className = "", ...props }) => {
  return (
    <div className={`form-group ${error ? "has-error" : ""} ${className}`}>
      {label && <label htmlFor={id}>{label}</label>}
      <div className={`input-wrapper ${icon ? "input-with-icon" : ""}`}>
        {icon && <div className="input-icon">{icon}</div>}
        <input id={id} {...props} />
      </div>
      {error && <div className="input-error">{error}</div>}
    </div>
  )
}

export default Input
