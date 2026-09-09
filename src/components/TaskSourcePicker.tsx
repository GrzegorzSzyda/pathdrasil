import type { KeyboardEvent } from 'react'
import { useRef } from 'react'
import { CheckIcon, FolderSimpleIcon, LockKeyIcon } from '@phosphor-icons/react'
import type { TaskSource } from '../../shared/api/integrations'
import { cn } from '../lib/cn'

type TaskSourcePickerProps = {
  options: TaskSource[]
  value: string
  onChange: (source: TaskSource) => void
}

export const TaskSourcePicker = ({
  options,
  value,
  onChange,
}: TaskSourcePickerProps): React.JSX.Element => {
  const refs = useRef<Array<HTMLButtonElement | null>>([])
  const move = (index: number, direction: 1 | -1): void => {
    if (options.length === 0) return
    refs.current[(index + direction + options.length) % options.length]?.focus()
  }
  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.stopPropagation()
      onChange(options[index])
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault()
      move(index, 1)
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault()
      move(index, -1)
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      refs.current[event.key === 'Home' ? 0 : options.length - 1]?.focus()
    }
  }

  if (options.length === 0)
    return (
      <p className="text-muted rounded-xl px-4 py-3 text-sm">
        Brak dostępnych projektów dla aktywnego konta.
      </p>
    )

  return (
    <div
      className="grid max-h-80 gap-2 overflow-y-auto pr-1"
      role="group"
      aria-label="Projekt z taskami"
    >
      {options.map((option, index) => {
        const selected = value === option.id
        return (
          <button
            key={option.id}
            ref={(element) => {
              refs.current[index] = element
            }}
            type="button"
            aria-pressed={selected}
            tabIndex={selected || (!value && index === 0) ? 0 : -1}
            onClick={() => onChange(option)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              'text-muted hover:bg-surface/70 hover:text-heading focus-visible:bg-surface/70 focus-visible:ring-focus flex min-h-18 items-center gap-4 rounded-xl border border-transparent px-4 text-left transition focus-visible:ring-2 focus-visible:outline-none',
              selected && 'bg-brand/10 text-heading',
            )}
          >
            <span className="bg-surface text-heading grid size-10 shrink-0 place-items-center rounded-lg">
              <FolderSimpleIcon size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">
                {option.fullName}
              </span>
              {option.description && (
                <span className="text-muted mt-1 block truncate text-sm">
                  {option.description}
                </span>
              )}
            </span>
            {option.private && (
              <LockKeyIcon size={16} aria-label="Projekt prywatny" />
            )}
            {selected && (
              <CheckIcon
                className="text-brand shrink-0"
                size={20}
                weight="bold"
                aria-hidden="true"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
