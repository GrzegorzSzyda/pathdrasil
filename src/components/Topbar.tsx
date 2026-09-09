import { TreeStructureIcon } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'

type TopbarProps = { title?: string }

/** Stały pasek aplikacji obecny na każdym widoku. */
export const Topbar = ({
  title = 'Pathdrasil',
}: TopbarProps): React.JSX.Element => {
  const navigate = useNavigate()

  return (
    <header
      className="flex min-h-12 items-center justify-between gap-4 pb-2"
      aria-label="Nawigacja aplikacji"
    >
      <button
        type="button"
        className="inline-flex min-w-0 cursor-pointer items-center gap-3 rounded-lg text-left focus-visible:outline-none"
        aria-label="Wróć do projektów"
        onClick={() => navigate('/')}
      >
        <span
          className="text-brand bg-brand/10 grid size-8 shrink-0 place-items-center rounded-lg"
          aria-hidden="true"
        >
          <TreeStructureIcon size={20} weight="bold" />
        </span>
        <span className="text-heading truncate text-xl leading-snug font-semibold tracking-tight">
          {title}
        </span>
      </button>
    </header>
  )
}
