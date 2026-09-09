import type { ReactNode } from 'react'
import { FieldValidation } from './FieldValidation'

type FormFieldProps = {
  id: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  hideLabel?: boolean
  children: ReactNode
}

export const FormField = ({
  id,
  label,
  hint,
  error,
  required,
  hideLabel = false,
  children,
}: FormFieldProps): React.JSX.Element => {
  return (
    <div className="grid gap-2">
      <label
        className={
          hideLabel ? 'sr-only' : 'text-heading text-base font-semibold'
        }
        htmlFor={id}
      >
        {label} {required && <span className="text-brand">*</span>}
      </label>
      {children}
      <FieldValidation id={id} hint={hint} error={error} />
    </div>
  )
}
