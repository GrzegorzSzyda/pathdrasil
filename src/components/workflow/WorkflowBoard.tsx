import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CheckIcon,
  ClockIcon,
  EyeIcon,
  ArrowSquareOutIcon,
  PencilSimpleIcon,
  PlayIcon,
  TrayIcon,
  XIcon,
} from '@phosphor-icons/react'
import type { TaskSummary } from '../../../shared/api/tasks'
import './workflow.css'

const workflowColumns = [
  {
    id: 'todo',
    title: 'Do przejrzenia',
    interactive: true,
    icon: <TrayIcon />,
  },
  {
    id: 'refining',
    title: 'Opracowywanie',
    interactive: false,
    icon: <PencilSimpleIcon />,
  },
  {
    id: 'planned',
    title: 'Zaplanowane',
    interactive: false,
    icon: <ClockIcon />,
  },
  {
    id: 'in-progress',
    title: 'W toku',
    interactive: false,
    icon: <PlayIcon />,
  },
  { id: 'review', title: 'Do review', interactive: false, icon: <EyeIcon /> },
  { id: 'done', title: 'Gotowe', interactive: false, icon: <CheckIcon /> },
] as const

type WorkflowBoardProps = {
  tasks: TaskSummary[]
  selectedTaskId: string | null
  onSelectTask: (task: TaskSummary) => void
  onClosePreview: () => void
}

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const providerName = (provider: TaskSummary['provider']) =>
  provider === 'github' ? 'GitHub' : 'GitLab'

const formatDate = (value: string) => dateFormatter.format(new Date(value))

const compactDateFormatter = new Intl.RelativeTimeFormat('pl-PL', {
  numeric: 'auto',
})

const formatCompactDate = (value: string) => {
  const difference = new Date(value).getTime() - Date.now()
  const minutes = Math.round(difference / 60_000)
  if (Math.abs(minutes) < 60)
    return compactDateFormatter.format(minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return compactDateFormatter.format(hours, 'hour')
  const days = Math.round(hours / 24)
  return compactDateFormatter.format(days, 'day')
}

export const WorkflowBoard = ({
  tasks,
  selectedTaskId,
  onSelectTask,
  onClosePreview,
}: WorkflowBoardProps): React.JSX.Element => {
  const [activeIndex, setActiveIndex] = useState(0)
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([])
  const previewHeadingRef = useRef<HTMLHeadingElement>(null)
  const openerRef = useRef<HTMLButtonElement | null>(null)
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null
  const todoTasks = useMemo(
    () => tasks.filter((task) => task.status === 'todo'),
    [tasks],
  )

  useEffect(() => {
    if (selectedTask) previewHeadingRef.current?.focus({ preventScroll: true })
  }, [selectedTask])

  useEffect(() => {
    if (!selectedTaskId) return
    const stillVisible = todoTasks.some((task) => task.id === selectedTaskId)
    if (!stillVisible) onClosePreview()
  }, [onClosePreview, selectedTaskId, todoTasks])

  const focusCard = useCallback(
    (index: number) => {
      if (!todoTasks.length) return
      const nextIndex = Math.max(0, Math.min(todoTasks.length - 1, index))
      setActiveIndex(nextIndex)
      const card = cardRefs.current[nextIndex]
      card?.focus()
      card?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    },
    [todoTasks.length],
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (
        !['ArrowDown', 'ArrowUp'].includes(event.key) ||
        target?.matches('input, textarea, select, [contenteditable="true"]') ||
        target?.closest('[data-workflow-task]') ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        selectedTaskId
      )
        return

      event.preventDefault()
      focusCard(0)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [focusCard, selectedTaskId])

  const selectTask = (task: TaskSummary, button: HTMLButtonElement) => {
    openerRef.current = button
    onSelectTask(task)
  }

  const closePreview = () => {
    onClosePreview()
    requestAnimationFrame(() => openerRef.current?.focus())
  }

  return (
    <div
      role="region"
      className={selectedTask ? 'workflow-board has-task' : 'workflow-board'}
      aria-label="Workflow projektu"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && selectedTaskId) {
          event.preventDefault()
          event.stopPropagation()
          closePreview()
        }
      }}
    >
      <div className="workflow-board-scroll">
        <div className="workflow-columns">
          {workflowColumns.map((column) => {
            const columnTasks =
              column.id === 'todo'
                ? todoTasks
                : tasks.filter((task) => task.status === column.id)
            return (
              <section
                key={column.id}
                aria-labelledby={`workflow-column-${column.id}`}
                className={
                  column.id === 'todo' && selectedTask
                    ? 'workflow-column is-task-open'
                    : 'workflow-column'
                }
              >
                <header className="workflow-column-header">
                  <h3
                    id={`workflow-column-${column.id}`}
                    className="workflow-column-title"
                  >
                    <span aria-hidden="true">{column.icon}</span>
                    <span>{column.title}</span>
                    <span className="workflow-column-count">
                      {columnTasks.length}
                    </span>
                  </h3>
                  {!column.interactive && (
                    <span className="workflow-readonly">Tylko podgląd</span>
                  )}
                </header>
                <ul
                  className="workflow-cards"
                  aria-label={`Taski: ${column.title}`}
                >
                  {columnTasks.map((task, index) => (
                    <li key={task.id}>
                      {column.interactive ? (
                        <TaskCard
                          task={task}
                          buttonRef={(button) => {
                            cardRefs.current[index] = button
                          }}
                          tabIndex={
                            index ===
                            Math.min(
                              activeIndex,
                              Math.max(0, todoTasks.length - 1),
                            )
                              ? 0
                              : -1
                          }
                          selected={task.id === selectedTaskId}
                          onClick={(button) => selectTask(task, button)}
                          onNavigate={(offset) => focusCard(index + offset)}
                          onSetFirst={() => focusCard(0)}
                          onSetLast={() => focusCard(todoTasks.length - 1)}
                        />
                      ) : (
                        <TaskCard task={task} />
                      )}
                    </li>
                  ))}
                </ul>
                {columnTasks.length === 0 && (
                  <p className="workflow-empty">Brak tasków na tym etapie</p>
                )}
                {column.id === 'todo' && selectedTask && (
                  <TaskPreview
                    task={selectedTask}
                    headingRef={previewHeadingRef}
                    onClose={closePreview}
                  />
                )}
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}

type TaskCardProps = {
  task: TaskSummary
  buttonRef?: (button: HTMLButtonElement | null) => void
  tabIndex?: number
  selected?: boolean
  onClick?: (button: HTMLButtonElement) => void
  onNavigate?: (offset: number) => void
  onSetFirst?: () => void
  onSetLast?: () => void
}

const TaskCard = ({
  task,
  buttonRef,
  tabIndex,
  selected,
  onClick,
  onNavigate,
  onSetFirst,
  onSetLast,
}: TaskCardProps): React.JSX.Element => {
  const labels = task.labels.slice(0, 1)
  const remainingLabels = task.labels.length - labels.length
  const content = (
    <>
      <div className="workflow-card-meta">
        <span>
          {providerName(task.provider)} · #{task.externalId}
        </span>
        {labels.length > 0 && (
          <span className="workflow-card-tags">
            {labels.map((label) => (
              <span key={label} className="workflow-card-tag">
                {label}
              </span>
            ))}
            {remainingLabels > 0 && <span>+{remainingLabels}</span>}
          </span>
        )}
        <time dateTime={task.updatedAt} title={formatDate(task.updatedAt)}>
          {formatCompactDate(task.updatedAt)}
        </time>
      </div>
      <strong className="workflow-card-title">{task.title}</strong>
      <span className="workflow-card-repository">{task.repository}</span>
    </>
  )

  if (onClick) {
    return (
      <button
        ref={buttonRef}
        data-workflow-task
        type="button"
        tabIndex={tabIndex}
        aria-expanded={selected}
        aria-controls={selected ? 'task-preview' : undefined}
        className={`workflow-card workflow-card-button${selected ? 'is-selected' : ''}`}
        onClick={(event) => onClick(event.currentTarget)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            onNavigate?.(1)
          } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            onNavigate?.(-1)
          } else if (event.key === 'Home') {
            event.preventDefault()
            onSetFirst?.()
          } else if (event.key === 'End') {
            event.preventDefault()
            onSetLast?.()
          }
        }}
      >
        {content}
      </button>
    )
  }
  return <article className="workflow-card">{content}</article>
}

