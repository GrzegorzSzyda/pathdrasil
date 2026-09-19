import { useCallback, useEffect, useRef, useState } from 'react'
import type { TaskSummary } from '../../../shared/api/tasks'
import { isEditableTarget } from './workflow-keyboard'

type Options = {
  tasks: TaskSummary[]
  selectedTaskId: string | null
  onSelectTask: (task: TaskSummary) => void
  onClosePreview: () => void
}

export const useWorkflowBoardNavigation = ({
  tasks,
  selectedTaskId,
  onSelectTask,
  onClosePreview,
}: Options) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([])
  const previewHeadingRef = useRef<HTMLHeadingElement>(null)
  const openerRef = useRef<HTMLButtonElement | null>(null)

  const focusCard = useCallback(
    (index: number) => {
      if (!tasks.length) return
      const nextIndex = Math.max(0, Math.min(tasks.length - 1, index))
      setActiveIndex(nextIndex)
      cardRefs.current[nextIndex]?.focus()
      cardRefs.current[nextIndex]?.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
      })
    },
    [tasks.length],
  )

  const selectTask = useCallback(
    (task: TaskSummary, button: HTMLButtonElement) => {
      openerRef.current = button
      onSelectTask(task)
    },
    [onSelectTask],
  )

  const closePreview = useCallback(() => {
    onClosePreview()
    requestAnimationFrame(() => openerRef.current?.focus())
  }, [onClosePreview])

  useEffect(() => {
    if (selectedTaskId)
      previewHeadingRef.current?.focus({ preventScroll: true })
  }, [selectedTaskId])

  useEffect(() => {
    if (selectedTaskId && !tasks.some((task) => task.id === selectedTaskId))
      onClosePreview()
  }, [onClosePreview, selectedTaskId, tasks])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        !['ArrowDown', 'ArrowUp'].includes(event.key) ||
        isEditableTarget(event.target) ||
        (event.target as HTMLElement | null)?.closest('[data-workflow-task]') ||
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

  return {
    activeIndex,
    cardRefs,
    closePreview,
    focusCard,
    previewHeadingRef,
    selectTask,
  }
}
