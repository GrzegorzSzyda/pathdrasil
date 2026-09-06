import type { KeyboardEvent, ReactNode } from 'react'
import { useRef } from 'react'
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
}: ProviderPickerProps): React.JSX.Element => {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const focusAvailable = (startIndex: number, direction: 1 | -1): void => {
    let index = startIndex
    for (let attempt = 0; attempt < options.length; attempt += 1) {
      index = (index + direction + options.length) % options.length
      if (options[index].available !== false) {
        buttonRefs.current[index]?.focus()
        return
      }
    }
  }
  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.stopPropagation()
      onChange(options[index].id)
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault()
      focusAvailable(index, 1)
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault()
      focusAvailable(index, -1)
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      const available = options
        .map((option, optionIndex) =>
          option.available !== false ? optionIndex : -1,
        )
        .filter((optionIndex) => optionIndex >= 0)
      const targetIndex =
        event.key === 'Home' ? available[0] : available[available.length - 1]
      if (targetIndex !== undefined) buttonRefs.current[targetIndex]?.focus()
    }
  }

  return (
    <div className="grid gap-3" role="group" aria-label={label}>
      {options.map((option, index) => {
        const available = option.available !== false
        const selected = value === option.id
        return (
          <button
            key={option.id}
            ref={(element) => {
              buttonRefs.current[index] = element
            }}
            type="button"
            disabled={!available}
            aria-pressed={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              'text-muted focus-visible:bg-surface/70 focus-visible:ring-focus relative flex min-h-20 items-center gap-4 rounded-xl border border-transparent bg-transparent px-4 text-left transition focus-visible:ring-2 focus-visible:outline-none',
              available && 'hover:bg-surface/70 hover:text-heading',
              selected && 'bg-brand/10 text-heading',
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
}
