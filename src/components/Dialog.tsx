import { useEffect, useRef, type ReactNode } from 'react'
import { XIcon } from '@phosphor-icons/react'
import { Button } from './Button'

type DialogProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export const Dialog = ({
  open,
  title,
  onClose,
  children,
}: DialogProps): React.JSX.Element | null => {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    closeButtonRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
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
        className="border-border bg-page w-full max-w-lg rounded-2xl border p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
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
