import type { TaskSummary } from '../../../shared/api/tasks'
import { WorkflowColumn } from './WorkflowColumn'
import { useWorkflowBoardNavigation } from './useWorkflowBoardNavigation'
import { workflowColumns } from './workflow-config'
import { selectedTaskFrom, tasksForColumn } from './workflow-model'

type WorkflowBoardProps = {
  tasks: TaskSummary[]
  selectedTaskId: string | null
  onSelectTask: (task: TaskSummary) => void
  onClosePreview: () => void
  projectId: string
}

export const WorkflowBoard = ({
  tasks,
  selectedTaskId,
  onSelectTask,
  onClosePreview,
  projectId,
}: WorkflowBoardProps): React.JSX.Element => {
  const todoTasks = tasksForColumn(tasks, 'todo')
  const selectedTask = selectedTaskFrom(todoTasks, selectedTaskId)
  const navigation = useWorkflowBoardNavigation({
    tasks: todoTasks,
    selectedTaskId,
    onSelectTask,
    onClosePreview,
  })

  return (
    <div
      role="region"
      className="h-full min-h-0 overflow-hidden"
      aria-label="Workflow projektu"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && selectedTaskId) {
          event.preventDefault()
          event.stopPropagation()
          navigation.closePreview()
        }
      }}
    >
      <div className="h-full min-h-0 overflow-x-auto overflow-y-hidden">
        <div className="isolate flex h-full min-h-0 min-w-[1080px] max-[760px]:min-w-[960px]">
          {workflowColumns.map((column) => (
            <WorkflowColumn
              key={column.id}
              column={column}
              tasks={tasksForColumn(tasks, column.id)}
              selectedTask={selectedTask}
              activeIndex={navigation.activeIndex}
              cardRef={(index) => (button) => {
                navigation.cardRefs.current[index] = button
              }}
              previewHeadingRef={navigation.previewHeadingRef}
              onSelectTask={navigation.selectTask}
              onFocusCard={navigation.focusCard}
              onClosePreview={navigation.closePreview}
              dimmed={selectedTask !== null && column.id !== 'todo'}
              projectId={projectId}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
