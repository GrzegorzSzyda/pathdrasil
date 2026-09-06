import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'

type FormFieldProps = {
  id: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
}

export const FormField = ({
  id,
  label,
  hint,
  error,
  required,
  children,
}: FormFieldProps): React.JSX.Element => {
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`

  return (
    <div className="grid gap-2">
      <label className="text-heading text-sm font-semibold" htmlFor={id}>
        {label} {required && <span className="text-brand">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-muted text-sm" id={descriptionId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="text-danger text-sm" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export const fieldClassName = (hasError = false): string =>
  cn(
    'border-border bg-page-deep text-heading placeholder:text-muted min-h-12 w-full rounded-xl border px-4 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20',
    hasError && 'border-danger focus:border-danger focus:ring-danger/20',
  )

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean
}

export const TextInput = ({
  className,
  hasError,
  ...props
}: TextInputProps): React.JSX.Element => (
  <input className={cn(fieldClassName(hasError), className)} {...props} />
)
