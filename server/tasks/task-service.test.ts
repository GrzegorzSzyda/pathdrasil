import { describe, expect, it } from 'vitest'
import type { Project } from '../../shared/api/projects.js'
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
    autonomy: 'local',
    permissions: {
      pushBranch: false,
      createPullRequest: false,
      merge: false,
      respondToReview: false,
      updateTask: false,
      sendMessages: false,
    },
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
    })
    expect(calls).toBe(1)
  })
})
