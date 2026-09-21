import { randomUUID } from 'node:crypto'
import { chmod, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { z } from 'zod'
import {
  taskDraftSchema,
  type TaskDraft,
} from '../../shared/api/task-drafts.js'
import { AppError } from '../errors/app-error.js'

const storeSchema = z.object({ drafts: z.array(taskDraftSchema) })
type Identity = Pick<TaskDraft, 'projectId' | 'taskId'>

export class TaskDraftStore {
  private writeQueue: Promise<unknown> = Promise.resolve()

  constructor(private readonly filePath: string) {}

  async get(identity: Identity): Promise<TaskDraft | undefined> {
    return (await this.list()).find(
      (draft) =>
        draft.projectId === identity.projectId &&
        draft.taskId === identity.taskId,
    )
  }

  async save(draft: TaskDraft): Promise<void> {
    const operation = this.writeQueue.then(async () => {
      const drafts = await this.list()
      const index = drafts.findIndex((current) => current.id === draft.id)
      const next = [...drafts]
      if (index === -1) next.push(draft)
      else next[index] = draft
      await this.write(next)
    })
    this.writeQueue = operation.catch(() => undefined)
    await operation
  }

  private async list(): Promise<TaskDraft[]> {
    try {
      return storeSchema.parse(
        JSON.parse(await readFile(this.filePath, 'utf8')),
      ).drafts
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
      if (error instanceof z.ZodError || error instanceof SyntaxError)
        throw new AppError(
          'INVALID_TASK_DRAFT_STORE',
          'Lokalny plik draftów jest uszkodzony.',
          500,
          error,
        )
      throw error
    }
  }

  private async write(drafts: TaskDraft[]): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true, mode: 0o700 })
    const temporaryPath = resolve(
      dirname(this.filePath),
      `.task-drafts-${randomUUID()}.tmp`,
    )
    await writeFile(
      temporaryPath,
      `${JSON.stringify(storeSchema.parse({ drafts }), null, 2)}\n`,
      {
        encoding: 'utf8',
        mode: 0o600,
      },
    )
    await rename(temporaryPath, this.filePath)
    await chmod(this.filePath, 0o600)
  }
}
