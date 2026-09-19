import type { TaskSummary } from '../../../shared/api/tasks'
import type { WorkflowColumnId } from './workflow-config'

export const tasksForColumn = (
  tasks: TaskSummary[],
  columnId: WorkflowColumnId,
): TaskSummary[] => {
  if (columnId === 'refining' || columnId === 'planned' || columnId === 'done')
    return []
  return tasks.filter((task) => task.status === columnId)
}

export const selectedTaskFrom = (
  tasks: TaskSummary[],
  selectedTaskId: string | null,
): TaskSummary | null =>
  tasks.find((task) => task.id === selectedTaskId) ?? null
