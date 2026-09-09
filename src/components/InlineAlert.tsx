import type { ReactNode } from 'react'
import {
  InfoIcon,
  WarningCircleIcon,
  CheckCircleIcon,
} from '@phosphor-icons/react'
import { cn } from '../lib/cn'

type InlineAlertProps = {
  tone?: 'info' | 'warning' | 'success' | 'danger'
  children: ReactNode
}

export const InlineAlert = ({
  tone = 'info',
  children,
}: InlineAlertProps): React.JSX.Element => {
  const Icon =
    tone === 'danger' || tone === 'warning'
      ? WarningCircleIcon
      : tone === 'success'
        ? CheckCircleIcon
        : InfoIcon
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4 text-sm',
        tone === 'info' && 'border-border bg-surface/50 text-muted',
        tone === 'warning' &&
          'border-amber-400/30 bg-amber-400/10 text-amber-200',
        tone === 'success' && 'border-brand/30 bg-brand/10 text-brand-soft',
        tone === 'danger' && 'border-danger/30 bg-danger/10 text-red-200',
      )}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      <Icon
        className="mt-0.5 shrink-0"
        size={18}
        weight="bold"
        aria-hidden="true"
      />
      <div>{children}</div>
    </div>
  )
}
