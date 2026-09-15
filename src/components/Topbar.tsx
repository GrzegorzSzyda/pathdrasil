import {
  CaretDownIcon,
  CodeIcon,
  KanbanIcon,
  SquaresFourIcon,
  TreeStructureIcon,
} from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'

type TopbarProps = {
  title?: string
  actions?: React.ReactNode
  project?: {
    id: string
    name: string
    activeView: 'dashboard' | 'workflow'
  }
}

/** Stały pasek aplikacji obecny na każdym widoku. */
export const Topbar = ({
  title = 'Pathdrasil',
  actions,
  project,
}: TopbarProps): React.JSX.Element => {
  const navigate = useNavigate()

  return (
    <header
      className={`flex items-center justify-between gap-4 ${project ? 'h-full min-h-12' : 'min-h-12 pb-2'}`}
      aria-label="Nawigacja aplikacji"
    >
      <div className="flex min-w-0 items-center gap-3">
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
            {project ? (
              <KanbanIcon size={18} />
            ) : (
              <TreeStructureIcon size={20} weight="bold" />
            )}
          </span>
          <span
            className={`text-heading truncate leading-snug font-semibold tracking-tight ${project ? 'text-sm' : 'text-xl'}`}
          >
            {title}
          </span>
        </button>
        {project && (
          <>
            <span className="bg-border h-6 w-px" aria-hidden="true" />
            <button
              type="button"
              className="text-muted hover:bg-page-deep hover:text-heading flex max-w-52 items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-semibold"
              onClick={() => navigate('/')}
              aria-label="Wybierz projekt"
            >
              <CodeIcon className="shrink-0 text-[#738096]" size={18} />
              <span className="truncate">{project.name}</span>
              <CaretDownIcon className="shrink-0" size={14} />
            </button>
          </>
        )}
      </div>
      {(project || actions) && (
        <div className="flex items-center gap-3">
          {actions}
          {project && (
            <nav
              className="flex rounded-[9px] bg-[#141922] p-1"
              aria-label="Widoki projektu"
            >
              {[
                {
                  id: 'dashboard' as const,
                  label: 'Dashboard',
                  shortcut: 'D',
                  icon: <SquaresFourIcon aria-hidden="true" size={17} />,
                  path: `/projects/${encodeURIComponent(project.id)}`,
                },
                {
                  id: 'workflow' as const,
                  label: 'Workflow',
                  shortcut: 'W',
                  icon: <KanbanIcon aria-hidden="true" size={17} />,
                  path: `/projects/${encodeURIComponent(project.id)}/workflow`,
                },
              ].map((view) => {
                const active = project.activeView === view.id
                return (
                  <button
                    key={view.id}
                    type="button"
                    aria-current={active ? 'page' : undefined}
                    className={`focus-visible:ring-focus flex min-h-[30px] items-center gap-2 rounded-md px-2.5 text-[10px] font-semibold focus-visible:ring-2 focus-visible:outline-none ${
                      active
                        ? 'bg-[#27313e] text-[#d4dbe4]'
                        : 'text-[#647084] hover:text-[#bac4d0]'
                    }`}
                    onClick={() => navigate(view.path)}
                  >
                    {view.icon}
                    <span>{view.label}</span>
                    <kbd className="min-w-[18px] rounded bg-[#343e4c] px-1 py-0.5 font-mono text-[9px] opacity-70">
                      {view.shortcut}
                    </kbd>
                  </button>
                )
              })}
            </nav>
          )}
        </div>
      )}
    </header>
  )
}
