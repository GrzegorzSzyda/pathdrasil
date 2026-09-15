import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowClockwiseIcon } from '@phosphor-icons/react'
import { useNavigate, useParams } from 'react-router-dom'
import { projectSchema, type Project } from '../../shared/api/projects'
import { tasksResponseSchema, type TaskSummary } from '../../shared/api/tasks'
import { Button } from '../components/Button'
import { InlineAlert } from '../components/InlineAlert'
import { Topbar } from '../components/Topbar'
import { WorkflowBoard } from '../components/workflow/WorkflowBoard'
import { requestJson } from '../lib/api'

/** Osobny widok operacyjny workflow projektu. */
export const WorkflowPage = (): React.JSX.Element => {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<TaskSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const workflowHeadingRef = useRef<HTMLHeadingElement>(null)
  const selectedTaskIdRef = useRef<string | null>(null)
  const refreshingRef = useRef(false)

  const closePreview = useCallback(() => {
    selectedTaskIdRef.current = null
    setSelectedTaskId(null)
  }, [])

  const loadTasks = useCallback(
    async (refresh = false) => {
      setRefreshing(refresh)
      if (refresh) refreshingRef.current = true
      try {
        const response = await requestJson(
          `/api/projects/${encodeURIComponent(id)}/tasks${refresh ? '?refresh=true' : ''}`,
          tasksResponseSchema,
        )
        setTasks(response.tasks)
        if (
          selectedTaskIdRef.current &&
          !response.tasks.some((task) => task.id === selectedTaskIdRef.current)
        ) {
          closePreview()
          requestAnimationFrame(() => {
            const firstTask = document.querySelector<HTMLButtonElement>(
              '[aria-label="Workflow projektu"] button',
            )
            if (firstTask) firstTask.focus()
            else workflowHeadingRef.current?.focus()
          })
        }
        setError('')
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Nie udało się zsynchronizować tasków.',
        )
      } finally {
        refreshingRef.current = false
        setRefreshing(false)
      }
    },
    [closePreview, id],
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (
        target?.matches('input, textarea, select, [contenteditable="true"]') ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      )
        return
      if (event.key === '?') {
        event.preventDefault()
        setShowShortcuts((visible) => !visible)
      } else if (
        event.key.toLowerCase() === 'r' &&
        !refreshing &&
        !refreshingRef.current &&
        project
      ) {
        event.preventDefault()
        void loadTasks(true)
      } else if (event.key === 'Escape' && !selectedTaskIdRef.current) {
        event.preventDefault()
        navigate(`/projects/${encodeURIComponent(id)}`)
      } else if (event.key.toLowerCase() === 'd' && project) {
        event.preventDefault()
        navigate(`/projects/${encodeURIComponent(id)}`)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [id, loadTasks, navigate, project, refreshing])

  useEffect(() => {
    let active = true
    Promise.allSettled([
      requestJson(`/api/projects/${encodeURIComponent(id)}`, projectSchema),
      requestJson(
        `/api/projects/${encodeURIComponent(id)}/tasks`,
        tasksResponseSchema,
      ),
    ])
      .then(([projectResult, tasksResult]) => {
        if (!active) return
        if (projectResult.status === 'fulfilled')
          setProject(projectResult.value)
        else
          setError(
            projectResult.reason instanceof Error
              ? projectResult.reason.message
              : 'Nie udało się otworzyć projektu.',
          )
        if (tasksResult.status === 'fulfilled')
          setTasks(tasksResult.value.tasks)
        else
          setError(
            tasksResult.reason instanceof Error
              ? tasksResult.reason.message
              : 'Nie udało się zsynchronizować tasków.',
          )
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  return (
    <main className="workflow-page text-text h-screen overflow-hidden bg-[#171c24]">
      <div className="relative z-10 h-[72px] bg-[#181e27] px-6 shadow-[0_3px_12px_#0d111766]">
        <Topbar
          actions={
            <Button
              type="button"
              appearance="ghost"
              className="min-h-9 rounded-lg px-3 text-xs"
              disabled={refreshing || !project}
              onClick={() => void loadTasks(true)}
            >
              <ArrowClockwiseIcon aria-hidden="true" />
              {refreshing ? 'Synchronizacja…' : 'Synchronizuj'}
            </Button>
          }
          project={
            project
              ? { id, name: project.name, activeView: 'workflow' }
              : undefined
          }
        />
      </div>
      <h1 className="sr-only">
        Workflow projektu {project?.name ?? (loading ? '— ładowanie' : '')}
      </h1>
      <div className="h-[calc(100vh-72px)] min-h-0">
        {error && (
          <div className="absolute top-20 right-6 left-6 z-20">
            <InlineAlert tone="danger">{error}</InlineAlert>
          </div>
        )}
        {project && (
          <section className="h-full" aria-labelledby="workflow-heading">
            <h2
              ref={workflowHeadingRef}
              id="workflow-heading"
              tabIndex={-1}
              className="sr-only"
            >
              Workflow
            </h2>
            {showShortcuts && (
              <p
                className="absolute right-6 bottom-5 z-20 rounded-lg bg-[#181a1fe6] px-3 py-2 text-[11px] text-[#abb2bf] backdrop-blur"
                aria-live="polite"
              >
                Skróty: ↑/↓, Home/End, Enter/Space, Esc, R — synchronizacja
              </p>
            )}
            <WorkflowBoard
              tasks={tasks}
              selectedTaskId={selectedTaskId}
              onSelectTask={(task) => {
                selectedTaskIdRef.current = task.id
                setSelectedTaskId(task.id)
              }}
              onClosePreview={closePreview}
            />
            <p className="sr-only" aria-live="polite">
              {selectedTaskId
                ? `Otwarto podgląd taska #${tasks.find((task) => task.id === selectedTaskId)?.externalId ?? ''}`
                : ''}
            </p>
          </section>
        )}
      </div>
    </main>
  )
}
