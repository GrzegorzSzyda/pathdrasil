import { randomUUID } from 'node:crypto'
import type {
  CreateProjectRequest,
  Project,
} from '../../shared/api/projects.js'
import { AppError } from '../errors/app-error.js'
import type { IntegrationRegistry } from '../integrations/registry.js'
import type { RepositoryService } from '../repositories/repository-service.js'
import type { ProjectStore } from './project-store.js'

export class ProjectService {
  constructor(
    private readonly store: ProjectStore,
    private readonly repositories: RepositoryService,
    private readonly integrations: IntegrationRegistry,
  ) {}

  list(): Promise<Project[]> {
    return this.store.list()
  }

  async get(id: string): Promise<Project> {
    const project = await this.store.get(id)
    if (!project)
      throw new AppError('PROJECT_NOT_FOUND', 'Nie znaleziono projektu.', 404)
    return project
  }

  async create(input: CreateProjectRequest): Promise<Project> {
    const adapter = this.integrations.get(input.taskManager.providerId)
    if (!adapter)
      throw new AppError(
        'INVALID_PROVIDER',
        'Nieobsługiwany menedżer zadań.',
        400,
      )

    const detected = await adapter.detect()
    if (
      detected.status !== 'available' ||
      !detected.accounts.some(
        (account) =>
          account.active && account.id === input.taskManager.accountId,
      )
    )
      throw new AppError(
        'TASK_ACCOUNT_NOT_AVAILABLE',
        'Wybrane konto menedżera zadań nie jest już aktywne.',
        400,
      )

    const availableSources = await adapter.listSources()
    const selectedSource = availableSources.find(
      (source) => source.id === input.taskManager.sources[0].id,
    )
    if (!selectedSource)
      throw new AppError(
        'TASK_SOURCE_NOT_AVAILABLE',
        'Wybrane źródło tasków nie jest dostępne dla aktywnego konta.',
        400,
      )

    const repositories = await Promise.all(
      input.repositories.map((repository) =>
        this.repositories.verify(repository),
      ),
    )
    const paths = new Set(repositories.map((repository) => repository.path))
    const remotes = new Set(
      repositories.map((repository) => repository.remoteUrl.toLowerCase()),
    )
    if (
      paths.size !== repositories.length ||
      remotes.size !== repositories.length
    )
      throw new AppError(
        'DUPLICATE_REPOSITORY',
        'To samo repozytorium zostało dodane więcej niż raz.',
        400,
      )
    const now = new Date().toISOString()
    const project: Project = {
      ...input,
      name: input.name.trim(),
      taskManager: {
        ...input.taskManager,
        sources: [selectedSource],
      },
      id: randomUUID(),
      repositories,
      createdAt: now,
      updatedAt: now,
    }
    await this.store.add(project)
    return project
  }

  async remove(id: string): Promise<void> {
    const removed = await this.store.remove(id)
    if (!removed)
      throw new AppError('PROJECT_NOT_FOUND', 'Nie znaleziono projektu.', 404)
  }
}
