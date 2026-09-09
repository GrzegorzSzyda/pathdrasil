import { CircleNotchIcon } from '@phosphor-icons/react'
import { cn } from '../lib/cn'

type LoadingIndicatorProps = {
  label?: string
  size?: number
  className?: string
}

export const LoadingIndicator = ({
  label = 'Ładowanie…',
  size = 20,
  className,
}: LoadingIndicatorProps): React.JSX.Element => (
  <span className={cn('inline-flex shrink-0', className)} role="status">
    <CircleNotchIcon className="animate-spin" size={size} aria-hidden="true" />
    <span className="sr-only">{label}</span>
  </span>
)
