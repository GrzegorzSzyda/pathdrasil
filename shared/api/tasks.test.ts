import { describe, expect, it } from 'vitest'
import { taskSummarySchema } from './tasks.js'

const task = {
  id: 'github:octocat/pathdrasil:12',
  provider: 'github' as const,
  repository: 'octocat/pathdrasil',
  externalId: 12,
  title: 'Build the backend',
  description: 'Implement the API.',
  url: 'https://github.com/octocat/pathdrasil/issues/12',
  status: 'todo' as const,
  labels: [],
  updatedAt: '2026-09-08T10:00:00Z',
}

describe('taskSummarySchema', () => {
  it('requires an issue description in the shared contract', () => {
    expect(taskSummarySchema.parse(task).description).toBe('Implement the API.')
    expect(
      taskSummarySchema.safeParse({ ...task, description: undefined }).success,
    ).toBe(false)
  })
})
