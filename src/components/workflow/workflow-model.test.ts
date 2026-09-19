import { describe, expect, it } from 'vitest'
import type { TaskSummary } from '../../../shared/api/tasks'
import { workflowColumns } from './workflow-config'
import { selectedTaskFrom, tasksForColumn } from './workflow-model'

const task = (id: string, status: TaskSummary['status']): TaskSummary => ({
  id,
  provider: 'github',
  repository: 'octocat/pathdrasil',
  externalId: Number(id),
  title: `Task ${id}`,
  description: '',
  url: `https://github.com/octocat/pathdrasil/issues/${id}`,
  status,
  labels: [],
  updatedAt: '2026-09-15T10:00:00.000Z',
})

describe('workflow model', () => {
  const tasks = [
    task('1', 'todo'),
    task('2', 'in-progress'),
    task('3', 'review'),
  ]

  it('keeps the six configured columns in product order', () => {
    expect(workflowColumns.map(({ id }) => id)).toEqual([
      'todo',
      'refining',
      'planned',
      'in-progress',
      'review',
      'done',
    ])
  })

  it.each([
    ['todo', ['1']],
    ['refining', []],
    ['planned', []],
    ['in-progress', ['2']],
    ['review', ['3']],
    ['done', []],
  ] as const)('assigns tasks to %s', (columnId, expectedIds) => {
    expect(tasksForColumn(tasks, columnId).map(({ id }) => id)).toEqual(
      expectedIds,
    )
  })

  it('finds the selected task without inventing missing data', () => {
    expect(selectedTaskFrom(tasks, '2')?.id).toBe('2')
    expect(selectedTaskFrom(tasks, 'missing')).toBeNull()
  })
})
