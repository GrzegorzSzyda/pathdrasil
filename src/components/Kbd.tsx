import type { HTMLAttributes } from 'react'
import { cn } from '../lib/cn'

export const Kbd = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement>): React.JSX.Element => (
  <kbd
    className={cn(
      'border-border bg-page-deep text-muted inline-flex min-w-6 items-center justify-center rounded-md border px-1.5 py-0.5 font-mono text-xs font-semibold shadow-sm',
      className,
    )}
    {...props}
  >
    {children}
  </kbd>
)
