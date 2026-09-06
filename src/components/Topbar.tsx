import { TreeStructureIcon } from '@phosphor-icons/react'
import { Heading } from './Heading'

type TopbarProps = { title?: string }

/** Stały pasek aplikacji obecny na każdym widoku. */
export const Topbar = ({
  title = 'Pathdrasil',
}: TopbarProps): React.JSX.Element => (
  <header
    className="flex min-h-12 items-center justify-between gap-4 pb-2"
    aria-label="Nawigacja aplikacji"
  >
    <div className="flex min-w-0 items-center gap-3">
      <span
        className="text-brand bg-brand/10 grid size-8 shrink-0 place-items-center rounded-lg"
        aria-hidden="true"
      >
        <TreeStructureIcon size={20} weight="bold" />
      </span>
      <Heading as="h1" level="h4" className="truncate">
        {title}
      </Heading>
    </div>
  </header>
)
