import { mkdtemp, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Project } from '../../shared/api/projects.js'
import { ProjectStore } from './project-store.js'

const project: Project = {
  id: '5f725a74-710d-45aa-afc6-90f12081ab12',
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

describe('ProjectStore', () => {
  it('persists projects in a private file', async () => {
    const directory = await mkdtemp(resolve(tmpdir(), 'pathdrasil-store-'))
    const file = resolve(directory, 'data', 'projects.json')
    const store = new ProjectStore(file)
    await store.add(project)
    await expect(store.list()).resolves.toEqual([project])
    expect((await stat(file)).mode & 0o777).toBe(0o600)
  })

  it('rejects duplicate names', async () => {
    const directory = await mkdtemp(resolve(tmpdir(), 'pathdrasil-store-'))
    const store = new ProjectStore(resolve(directory, 'projects.json'))
    await store.add(project)
    await expect(
      store.add({ ...project, id: '1632c677-f24c-47ef-bc72-d08246bdd94e' }),
    ).rejects.toMatchObject({ code: 'PROJECT_NAME_EXISTS' })
  })

  it('removes a project and reports when it does not exist', async () => {
    const directory = await mkdtemp(resolve(tmpdir(), 'pathdrasil-store-'))
    const store = new ProjectStore(resolve(directory, 'projects.json'))
    await store.add(project)

    await expect(store.remove(project.id)).resolves.toBe(true)
    await expect(store.list()).resolves.toEqual([])
    await expect(store.remove(project.id)).resolves.toBe(false)
  })
})
