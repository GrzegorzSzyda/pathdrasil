import { useCallback } from 'react'
import { ArrowClockwiseIcon } from '@phosphor-icons/react'
import { useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { InlineAlert } from '../components/InlineAlert'
import { Topbar } from '../components/Topbar'
import { WorkflowBoard } from '../components/workflow/WorkflowBoard'
import { useWorkflowPage } from './workflow/useWorkflowPage'

/** Osobny widok operacyjny workflow projektu. */
export const WorkflowPage = (): React.JSX.Element => {
  const { id = '' } = useParams()
  const {
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
  } = useWorkflowPage(id)
  const refreshAfterPublication = useCallback(
    () => void loadTasks(true),
    [loadTasks],
  )

  return (
    <main className="text-text h-screen overflow-hidden bg-[#171c24] font-['Manrope']">
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
              ? {
                  id,
                  name: project.name,
                  activeView: 'workflow',
                }
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
              onSelectTask={selectTask}
              onClosePreview={closePreview}
              projectId={id}
              onTaskPublished={refreshAfterPublication}
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
