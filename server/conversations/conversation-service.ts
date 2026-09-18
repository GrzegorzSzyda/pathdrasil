import { randomUUID } from 'node:crypto'
import type {
  Conversation,
  ConversationEvent,
  ConversationMessage,
} from '../../shared/api/conversations.js'
import type { TaskSummary } from '../../shared/api/tasks.js'
import { AppError } from '../errors/app-error.js'
import type { ProjectService } from '../projects/project-service.js'
import type { TaskService } from '../tasks/task-service.js'
import { CodexAdapter, type CodexRun } from './codex-adapter.js'
import { ConversationStore } from './conversation-store.js'

type Listener = (event: ConversationEvent) => void

export class ConversationService {
  private readonly activeRuns = new Map<string, CodexRun>()
  private readonly listeners = new Map<string, Set<Listener>>()

  constructor(
    private readonly store: ConversationStore,
    private readonly projects: ProjectService,
    private readonly tasks: TaskService,
    private readonly codex: CodexAdapter,
  ) {}

  async get(projectId: string, taskId: string): Promise<Conversation> {
    await this.findTask(projectId, taskId)
    return this.store.getOrCreate({ projectId, taskId })
  }

  async startInitial(projectId: string, taskId: string): Promise<Conversation> {
    return this.start(projectId, taskId, undefined)
  }

  async send(
    projectId: string,
    taskId: string,
    content: string,
  ): Promise<Conversation> {
    return this.start(projectId, taskId, content)
  }

  subscribe(conversationId: string, listener: Listener): () => void {
    const listeners = this.listeners.get(conversationId) ?? new Set<Listener>()
    listeners.add(listener)
    this.listeners.set(conversationId, listeners)
    return () => {
      listeners.delete(listener)
      if (!listeners.size) this.listeners.delete(conversationId)
    }
  }

  async cancel(projectId: string, taskId: string): Promise<void> {
    const conversation = await this.get(projectId, taskId)
    this.activeRuns.get(conversation.id)?.cancel()
  }

  private async start(
    projectId: string,
    taskId: string,
    userContent: string | undefined,
  ): Promise<Conversation> {
    const [project, task] = await Promise.all([
      this.projects.get(projectId),
      this.findTask(projectId, taskId),
    ])
    const conversation = await this.store.getOrCreate({ projectId, taskId })
    if (this.activeRuns.has(conversation.id))
      throw new AppError('CONVERSATION_BUSY', 'Odpowiedź agenta już trwa.', 409)

    const now = new Date().toISOString()
    const messages = userContent
      ? [
          ...conversation.messages,
          this.message(conversation.id, 'user', userContent, 'complete', now),
        ]
      : conversation.messages
    const assistant = this.message(
      conversation.id,
      'assistant',
      '',
      'streaming',
      now,
    )
    const next = {
      ...conversation,
      status: 'responding' as const,
      updatedAt: now,
      messages: [...messages, assistant],
    }
    await this.store.save(next)
    let latest = next
    let writes = Promise.resolve()
    const run = this.codex.start({
      cwd: project.repositories[0]?.path ?? process.cwd(),
      prompt: this.prompt(
        project.name,
        task,
        messages,
        userContent === undefined,
      ),
      onEvent: (event) => {
        if (event.type !== 'message-completed') return
        latest = {
          ...latest,
          updatedAt: new Date().toISOString(),
          messages: latest.messages.map((message) =>
            message.id === assistant.id
              ? {
                  ...message,
                  content: event.content,
                  updatedAt: new Date().toISOString(),
                }
              : message,
          ),
        }
        writes = writes.then(() => this.store.save(latest))
      },
    })
    this.activeRuns.set(conversation.id, run)
    void run.done.then(async (result) => {
      this.activeRuns.delete(conversation.id)
      await writes
      const status =
        result.status === 'complete'
          ? 'complete'
          : result.status === 'cancelled'
            ? 'cancelled'
            : 'failed'
      const updated: Conversation = {
        ...latest,
        status: status === 'failed' ? 'failed' : 'idle',
        updatedAt: new Date().toISOString(),
        messages: latest.messages.map((message) =>
          message.id === assistant.id
            ? { ...message, status, updatedAt: new Date().toISOString() }
            : message,
        ),
      }
      await this.store.save(updated)
      if (status === 'complete')
        this.emit(conversation.id, {
          type: 'complete',
          conversationId: conversation.id,
          messageId: assistant.id,
        })
      else if (status === 'cancelled')
        this.emit(conversation.id, {
          type: 'cancelled',
          conversationId: conversation.id,
          messageId: assistant.id,
        })
      else
        this.emit(conversation.id, {
          type: 'error',
          conversationId: conversation.id,
          messageId: assistant.id,
          message:
            result.status === 'failed'
              ? result.message
              : 'Nie udało się uzyskać odpowiedzi.',
        })
    })
    return next
  }

  private async findTask(
    projectId: string,
    taskId: string,
  ): Promise<TaskSummary> {
    const task = (await this.tasks.list(projectId)).find(
      (item) => item.id === taskId,
    )
    if (!task)
      throw new AppError('TASK_NOT_FOUND', 'Nie znaleziono taska.', 404)
    return task
  }

  private message(
    conversationId: string,
    role: ConversationMessage['role'],
    content: string,
    status: ConversationMessage['status'],
    now: string,
  ): ConversationMessage {
    return {
      id: randomUUID(),
      conversationId,
      role,
      content,
      status,
      createdAt: now,
      updatedAt: now,
    }
  }
  private emit(id: string, event: ConversationEvent): void {
    this.listeners.get(id)?.forEach((listener) => listener(event))
  }
  private prompt(
    projectName: string,
    task: TaskSummary,
    messages: ConversationMessage[],
    initial: boolean,
  ): string {
    return `Jesteś konsultantem technicznym Pathdrasil. Przeglądaj repozytorium tylko, gdy to konieczne; nie modyfikuj plików, issue ani repozytorium. Odpowiadaj po polsku. Projekt: ${projectName}. Task #${task.externalId}: ${task.title}\n${task.description}\nHistoria:\n${messages.map((message) => `${message.role}: ${message.content}`).join('\n')}\n${initial ? 'Podaj krótko cel i najwyżej trzy najważniejsze pytania lub ryzyka; nie parafrazuj opisu.' : ''}`
  }
}
