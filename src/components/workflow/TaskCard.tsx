import type { Ref } from 'react'
import type { TaskSummary } from '../../../shared/api/tasks'
import { cn } from '../../lib/cn'
import {
  formatCompactDate,
  formatDate,
  providerName,
} from './workflow-formatters'
import { handleTaskCardKeyDown } from './workflow-keyboard'

type TaskCardProps = {
  task: TaskSummary
  buttonRef?: Ref<HTMLButtonElement>
  tabIndex?: number
  selected?: boolean
  onClick?: (button: HTMLButtonElement) => void
  onNavigate?: (offset: number) => void
  onSetFirst?: () => void
  onSetLast?: () => void
}

const cardClassName =
  'block min-h-[78px] w-full overflow-hidden rounded-lg border-0 bg-[#1d2430] px-[15px] py-3 text-left text-[#aab4c3]'

export const TaskCard = ({
  task,
  buttonRef,
  tabIndex,
  selected = false,
  onClick,
  onNavigate,
  onSetFirst,
  onSetLast,
}: TaskCardProps): React.JSX.Element => {
  const labels = task.labels.slice(0, 1)
  const remainingLabels = task.labels.length - labels.length
  const content = (
    <>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 font-['IBM_Plex_Mono'] text-[9px] leading-none font-semibold tracking-[0.03em] text-[#586476]">
        <span className="truncate">
          {providerName(task.provider)} · #{task.externalId}
        </span>
        {labels.length > 0 && (
          <span className="flex min-w-0 items-center gap-[3px]">
            {labels.map((label) => (
              <span
                key={label}
                className="max-w-[72px] truncate rounded bg-[#242b36] px-1.5 py-1 text-[8px] leading-none text-[#717d8e] uppercase"
              >
                {label}
              </span>
            ))}
            {remainingLabels > 0 && <span>+{remainingLabels}</span>}
          </span>
        )}
        <time
          className="truncate text-right"
          dateTime={task.updatedAt}
          title={formatDate(task.updatedAt)}
        >
          {formatCompactDate(task.updatedAt)}
        </time>
      </div>
      <strong className="mt-[9px] block truncate text-[13px] leading-[1.35] font-bold tracking-[-0.012em] text-[#c5ceda]">
        {task.title}
      </strong>
      <span className="mt-1 block truncate font-['IBM_Plex_Mono'] text-[9px] leading-[1.2] font-semibold text-[#667287]">
        {task.repository}
      </span>
    </>
  )

  if (!onClick) return <article className={cardClassName}>{content}</article>

  return (
    <button
      ref={buttonRef}
      data-workflow-task
      type="button"
      tabIndex={tabIndex}
      aria-expanded={selected}
      aria-controls={selected ? 'task-preview' : undefined}
      className={cn(
        cardClassName,
        'cursor-pointer transition-[background,transform] duration-[140ms] hover:bg-[#232c3a] focus-visible:bg-[#273140] focus-visible:shadow-[inset_3px_0_0_#c5ceda,0_0_0_2px_#758399] focus-visible:outline-0 active:scale-[0.99] motion-reduce:transition-none',
        selected &&
          'bg-[#273140] shadow-[inset_3px_0_0_#c5ceda,0_0_0_2px_#758399]',
      )}
      onClick={(event) => onClick(event.currentTarget)}
      onKeyDown={(event) =>
        handleTaskCardKeyDown(event, {
          onNavigate,
          onSetFirst,
          onSetLast,
        })
      }
    >
      {content}
    </button>
  )
}
