import { describe, expect, it } from 'vitest'
import { fixedAgentRules, type Project } from '../../shared/api/projects.js'
import type { CommandRunner } from '../infrastructure/command-runner.js'
import type { ProjectService } from '../projects/project-service.js'
import { TaskService } from './task-service.js'

const project: Project = {
  id: '5f725a74-710d-45aa-afc6-90f12081ab12',
  name: 'Pathdrasil',
  taskManager: {
    providerId: 'github-issues',
    accountId: 'github-issues:github.com:octocat',
    sources: [
      {
        id: 'octocat/pathdrasil',
        name: 'pathdrasil',
        fullName: 'octocat/pathdrasil',
        url: 'https://github.com/octocat/pathdrasil',
      },
    ],
  },
  repositories: [
    {
      provider: 'github',
      path: '/tmp/pathdrasil',
      worktree: '/tmp/pathdrasil-worktrees',
      remoteUrl: 'git@github.com:octocat/pathdrasil.git',
      slug: 'octocat/pathdrasil',
      host: 'github.com',
      defaultBranch: 'main',
    },
  ],
  agent: { id: 'codex' },
  rules: {
    taskLanguage: 'Polski',
    repositoryLanguage: 'English',
    pathdrasilLanguage: 'Polski',
    ...fixedAgentRules,
  },
  createdAt: '2026-09-08T10:00:00.000Z',
  updatedAt: '2026-09-08T10:00:00.000Z',
}

describe('TaskService', () => {
  it('normalizes issues and caches provider responses', async () => {
    let calls = 0
    const runner: CommandRunner = {
      async run() {
        calls += 1
        return {
          ok: true,
          stdout: JSON.stringify([
            {
              number: 12,
              title: 'Build the backend',
              body: 'Implement the API.',
              url: 'https://github.com/octocat/pathdrasil/issues/12',
              labels: [{ name: 'in-progress' }],
              updatedAt: '2026-09-08T10:00:00Z',
            },
          ]),
          stderr: '',
          timedOut: false,
        }
      },
    }
    const projects = {
      async get() {
        return project
      },
    } as unknown as ProjectService
    const service = new TaskService(runner, projects)
    const first = await service.list(project.id)
    const second = await service.list(project.id)
    expect(first).toEqual(second)
    expect(first[0]).toMatchObject({
      id: 'github:octocat/pathdrasil:12',
      status: 'in-progress',
      description: 'Implement the API.',
    })
    expect(calls).toBe(1)
  })

  it.each([
    { provider: 'github-issues', value: null },
    { provider: 'gitlab-issues', value: null },
  ])(
    'normalizes a null description from $provider to an empty description',
    async ({ provider, value }) => {
      const runner: CommandRunner = {
        async run() {
          return {
            ok: true,
            stdout: JSON.stringify([
              provider === 'github-issues'
                ? {
                    number: 3,
                    title: 'Issue',
                    body: value,
                    url: 'https://github.com/octocat/pathdrasil/issues/3',
                    labels: [],
                    updatedAt: '2026-09-08T10:00:00Z',
                  }
                : {
                    iid: 3,
                    title: 'Issue',
                    description: value,
                    web_url: 'https://gitlab.com/octocat/pathdrasil/-/issues/3',
                    labels: [],
                    updated_at: '2026-09-08T10:00:00Z',
                  },
            ]),
            stderr: '',
            timedOut: false,
          }
        },
      }
      const projects = {
        async get() {
          return {
            ...project,
            taskManager: {
              ...project.taskManager,
              providerId: provider,
            },
          }
        },
      } as unknown as ProjectService
      const task = await new TaskService(runner, projects).list(project.id)
      expect(task[0]?.description).toBe('')
    },
  )
})
