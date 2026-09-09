import { randomUUID } from 'node:crypto'
import { chmod, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { z } from 'zod'
import { projectSchema, type Project } from '../../shared/api/projects.js'
import { AppError } from '../errors/app-error.js'

const storeSchema = z.object({ projects: z.array(projectSchema) })

export class ProjectStore {
  private writeQueue: Promise<unknown> = Promise.resolve()

  constructor(private readonly filePath: string) {}

  async list(): Promise<Project[]> {
    try {
      const content = await readFile(this.filePath, 'utf8')
      return storeSchema.parse(JSON.parse(content)).projects
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
      if (error instanceof z.ZodError || error instanceof SyntaxError)
        throw new AppError(
          'INVALID_PROJECT_STORE',
          'Lokalny plik projektów jest uszkodzony.',
          500,
          error,
        )
      throw error
    }
  }

  async get(id: string): Promise<Project | undefined> {
    return (await this.list()).find((project) => project.id === id)
  }

  async add(project: Project): Promise<void> {
    const operation = this.writeQueue.then(async () => {
      const projects = await this.list()
      if (
        projects.some(
          (current) =>
            current.name.toLowerCase() === project.name.toLowerCase(),
        )
      )
        throw new AppError(
          'PROJECT_NAME_EXISTS',
          'Projekt o tej nazwie już istnieje.',
          409,
        )
      await this.write([...projects, project])
    })
    this.writeQueue = operation.catch(() => undefined)
    await operation
  }

  async remove(id: string): Promise<boolean> {
    const operation = this.writeQueue.then(async () => {
      const projects = await this.list()
      if (!projects.some((project) => project.id === id)) return false
      await this.write(projects.filter((project) => project.id !== id))
      return true
    })
    this.writeQueue = operation.catch(() => undefined)
    return operation
  }

  private async write(projects: Project[]): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true, mode: 0o700 })
    const temporaryPath = resolve(
      dirname(this.filePath),
      `.projects-${randomUUID()}.tmp`,
    )
    await writeFile(
      temporaryPath,
      `${JSON.stringify(storeSchema.parse({ projects }), null, 2)}\n`,
      { encoding: 'utf8', mode: 0o600 },
    )
    await rename(temporaryPath, this.filePath)
    await chmod(this.filePath, 0o600)
  }
}
