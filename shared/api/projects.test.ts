import { describe, expect, it } from 'vitest'
import { createProjectRequestSchema, fixedAgentRules } from './projects.js'

const request = {
  name: 'Pathdrasil',
  taskManager: {
    providerId: 'github-issues',
    accountId: 'github-issues:github.com:octocat',
    sources: [
      {
        id: 'octocat/tasks',
        name: 'tasks',
        fullName: 'octocat/tasks',
        url: 'https://github.com/octocat/tasks',
      },
    ],
  },
  repositories: [
    {
      provider: 'github',
      path: '/tmp/pathdrasil',
      worktree: '/tmp/pathdrasil-worktrees',
    },
  ],
  agent: { id: 'codex' },
  rules: {
    taskLanguage: 'Polski',
    repositoryLanguage: 'English',
    pathdrasilLanguage: 'Polski',
    ...fixedAgentRules,
  },
} as const

describe('createProjectRequestSchema', () => {
  it('accepts the fixed agent access profile', () => {
    expect(createProjectRequestSchema.safeParse(request).success).toBe(true)
  })

  it('rejects attempts to change agent permissions', () => {
    expect(
      createProjectRequestSchema.safeParse({
        ...request,
        rules: {
          ...request.rules,
          permissions: { ...request.rules.permissions, merge: true },
        },
      }).success,
    ).toBe(false)
  })
})
