import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import {
  taskDraftContentSchema,
  type TaskDraft,
  type UpdateTaskDraftRequest,
} from '../../shared/api/task-drafts.js'
import type { TaskSummary } from '../../shared/api/tasks.js'
import { CodexAdapter } from '../conversations/codex-adapter.js'
import { ConversationService } from '../conversations/conversation-service.js'
import { AppError } from '../errors/app-error.js'
import type { CommandRunner } from '../infrastructure/command-runner.js'
import type { ProjectService } from '../projects/project-service.js'
import type { TaskService } from '../tasks/task-service.js'
import { TaskDraftStore } from './task-draft-store.js'

export class TaskDraftService {
  private readonly activeGenerations = new Set<string>()

  constructor(
    private readonly store: TaskDraftStore,
    private readonly projects: ProjectService,
    private readonly tasks: TaskService,
    private readonly conversations: ConversationService,
    private readonly codex: CodexAdapter,
    private readonly runner: CommandRunner,
  ) {}

  async get(projectId: string, taskId: string): Promise<TaskDraft | undefined> {
    await this.findTask(projectId, taskId)
    return this.store.get({ projectId, taskId })
  }

  async generate(
    projectId: string,
    taskId: string,
    publishWhenComplete = false,
  ): Promise<TaskDraft> {
    const [project, task, conversation] = await Promise.all([
      this.projects.get(projectId),
      this.findTask(projectId, taskId),
      this.conversations.get(projectId, taskId),
    ])
    const existing = await this.store.get({ projectId, taskId })
    if (existing?.generationStatus === 'generating')
      throw new AppError('TASK_DRAFT_BUSY', 'Tworzenie draftu już trwa.', 409)

    const now = new Date().toISOString()
    const draft: TaskDraft = {
      id: existing?.id ?? randomUUID(),
      projectId,
      taskId,
      conversationId: conversation.id,
      title: existing?.title ?? task.title,
      description: existing?.description ?? task.description,
      operation: existing?.operation ?? 'update',
      acceptanceCriteria: existing?.acceptanceCriteria ?? [],
      plan: existing?.plan ?? [],
      dependencies: existing?.dependencies ?? [],
      questions: existing?.questions ?? [],
      status: publishWhenComplete
        ? 'approved'
        : existing?.status === 'approved'
          ? 'draft'
          : (existing?.status ?? 'draft'),
      generationStatus: 'generating',
      ...(publishWhenComplete ? {} : { publishedAt: existing?.publishedAt }),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }
    await this.store.save(draft)
    this.activeGenerations.add(draft.id)
    let output = ''
    const run = this.codex.start({
      cwd: project.repositories[0]?.path ?? process.cwd(),
      additionalDirectories: project.repositories
        .slice(1)
        .map((repository) => repository.path),
      prompt: this.generationPrompt(
        project.name,
        task,
        conversation.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ),
      onEvent: (event) => {
        if (event.type === 'message-completed') output = event.content
      },
    })
    void run.done.then(async (result) => {
      this.activeGenerations.delete(draft.id)
      const completedAt = new Date().toISOString()
      let latest = draft
      try {
        if (result.status !== 'complete')
          throw new Error(
            result.status === 'failed'
              ? result.message
              : 'Generowanie draftu zostało zatrzymane.',
          )
        const content = taskDraftContentSchema.parse(this.parseContent(output))
        latest = {
          ...draft,
          ...content,
          operation: content.operation ?? 'update',
          deleteTaskTitles: content.deleteTaskTitles ?? [],
          generationStatus: 'idle',
          updatedAt: completedAt,
        }
        await this.store.save(latest)
        if (publishWhenComplete) await this.publish(projectId, taskId)
      } catch (error) {
        await this.store.save({
          ...latest,
          generationStatus: 'failed',
          generationError:
            error instanceof Error
              ? error.message.slice(0, 1_000)
              : 'Nie udało się utworzyć draftu.',
          updatedAt: completedAt,
        })
      }
    })
    return draft
  }