type TaskPreviewProps = {
  task: TaskSummary
  headingRef: React.RefObject<HTMLHeadingElement | null>
  onClose: () => void
}

const TaskPreview = ({
  task,
  headingRef,
  onClose,
}: TaskPreviewProps): React.JSX.Element => (
  <aside
    id="task-preview"
    className="workflow-task-preview"
    aria-labelledby="task-preview-heading"
  >
    <button
      type="button"
      className="workflow-preview-close"
      onClick={onClose}
      aria-label="Zamknij podgląd"
    >
      <XIcon aria-hidden="true" size={18} />
    </button>
    <p className="workflow-preview-eyebrow">
      {providerName(task.provider)} · #{task.externalId}
    </p>
    <h4
      ref={headingRef}
      id="task-preview-heading"
      tabIndex={-1}
      className="workflow-preview-title"
    >
      {task.title}
    </h4>
    <p className="workflow-preview-body">{task.description || 'Brak opisu.'}</p>
    <a
      className="workflow-preview-link"
      href={task.url}
      target="_blank"
      rel="noreferrer"
    >
      <ArrowSquareOutIcon aria-hidden="true" size={15} />
      Otwórz w {task.provider === 'github' ? 'GitHubie' : 'GitLabie'}
    </a>
    <dl className="workflow-preview-details">
      <div>
        <dt>Repozytorium</dt>
        <dd>{task.repository}</dd>
      </div>
      <div>
        <dt>Etykiety</dt>
        <dd>{task.labels.length ? task.labels.join(', ') : 'Brak'}</dd>
      </div>
      <div>
        <dt>Ostatnia aktualizacja</dt>
        <dd>
          <time dateTime={task.updatedAt}>{formatDate(task.updatedAt)}</time>
        </dd>
      </div>
    </dl>
  </aside>
)
