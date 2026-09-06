import { QuestionIcon, TreeStructureIcon } from '@phosphor-icons/react'
import { Button } from './Button'
import { Heading } from './Heading'

type TopbarProps = {
  title?: string
  onToggleShortcuts?: () => void
  shortcutsVisible?: boolean
}

/** Stały pasek aplikacji obecny na każdym widoku. */
export const Topbar = ({
  title = 'Pathdrasil',
  onToggleShortcuts,
  shortcutsVisible = false,
}: TopbarProps): React.JSX.Element => (
  <header
    className="border-border/50 flex min-h-16 items-center justify-between gap-4 border-b pb-4"
    aria-label="Nawigacja aplikacji"
  >
    <div className="flex min-w-0 items-center gap-3">
      <span
        className="text-brand bg-brand/10 grid size-10 shrink-0 place-items-center rounded-xl"
        aria-hidden="true"
      >
        <TreeStructureIcon size={24} weight="bold" />
      </span>
      <Heading as="h1" level="h4" className="truncate">
        {title}
      </Heading>
    </div>
    {onToggleShortcuts && (
      <Button
        type="button"
        appearance="ghost"
        aria-pressed={shortcutsVisible}
        aria-label="Pokaż skróty klawiaturowe"
        onClick={onToggleShortcuts}
      >
        <QuestionIcon aria-hidden="true" />
        <span className="hidden sm:inline">Skróty</span>
      </Button>
    )}
  </header>
)
