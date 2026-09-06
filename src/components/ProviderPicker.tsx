import type { ReactNode } from 'react'
import { CheckIcon, LockKeyIcon } from '@phosphor-icons/react'
import { cn } from '../lib/cn'

export type ProviderOption = {
  id: string
  name: string
  description: string
  available?: boolean
  badge?: string
  icon: ReactNode
}

type ProviderPickerProps = {
  options: ProviderOption[]
  value: string
  onChange: (id: string) => void
  label: string
}

export const ProviderPicker = ({
  options,
  value,
  onChange,
  label,
}: ProviderPickerProps): React.JSX.Element => (
  <div className="grid gap-3" role="group" aria-label={label}>
    {options.map((option) => {
      const available = option.available !== false
      const selected = value === option.id
      return (
        <button
          key={option.id}
          type="button"
          disabled={!available}
          aria-pressed={selected}
          onClick={() => onChange(option.id)}
          className={cn(
            'border-border bg-page-deep text-muted relative flex min-h-20 items-center gap-4 rounded-xl border px-4 text-left transition',
            available && 'hover:border-brand/60 hover:bg-surface/70',
            selected &&
              'border-brand bg-brand/10 text-heading ring-brand/30 ring-1',
            !available && 'cursor-not-allowed opacity-60',
          )}
        >
          <span className="bg-surface text-heading grid size-11 shrink-0 place-items-center rounded-lg">
            {option.icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 font-semibold">
              {option.name}
              {option.badge && (
                <span className="text-muted bg-surface rounded px-2 py-0.5 text-xs font-normal">
                  {option.badge}
                </span>
              )}
            </span>
            <span className="text-muted mt-1 block text-sm">
              {option.description}
            </span>
          </span>
          {selected && available && (
            <CheckIcon
              className="text-brand shrink-0"
              size={20}
              weight="bold"
              aria-hidden="true"
            />
          )}
          {!available && (
            <LockKeyIcon
              className="text-muted shrink-0"
              size={18}
              aria-hidden="true"
            />
          )}
        </button>
      )
    })}
  </div>
)
