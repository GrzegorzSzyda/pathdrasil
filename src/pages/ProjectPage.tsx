import { useCallback, useEffect, useState } from 'react'
import { ArrowClockwiseIcon, CheckCircleIcon } from '@phosphor-icons/react'
import { useNavigate, useParams } from 'react-router-dom'
import { projectSchema, type Project } from '../../shared/api/projects'
import { tasksResponseSchema, type TaskSummary } from '../../shared/api/tasks'
import { Button } from '../components/Button'
import { InlineAlert } from '../components/InlineAlert'
import { Topbar } from '../components/Topbar'
import { requestJson } from '../lib/api'

/** Dashboard projektu: podsumowanie stanu, bez planszy workflow. */
export const ProjectPage = (): React.JSX.Element => {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<TaskSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadTasks = useCallback(
    async (refresh = false) => {
      setRefreshing(refresh)
      try {
        const response = await requestJson(
          `/api/projects/${encodeURIComponent(id)}/tasks${refresh ? '?refresh=true' : ''}`,
          tasksResponseSchema,
        )
        setTasks(response.tasks)
        setError('')
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Nie udało się zsynchronizować tasków.',
        )
      } finally {
        setRefreshing(false)
      }
    },
    [id],
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
      if (event.key === 'Escape') {
        event.preventDefault()
        navigate('/')
      } else if (event.key.toLowerCase() === 'w' && project) {
        event.preventDefault()
        navigate(`/projects/${encodeURIComponent(id)}/workflow`)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [id, navigate, project])

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

  const inProgress = tasks.filter(
    (task) => task.status === 'in-progress',
  ).length
  const inReview = tasks.filter((task) => task.status === 'review').length

  return (
    <main className="bg-page text-text min-h-screen px-6 py-6 sm:px-10">
      <Topbar
        project={
          project
            ? { id, name: project.name, activeView: 'dashboard' }
            : undefined
        }
      />
      <div className="mx-auto min-h-[calc(100vh-3rem)] w-full max-w-6xl">
        <div className="py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-brand text-sm font-semibold">Dashboard</p>
              <h1 className="text-heading mt-2 text-4xl font-semibold">
                {project?.name ?? (loading ? 'Ładowanie…' : 'Projekt')}
              </h1>
            </div>
            <Button
              type="button"
              appearance="ghost"
              disabled={refreshing || !project}
              onClick={() => void loadTasks(true)}
            >
              <ArrowClockwiseIcon aria-hidden="true" />
              {refreshing ? 'Synchronizacja…' : 'Synchronizuj'}
            </Button>
          </div>
          {error && (
            <div className="mt-6">
              <InlineAlert tone="danger">{error}</InlineAlert>
            </div>
          )}
          {project && (
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ['Otwarte taski', tasks.length],
                ['W toku', inProgress],
                ['Do review', inReview],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="border-border bg-page-deep rounded-2xl border p-5"
                >
                  <p className="text-muted text-sm">{label}</p>
                  <strong className="text-heading mt-2 block text-3xl">
                    {value}
                  </strong>
                </div>
              ))}
            </div>
          )}
          {project && tasks.length === 0 && !error && (
            <div className="border-border bg-page-deep mt-8 rounded-2xl border p-8 text-center">
              <CheckCircleIcon
                className="text-brand mx-auto"
                size={40}
                weight="duotone"
              />
              <h2 className="text-heading mt-4 text-xl font-semibold">
                Brak przypisanych otwartych issues
              </h2>
              <p className="text-muted mt-2 text-sm">
                Możesz ponowić synchronizację po zmianie przypisania w
                providerze.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
