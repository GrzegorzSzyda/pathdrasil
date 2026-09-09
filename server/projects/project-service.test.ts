import { describe, expect, it } from 'vitest'
import {
  fixedAgentRules,
  type CreateProjectRequest,
  type Project,
} from '../../shared/api/projects.js'
import type { Repository } from '../../shared/api/repositories.js'
import type { IntegrationRegistry } from '../integrations/registry.js'
import type { RepositoryService } from '../repositories/repository-service.js'
import { ProjectService } from './project-service.js'
import type { ProjectStore } from './project-store.js'

const source = {
  id: 'octocat/tasks',
  name: 'tasks',
  fullName: 'octocat/tasks',
  url: 'https://github.com/octocat/tasks',
}

const request: CreateProjectRequest = {
  name: 'Pathdrasil',
  taskManager: {
    providerId: 'github-issues',
    accountId: 'github-issues:github.com:octocat',
    sources: [source],
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
}

const repository: Repository = {
  provider: 'github',
  path: '/tmp/pathdrasil',
  worktree: '/tmp/pathdrasil-worktrees',
  remoteUrl: 'https://github.com/octocat/pathdrasil',
  slug: 'octocat/pathdrasil',
  host: 'github.com',
}

const createService = ({
  accountId = request.taskManager.accountId,
  sources = [source],
}: {
  accountId?: string
  sources?: (typeof source)[]
} = {}) => {
  let savedProject: Project | undefined
  const store = {
    async add(project: Project) {
      savedProject = project
    },
  } as unknown as ProjectStore
  const repositories = {
    async verify() {
      return repository
    },
  } as unknown as RepositoryService
  const integrations = {
    get() {
      return {
        id: 'github-issues' as const,
        async detect() {
          return {
            id: 'github-issues' as const,
            domain: 'task-manager' as const,
            status: 'available' as const,
            accounts: [
              {
                id: accountId,
                host: 'github.com',
                login: 'octocat',
                active: true,
              },
            ],
          }
        },
        async listSources() {
          return sources
        },
      }
    },
  } as IntegrationRegistry
  return {
    service: new ProjectService(store, repositories, integrations),
    savedProject: () => savedProject,
  }
}

describe('ProjectService', () => {
  it('rejects an account that is not active in the selected provider', async () => {
    const { service } = createService({ accountId: 'different-account' })

    await expect(service.create(request)).rejects.toMatchObject({
      code: 'TASK_ACCOUNT_NOT_AVAILABLE',
    })
  })

  it('rejects a source unavailable to the active account', async () => {
    const { service } = createService({ sources: [] })

    await expect(service.create(request)).rejects.toMatchObject({
      code: 'TASK_SOURCE_NOT_AVAILABLE',
    })
  })

  it('stores canonical source data returned by the provider', async () => {
    const canonicalSource = { ...source, name: 'Canonical task repository' }
    const { service, savedProject } = createService({
      sources: [canonicalSource],
    })

    await service.create({
      ...request,
      taskManager: {
        ...request.taskManager,
        sources: [{ ...source, name: 'Data supplied by the client' }],
      },
    })

    expect(savedProject()?.taskManager.sources).toEqual([canonicalSource])
  })
})
