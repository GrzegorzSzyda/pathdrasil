import type { ReactNode } from 'react'

type FieldValidationProps = {
  id: string
  hint?: string
  error?: string
  children?: ReactNode
}

export const FieldValidation = ({
  id,
  hint,
  error,
  children,
}: FieldValidationProps): React.JSX.Element | null => {
  if (error)
    return (
      <p className="text-danger text-sm" id={`${id}-error`} role="alert">
        {error}
      </p>
    )
  if (hint)
    return (
      <p className="text-muted text-sm" id={`${id}-description`}>
        {hint}
      </p>
    )
  return children ? <>{children}</> : null
}
