import type { InputHTMLAttributes } from 'react'
import { cn } from '../lib/cn'

export const inputClassName = (hasError = false): string =>
  cn(
    'border-border bg-page-deep text-heading placeholder:text-muted min-h-12 w-full rounded-xl border px-4 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20',
    hasError && 'border-danger focus:border-danger focus:ring-danger/20',
  )

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean
}

export const Input = ({
  className,
  hasError,
  ...props
}: InputProps): React.JSX.Element => (
  <input className={cn(inputClassName(hasError), className)} {...props} />
)
