import { useState, type Ref } from 'react'
import type { TaskSummary } from '../../../shared/api/tasks'
import { cn } from '../../lib/cn'
import { TaskCard } from './TaskCard'
import { TaskPreview } from './TaskPreview'
import type { WorkflowColumnConfig } from './workflow-config'

type WorkflowColumnProps = {
  column: WorkflowColumnConfig
  tasks: TaskSummary[]
  selectedTask: TaskSummary | null
  activeIndex: number
  cardRef: (index: number) => Ref<HTMLButtonElement>
  previewHeadingRef: React.RefObject<HTMLHeadingElement | null>
  onSelectTask: (task: TaskSummary, button: HTMLButtonElement) => void
  onFocusCard: (index: number) => void
  onClosePreview: () => void
  dimmed: boolean
  projectId: string
  onTaskPublished: () => void | Promise<void>
}

export const WorkflowColumn = ({
  column,
  tasks,
  selectedTask,
  activeIndex,
  cardRef,
  previewHeadingRef,
  onSelectTask,
  onFocusCard,
  onClosePreview,
  dimmed,
  projectId,
  onTaskPublished,
}: WorkflowColumnProps): React.JSX.Element => {
  const [conversationOpen, setConversationOpen] = useState(false)
  const taskOpen = column.id === 'todo' && selectedTask !== null
  const Icon = column.icon

  return (
    <section
      aria-labelledby={`workflow-column-${column.id}`}
      className={cn(
        'relative z-[1] flex flex-col bg-[#171c24] transition-[flex-basis,min-width,opacity,filter,box-shadow] duration-[320ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none',
        column.id === 'todo'
          ? 'min-w-[360px] flex-[0_0_360px]'
          : 'min-w-[180px] flex-[1_1_20%]',
        dimmed && 'basis-[14%] opacity-[0.48] saturate-[0.45]',
        taskOpen &&
          (conversationOpen
            ? 'z-[3] min-w-[1440px] flex-[0_0_1440px] bg-[#181e27] shadow-[-18px_0_38px_#0d1117c2,18px_0_38px_#0d1117c2]'
            : 'z-[3] min-w-[920px] flex-[0_0_920px] bg-[#181e27] shadow-[-18px_0_38px_#0d1117c2,18px_0_38px_#0d1117c2]'),
      )}
    >
      <header className="relative flex h-14 flex-[0_0_56px] items-center gap-2 overflow-hidden px-5 py-3 max-[760px]:h-[52px] max-[760px]:flex-[0_0_52px] max-[760px]:px-3.5 max-[760px]:py-2.5">
        <h3
          id={`workflow-column-${column.id}`}
          className="flex min-w-0 items-center gap-[9px] overflow-hidden text-[clamp(14px,1.25vw,18px)] leading-[1.05] font-bold tracking-[-0.035em] whitespace-nowrap text-[#c5ceda]"
        >
          <Icon className="shrink-0 text-[#667287]" size={16} />
          <span className="truncate">{column.title}</span>
          <span className="text-xs font-semibold text-[#586476]">
            {tasks.length}
          </span>
        </h3>
        {!column.interactive && (
          <span className="absolute bottom-[3px] left-5 font-['IBM_Plex_Mono'] text-[8px] leading-none font-semibold tracking-[0.06em] text-[#586476] uppercase max-[760px]:left-3.5">
            Tylko podgląd
          </span>
        )}
      </header>
      <ul
        className={cn(
          'm-0 min-h-0 [scrollbar-width:thin] [scrollbar-color:#334155_transparent] list-none overflow-y-auto p-3 [&>li]:mb-2.5',
          column.id === 'todo' ? 'w-[360px] flex-1' : 'w-full flex-1',
        )}
        aria-label={`Taski: ${column.title}`}
      >
        {tasks.map((task, index) => (
          <li key={task.id}>
            {column.interactive ? (
              <TaskCard
                task={task}
                buttonRef={cardRef(index)}
                tabIndex={
                  index === Math.min(activeIndex, tasks.length - 1) ? 0 : -1
                }
                selected={task.id === selectedTask?.id}
                onClick={(button) => {
                  setConversationOpen(false)
                  onSelectTask(task, button)
                }}
                onNavigate={(offset) => onFocusCard(index + offset)}
                onSetFirst={() => onFocusCard(0)}
                onSetLast={() => onFocusCard(tasks.length - 1)}
              />
            ) : (
              <TaskCard task={task} />
            )}
          </li>
        ))}
      </ul>
      {tasks.length === 0 && (
        <p
          className={cn(
            'm-3 grid min-h-[72px] place-items-center rounded-lg bg-[#191f28] text-[11px] text-[#4d596b]',
            column.id === 'todo' ? 'w-[336px]' : 'w-full',
          )}
        >
          Brak tasków na tym etapie
        </p>
      )}
      {taskOpen && (
        <TaskPreview
          task={selectedTask}
          headingRef={previewHeadingRef}
          onClose={() => {
            setConversationOpen(false)
            onClosePreview()
          }}
          projectId={projectId}
          conversationOpen={conversationOpen}
          onOpenConversation={() => setConversationOpen(true)}
          onCloseConversation={() => setConversationOpen(false)}
          onTaskPublished={onTaskPublished}
        />
      )}
    </section>
  )
}
