import { randomUUID } from 'node:crypto'
import { chmod, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { z } from 'zod'
import {
  conversationSchema,
  type Conversation,
} from '../../shared/api/conversations.js'
import { AppError } from '../errors/app-error.js'

const storeSchema = z.object({ conversations: z.array(conversationSchema) })

type ConversationIdentity = Pick<Conversation, 'projectId' | 'taskId'>

export class ConversationStore {
  private writeQueue: Promise<unknown> = Promise.resolve()

  constructor(private readonly filePath: string) {}

  async get(identity: ConversationIdentity): Promise<Conversation | undefined> {
    return (await this.list()).find(
      (conversation) =>
        conversation.projectId === identity.projectId &&
        conversation.taskId === identity.taskId,
    )
  }

  async getOrCreate(identity: ConversationIdentity): Promise<Conversation> {
    const operation = this.writeQueue.then(async () => {
      const conversations = await this.list()
      const existing = conversations.find(
        (conversation) =>
          conversation.projectId === identity.projectId &&
          conversation.taskId === identity.taskId,
      )
      if (existing) return existing

      const now = new Date().toISOString()
      const conversation: Conversation = {
        id: randomUUID(),
        ...identity,
        agentId: 'codex',
        status: 'idle',
        createdAt: now,
        updatedAt: now,
        messages: [],
      }
      await this.write([...conversations, conversation])
      return conversation
    })
    this.writeQueue = operation.catch(() => undefined)
    return operation
  }

  async save(conversation: Conversation): Promise<void> {
    const operation = this.writeQueue.then(async () => {
      const conversations = await this.list()
      const index = conversations.findIndex(
        (current) => current.id === conversation.id,
      )
      if (index === -1)
        throw new AppError(
          'CONVERSATION_NOT_FOUND',
          'Nie znaleziono rozmowy.',
          404,
        )
      const next = [...conversations]
      next[index] = conversationSchema.parse(conversation)
      await this.write(next)
    })
    this.writeQueue = operation.catch(() => undefined)
    await operation
  }

  private async list(): Promise<Conversation[]> {
    try {
      const content = await readFile(this.filePath, 'utf8')
      return storeSchema.parse(JSON.parse(content)).conversations
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
      if (error instanceof z.ZodError || error instanceof SyntaxError)
        throw new AppError(
          'INVALID_CONVERSATION_STORE',
          'Lokalny plik rozmów jest uszkodzony.',
          500,
          error,
        )
      throw error
    }
  }

  private async write(conversations: Conversation[]): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true, mode: 0o700 })
    const temporaryPath = resolve(
      dirname(this.filePath),
      `.conversations-${randomUUID()}.tmp`,
    )
    await writeFile(
      temporaryPath,
      `${JSON.stringify(storeSchema.parse({ conversations }), null, 2)}\n`,
      { encoding: 'utf8', mode: 0o600 },
    )
    await rename(temporaryPath, this.filePath)
    await chmod(this.filePath, 0o600)
  }
}
