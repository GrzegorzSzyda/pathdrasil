import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectSchema, type Project } from '../../../shared/api/projects'
import {
  tasksResponseSchema,
  type TaskSummary,
} from '../../../shared/api/tasks'
import { isEditableTarget } from '../../components/workflow/workflow-keyboard'
import { requestJson } from '../../lib/api'

const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback

export const useWorkflowPage = (projectId: string) => {
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

  const selectTask = useCallback((task: TaskSummary) => {
    selectedTaskIdRef.current = task.id
    setSelectedTaskId(task.id)
  }, [])

  const focusWorkflowFallback = useCallback(() => {
    requestAnimationFrame(() => {
      const firstTask = document.querySelector<HTMLButtonElement>(
        '[aria-label="Workflow projektu"] [data-workflow-task]',
      )
      if (firstTask) firstTask.focus()
      else workflowHeadingRef.current?.focus()
    })
  }, [])

  const loadTasks = useCallback(
    async (refresh = false) => {
      setRefreshing(refresh)
      refreshingRef.current = refresh
      try {
        const response = await requestJson(
          `/api/projects/${encodeURIComponent(projectId)}/tasks${refresh ? '?refresh=true' : ''}`,
          tasksResponseSchema,
        )
        setTasks(response.tasks)
        if (
          selectedTaskIdRef.current &&
          !response.tasks.some((task) => task.id === selectedTaskIdRef.current)
        ) {
          closePreview()
          focusWorkflowFallback()
        }
        setError('')
      } catch (caught) {
        setError(errorMessage(caught, 'Nie udało się zsynchronizować tasków.'))
      } finally {
        refreshingRef.current = false
        setRefreshing(false)
      }
    },
    [closePreview, focusWorkflowFallback, projectId],
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        isEditableTarget(event.target) ||
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
        !refreshingRef.current &&
        project
      ) {
        event.preventDefault()
        void loadTasks(true)
      } else if (event.key === 'Escape' && !selectedTaskIdRef.current) {
        event.preventDefault()
        navigate(`/projects/${encodeURIComponent(projectId)}`)
      } else if (event.key.toLowerCase() === 'd' && project) {
        event.preventDefault()
        navigate(`/projects/${encodeURIComponent(projectId)}`)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [loadTasks, navigate, project, projectId])

  useEffect(() => {
    let active = true
    Promise.allSettled([
      requestJson(
        `/api/projects/${encodeURIComponent(projectId)}`,
        projectSchema,
      ),
      requestJson(
        `/api/projects/${encodeURIComponent(projectId)}/tasks`,
        tasksResponseSchema,
      ),
    ])
      .then(([projectResult, tasksResult]) => {
        if (!active) return
        if (projectResult.status === 'fulfilled')
          setProject(projectResult.value)
        else
          setError(
            errorMessage(
              projectResult.reason,
              'Nie udało się otworzyć projektu.',
            ),
          )

        if (tasksResult.status === 'fulfilled')
          setTasks(tasksResult.value.tasks)
        else
          setError(
            errorMessage(
              tasksResult.reason,
              'Nie udało się zsynchronizować tasków.',
            ),
          )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [projectId])

  return {
    closePreview,
    error,
    loadTasks,
    loading,
    project,
    refreshing,
    selectedTaskId,
    selectTask,
    showShortcuts,
    tasks,
    workflowHeadingRef,
  }
}
