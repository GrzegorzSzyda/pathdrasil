import {
  CheckIcon,
  ClockIcon,
  EyeIcon,
  PencilSimpleIcon,
  PlayIcon,
  TrayIcon,
  type Icon,
} from '@phosphor-icons/react'

export type WorkflowColumnId =
  'todo' | 'refining' | 'planned' | 'in-progress' | 'review' | 'done'

export type WorkflowColumnConfig = {
  id: WorkflowColumnId
  title: string
  interactive: boolean
  icon: Icon
}

export const workflowColumns: WorkflowColumnConfig[] = [
  { id: 'todo', title: 'Do przejrzenia', interactive: true, icon: TrayIcon },
  {
    id: 'refining',
    title: 'Opracowywanie',
    interactive: false,
    icon: PencilSimpleIcon,
  },
  {
    id: 'planned',
    title: 'Zaplanowane',
    interactive: false,
    icon: ClockIcon,
  },
  {
    id: 'in-progress',
    title: 'W toku',
    interactive: false,
    icon: PlayIcon,
  },
  { id: 'review', title: 'Do review', interactive: false, icon: EyeIcon },
  { id: 'done', title: 'Gotowe', interactive: false, icon: CheckIcon },
]
