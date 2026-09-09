import { useEffect, useRef, type ReactNode } from 'react'
import { XIcon } from '@phosphor-icons/react'
import { cn } from '../lib/cn'
import { Button } from './Button'

type DialogProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  size?: 'default' | 'wide'
}

export const Dialog = ({
  open,
  title,
  onClose,
  children,
  size = 'default',
}: DialogProps): React.JSX.Element | null => {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!open) return
    closeButtonRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])
  if (!open) return null
  return (
    <div
      className="bg-page/80 fixed inset-0 z-50 grid place-items-center p-6 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        ref={dialogRef}
        className={cn(
          'bg-page w-full rounded-2xl border border-[#222c38] p-6 shadow-2xl',
          size === 'wide' ? 'max-w-2xl' : 'max-w-lg',
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-heading text-xl font-semibold" id="dialog-title">
            {title}
          </h2>
          <Button
            ref={closeButtonRef}
            type="button"
            appearance="ghost"
            size="icon"
            aria-label="Zamknij"
            onClick={onClose}
          >
            <XIcon aria-hidden="true" />
          </Button>
        </div>
        {children}
      </section>
    </div>
  )
}