  async generateAndPublish(
    projectId: string,
    taskId: string,
  ): Promise<TaskDraft> {
    return this.generate(projectId, taskId, true)
  }

  async update(
    projectId: string,
    taskId: string,
    input: UpdateTaskDraftRequest,
  ): Promise<TaskDraft> {
    await this.findTask(projectId, taskId)
    const draft = await this.store.get({ projectId, taskId })
    if (!draft)
      throw new AppError(
        'TASK_DRAFT_NOT_FOUND',
        'Najpierw utwórz draft opracowania.',
        404,
      )
    if (draft.generationStatus === 'generating')
      throw new AppError(
        'TASK_DRAFT_BUSY',
        'Poczekaj na zakończenie generowania draftu.',
        409,
      )
    const updated: TaskDraft = {
      ...draft,
      ...input,
      generationStatus: 'idle',
      updatedAt: new Date().toISOString(),
    }
    await this.store.save(updated)
    return updated
  }

  async publish(projectId: string, taskId: string): Promise<TaskDraft> {
    const [draft, task] = await Promise.all([
      this.get(projectId, taskId),
      this.findTask(projectId, taskId),
    ])
    if (!draft)
      throw new AppError(
        'TASK_DRAFT_NOT_FOUND',
        'Najpierw utwórz draft opracowania.',
        404,
      )
    if (draft.status !== 'approved')
      throw new AppError(
        'TASK_DRAFT_NOT_APPROVED',
        'Najpierw zaakceptuj draft lokalnie.',
        409,
      )
    if (task.provider !== 'github')
      throw new AppError(
        'TASK_DRAFT_PUBLISH_UNSUPPORTED',
        'Publikacja draftów jest obecnie dostępna tylko dla GitHub Issues.',
        501,
      )
    const result = await this.runner.run(
      draft.operation === 'create'
        ? {
            command: 'gh',
            args: [
              'issue',
              'create',
              '--repo',
              task.repository,
              '--assignee',
              '@me',
              '--title',
              draft.title,
              '--body',
              this.githubBody(draft),
            ],
            timeoutMs: 20_000,
          }
        : {
            command: 'gh',
            args: [
              'issue',
              'edit',
              String(task.externalId),
              '--repo',
              task.repository,
              '--title',
              draft.title,
              '--body',
              this.githubBody(draft),
            ],
            timeoutMs: 20_000,
          },
    )
    if (!result.ok)
      throw new AppError(
        'TASK_DRAFT_PUBLISH_FAILED',
        'Nie udało się opublikować draftu w GitHubie.',
        502,
      )
    await this.deleteTasksByTitle(task, draft.deleteTaskTitles ?? [])
    const updated = {
      ...draft,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await this.store.save(updated)
    this.tasks.invalidate(projectId)
    return updated
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

  private parseContent(output: string): unknown {
    const fenced = output.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]
    return JSON.parse(fenced ?? output)
  }

  private generationPrompt(
    projectName: string,
    task: TaskSummary,
    messages: Array<{ role: string; content: string }>,
  ): string {
    return `Jesteś analitykiem technicznym w projekcie ${projectName}. Pracujesz wyłącznie w trybie odczytu. Na podstawie taska i rozmowy przygotuj praktyczny draft opracowania. Nie modyfikuj plików, issue, commitów, branchy ani PR/MR. Zwróć WYŁĄCZNIE poprawny JSON bez Markdownu o dokładnej strukturze: {"operation": "update" | "create", "deleteTaskTitles": string[], "title": string, "description": string, "acceptanceCriteria": string[], "plan": string[], "dependencies": string[], "questions": string[]}. Odpowiadaj po polsku. Jeżeli czegoś nie wiadomo, dodaj to do questions, nie wymyślaj faktów.

Najważniejsza reguła: najnowsza jednoznaczna dyspozycja użytkownika dotycząca tytułu, opisu lub zakresu ma pierwszeństwo przed całą starszą rozmową, wcześniejszymi draftami i odpowiedziami asystenta. Zastosuj ją literalnie, w tym wskazaną wielkość liter w tytule. Nie przedstawiaj takiej dyspozycji jako otwartego pytania ani nie zastępujaj jej podsumowaniem historii. Starsze ustalenia zachowaj wyłącznie, gdy nie są z nią sprzeczne. Treść asystenta jest propozycją, a nie poleceniem nadrzędnym.

Ustaw operation na "create" wyłącznie wtedy, gdy najnowsza jednoznaczna dyspozycja użytkownika prosi o utworzenie nowego taska lub issue. Wtedy tytuł i opis dotyczą nowego issue, które powstanie w repozytorium bieżącego taska. W każdym innym przypadku ustaw operation na "update" i zaktualizuj bieżące issue.

Jeśli użytkownik jednoznacznie zleca usunięcie innych tasków, wpisz ich dokładne tytuły do deleteTaskTitles. Usuwaj tylko taski wskazane konkretnym tytułem w rozmowie, z bieżącego repozytorium; nie usuwaj bieżącego issue. Jeżeli zakres usunięcia jest niejednoznaczny, ustaw deleteTaskTitles na [] i poproś o doprecyzowanie. Gdy nic nie ma być usunięte, zwróć deleteTaskTitles jako [].

Task #${task.externalId}: ${task.title}
Opis:
${task.description || 'Brak opisu.'}

Najnowsze wiadomości użytkownika (nadrzędne):
${
  messages
    .filter((message) => message.role === 'user')
    .slice(-3)
    .map((message) => message.content)
    .join('\n') || 'Brak rozmowy.'
}

Pełna rozmowa:
${messages.map((message) => `${message.role}: ${message.content}`).join('\n') || 'Brak rozmowy.'}`
  }

  private async deleteTasksByTitle(
    task: TaskSummary,
    titles: string[],
  ): Promise<void> {
    for (const title of [...new Set(titles.map((value) => value.trim()))]) {
      if (!title) continue
      const listed = await this.runner.run({
        command: 'gh',
        args: [
          'issue',
          'list',
          '--repo',
          task.repository,
          '--state',
          'open',
          '--limit',
          '100',
          '--search',
          `${title} in:title`,
          '--json',
          'number,title',
        ],
        timeoutMs: 20_000,
      })
      if (!listed.ok)
        throw new AppError(
          'TASK_DRAFT_DELETE_LIST_FAILED',
          'Nie udało się znaleźć taska do usunięcia w GitHubie.',
          502,
        )
      const matches = z
        .array(
          z.object({ number: z.number().int().positive(), title: z.string() }),
        )
        .parse(JSON.parse(listed.stdout))
        .filter(
          (item) =>
            item.number !== task.externalId &&
            item.title.trim().toLocaleLowerCase() === title.toLocaleLowerCase(),
        )
      for (const match of matches) {
        const deleted = await this.runner.run({
          command: 'gh',
          args: [
            'issue',
            'delete',
            String(match.number),
            '--repo',
            task.repository,
            '--yes',
          ],
          timeoutMs: 20_000,
        })
        if (!deleted.ok)
          throw new AppError(
            'TASK_DRAFT_DELETE_FAILED',
            'Nie udało się usunąć taska w GitHubie.',
            502,
          )
      }
    }
  }

  private githubBody(draft: TaskDraft): string {
    const section = (heading: string, values: string[]) =>
      values.length
        ? `\n\n## ${heading}\n${values.map((value) => `- ${value}`).join('\n')}`
        : ''
    return `${draft.description}${section('Kryteria akceptacji', draft.acceptanceCriteria)}${section('Plan', draft.plan)}${section('Zależności', draft.dependencies)}${section('Otwarte pytania', draft.questions)}`
  }
}
