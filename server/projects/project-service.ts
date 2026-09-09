import { randomUUID } from 'node:crypto'
import type {
  CreateProjectRequest,
  Project,
} from '../../shared/api/projects.js'
import { AppError } from '../errors/app-error.js'
import type { RepositoryService } from '../repositories/repository-service.js'
import type { ProjectStore } from './project-store.js'

export class ProjectService {
  constructor(
    private readonly store: ProjectStore,
    private readonly repositories: RepositoryService,
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
    if (
      !input.taskManager.accountId.startsWith(
        `${input.taskManager.providerId}:`,
      )
    )
      throw new AppError(
        'ACCOUNT_PROVIDER_MISMATCH',
        'Wybrane konto nie należy do menedżera zadań.',
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
