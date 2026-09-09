import {
  CaretRightIcon,
  FolderOpenIcon,
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
        <div className="border-border bg-page-deep mb-4 flex items-start gap-3 rounded-xl border p-4">
          <FolderOpenIcon
            className="text-brand mt-0.5 shrink-0"
            size={20}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <span className="text-muted block text-xs font-semibold tracking-wide uppercase">
              Bieżący katalog
            </span>
            <code className="text-heading mt-1 block text-sm break-all">
              {listing.path}
            </code>
          </div>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          {listing.roots.map((root) => (
            <Button
              key={root}
              type="button"
              appearance="ghost"
              onClick={() => onNavigate(root)}
            >
              <HouseLineIcon aria-hidden="true" /> {root}
            </Button>
          ))}
          {listing.parent && (
            <Button
              type="button"
              appearance="ghost"
              onClick={() => onNavigate(listing.parent!)}
            >
              ← Poziom wyżej
            </Button>
          )}
        </div>
        <div className="border-border bg-page-deep max-h-72 overflow-y-auto rounded-xl border p-2">
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
            listing.entries.map((entry) => (
              <button
                key={entry.path}
                type="button"
                className="text-muted hover:bg-surface hover:text-heading focus-visible:ring-focus flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition focus-visible:ring-2 focus-visible:outline-none"
                onClick={() => onNavigate(entry.path)}
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
        <div className="border-border mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
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
