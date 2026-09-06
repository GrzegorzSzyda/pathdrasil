import type { KeyboardEvent } from 'react'
import { useRef } from 'react'
import { CheckIcon, UserCircleIcon } from '@phosphor-icons/react'
import { cn } from '../lib/cn'

export type AccountOption = { id: string; name: string; description: string }
type AccountPickerProps = {
  options: AccountOption[]
  value: string
  onChange: (id: string) => void
  label: string
}

export const AccountPicker = ({
  options,
  value,
  onChange,
  label,
}: AccountPickerProps): React.JSX.Element => {
  const refs = useRef<Array<HTMLButtonElement | null>>([])
  const move = (index: number, direction: 1 | -1): void => {
    if (options.length === 0) return
    refs.current[(index + direction + options.length) % options.length]?.focus()
  }
  const onKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.stopPropagation()
      onChange(options[index].id)
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
  return (
    <div className="grid gap-3" role="group" aria-label={label}>
      {options.length === 0 ? (
        <p className="text-muted rounded-xl px-4 py-3 text-sm">
          Brak wykrytych kont. Profile zostaną pobrane po podłączeniu
          autoryzacji CLI.
        </p>
      ) : (
        options.map((option, index) => {
          const selected = value === option.id
          return (
            <button
              key={option.id}
              ref={(element) => {
                refs.current[index] = element
              }}
              type="button"
              aria-pressed={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(option.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                'text-muted hover:bg-surface/70 hover:text-heading focus-visible:bg-surface/70 focus-visible:ring-focus relative flex min-h-20 items-center gap-4 rounded-xl border border-transparent bg-transparent px-4 text-left transition focus-visible:ring-2 focus-visible:outline-none',
                selected && 'bg-brand/10 text-heading',
              )}
            >
              <span className="bg-surface text-heading grid size-11 shrink-0 place-items-center rounded-lg">
                <UserCircleIcon size={24} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{option.name}</span>
                <span className="text-muted mt-1 block text-sm">
                  {option.description}
                </span>
              </span>
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
        })
      )}
    </div>
  )
}
