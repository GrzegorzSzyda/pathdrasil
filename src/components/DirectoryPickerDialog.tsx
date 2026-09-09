import { useEffect, useRef } from 'react'
import {
  CaretLeftIcon,
  CaretRightIcon,
  FolderSimpleIcon,
  HouseLineIcon,
} from '@phosphor-icons/react'
import type { DirectoryListing } from '../../shared/api/repositories'
import { Button } from './Button'
import { Dialog } from './Dialog'
import { InlineAlert } from './InlineAlert'

type DirectoryPickerDialogProps = {
  open: boolean
  mode: 'repository' | 'worktree'
  listing: DirectoryListing | null
  loading: boolean
  error: string
  onClose: () => void
  onNavigate: (path: string) => void
  onSelect: (path: string) => void
}

export const DirectoryPickerDialog = ({
  open,
  mode,
  listing,
  loading,
  error,
  onClose,
  onNavigate,
  onSelect,
}: DirectoryPickerDialogProps): React.JSX.Element => (
  <DirectoryPickerContent
    open={open}
    mode={mode}
    listing={listing}
    loading={loading}
    error={error}
    onClose={onClose}
    onNavigate={onNavigate}
    onSelect={onSelect}
  />
)

const DirectoryPickerContent = ({
  open,
  mode,
  listing,
  loading,
  error,
  onClose,
  onNavigate,
  onSelect,
}: DirectoryPickerDialogProps): React.JSX.Element => {
  const folderRefs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    if (!open || loading || !listing) return
    const frame = requestAnimationFrame(() => folderRefs.current[0]?.focus())
    return () => cancelAnimationFrame(frame)
  }, [listing, loading, open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (!listing) return
      if (event.key === 'Backspace' && listing.parent) {
        event.preventDefault()
        onNavigate(listing.parent)
      } else if (
        event.key === 'h' &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        listing.roots[0]
      ) {
        event.preventDefault()
        onNavigate(listing.roots[0])
      } else if (event.key === 'Enter' && event.ctrlKey && !loading) {
        event.preventDefault()
        onSelect(listing.path)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [listing, loading, onNavigate, onSelect, open])

  const moveFolder = (index: number, direction: 1 | -1): void => {
    if (listing === null || listing.entries.length === 0) return
    const nextIndex =
      (index + direction + listing.entries.length) % listing.entries.length
    folderRefs.current[nextIndex]?.focus()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={
        mode === 'repository'
          ? 'Wybierz repozytorium lokalne'
          : 'Wybierz katalog dla worktree'
      }
      size="wide"
    >
      <p className="text-muted mb-5 text-sm leading-relaxed">
        {mode === 'repository'
          ? 'Wskaż główny katalog istniejącego repozytorium Git. Pathdrasil sprawdzi jego remote i uprawnienia.'
          : 'Wskaż katalog nadrzędny, w którym Pathdrasil będzie tworzył osobne worktree dla tasków i agentów.'}
      </p>
      {error && (
        <div className="mb-4">
          <InlineAlert tone="danger">{error}</InlineAlert>
        </div>
      )}
      {listing && (
        <>
          <div className="mb-3 flex flex-wrap gap-2">
            {listing.parent && (
              <Button
                type="button"
                appearance="ghost"
                size="icon"
                aria-label="Przejdź poziom wyżej"
                onClick={() => onNavigate(listing.parent!)}
              >
                <CaretLeftIcon aria-hidden="true" />
              </Button>
            )}
            {listing.roots.map((root) => (
              <Button
                key={root}
                type="button"
                appearance="ghost"
                size="icon"
                aria-label="Home"
                onClick={() => onNavigate(root)}
              >
                <HouseLineIcon aria-hidden="true" />
              </Button>
            ))}
          </div>
          <div className="border-border bg-page-deep max-h-72 overflow-y-auto rounded-xl border p-2">
            <div className="text-muted px-2 pb-2 text-sm">
              <code className="break-all">{listing.path}</code>
            </div>
            {loading && (
              <p className="text-muted px-3 py-4 text-sm">
                Odczytywanie katalogu…
              </p>
            )}
            {!loading && listing.entries.length === 0 && (
              <p className="text-muted px-3 py-6 text-center text-sm">
                Ten katalog nie zawiera podkatalogów.
              </p>
            )}
            {!loading &&
              listing.entries.map((entry, index) => (
                <button
                  key={entry.path}
                  ref={(element) => {
                    folderRefs.current[index] = element
                  }}
                  type="button"
                  tabIndex={index === 0 ? 0 : -1}
                  className="text-muted hover:bg-surface hover:text-heading focus:bg-surface focus:text-heading flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition focus:outline-none"
                  onClick={() => onNavigate(entry.path)}
                  onKeyDown={(event) => {
                    if (
                      event.key === 'ArrowDown' ||
                      event.key === 'ArrowRight'
                    ) {
                      event.preventDefault()
                      moveFolder(index, 1)
                    } else if (
                      event.key === 'ArrowUp' ||
                      event.key === 'ArrowLeft'
                    ) {
                      event.preventDefault()
                      moveFolder(index, -1)
                    }
                  }}
                >
                  <FolderSimpleIcon
                    className="text-brand shrink-0"
                    size={20}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 truncate">{entry.name}</span>
                  <CaretRightIcon className="shrink-0" aria-hidden="true" />
                </button>
              ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <Button type="button" appearance="ghost" onClick={onClose}>
              Anuluj
            </Button>
            <Button
              type="button"
              disabled={loading}
              onClick={() => onSelect(listing.path)}
            >
              Wybierz bieżący katalog
            </Button>
          </div>
        </>
      )}
      {!listing && !error && (
        <p className="text-muted py-8 text-center text-sm">
          Odczytywanie katalogów…
        </p>
      )}
    </Dialog>
  )
}
