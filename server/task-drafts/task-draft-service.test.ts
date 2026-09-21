import { describe, expect, it, vi } from 'vitest'
import type { TaskDraft } from '../../shared/api/task-drafts.js'
import type { TaskSummary } from '../../shared/api/tasks.js'
import type { CodexAdapter } from '../conversations/codex-adapter.js'
import type { ConversationService } from '../conversations/conversation-service.js'
import type { CommandRunner } from '../infrastructure/command-runner.js'
import type { ProjectService } from '../projects/project-service.js'
import type { TaskService } from '../tasks/task-service.js'
import { TaskDraftService } from './task-draft-service.js'
import type { TaskDraftStore } from './task-draft-store.js'

const projectId = '5f725a74-710d-45aa-afc6-90f12081ab12'
const taskId = 'github:octocat/pathdrasil:9'
const task: TaskSummary = {
  id: taskId,
  provider: 'github',
  repository: 'octocat/pathdrasil',
  externalId: 9,
  title: 'Stary tytuł',
  description: 'Stary opis',
  url: 'https://github.com/octocat/pathdrasil/issues/9',
  status: 'todo',
  labels: [],
  updatedAt: '2026-09-19T10:00:00.000Z',
}

const draft: TaskDraft = {
  id: 'da7c8bb1-8b17-45b4-afed-2c08a63fc1de',
  projectId,
  taskId,
  title: 'Nowy tytuł',
  description: 'Nowy opis',
  acceptanceCriteria: ['Da się zapisać draft.'],
  plan: ['Dodać endpoint.'],
  dependencies: [],
  questions: ['Czy wdrażać teraz?'],
  status: 'approved',
  generationStatus: 'idle',
  createdAt: '2026-09-19T10:00:00.000Z',
  updatedAt: '2026-09-19T10:00:00.000Z',
}

const createService = (currentDraft: TaskDraft = draft) => {
  const store = { get: vi.fn(async () => currentDraft), save: vi.fn() }
  const tasks = { list: vi.fn(async () => [task]), invalidate: vi.fn() }
  const runner = {
    run: vi.fn(async () => ({
      ok: true,
      stdout: '',
      stderr: '',
      timedOut: false,
    })),
  }
  const service = new TaskDraftService(
    store as unknown as TaskDraftStore,
    {} as ProjectService,
    tasks as unknown as TaskService,
    {} as ConversationService,
    {} as CodexAdapter,
    runner as CommandRunner,
  )
  return { service, store, tasks, runner }
}

describe('TaskDraftService.publish', () => {
  it('publishes only an approved draft through gh without a shell', async () => {
    const { service, runner, store, tasks } = createService()

    const published = await service.publish(projectId, taskId)

    expect(runner.run).toHaveBeenCalledWith({
      command: 'gh',
      args: [
        'issue',
        'edit',
        '9',
        '--repo',
        'octocat/pathdrasil',
        '--title',
        'Nowy tytuł',
        '--body',
        'Nowy opis\n\n## Kryteria akceptacji\n- Da się zapisać draft.\n\n## Plan\n- Dodać endpoint.\n\n## Otwarte pytania\n- Czy wdrażać teraz?',
      ],
      timeoutMs: 20_000,
    })
    expect(store.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: draft.id,
        publishedAt: expect.any(String),
      }),
    )
    expect(tasks.invalidate).toHaveBeenCalledWith(projectId)
    expect(published.publishedAt).toBeTruthy()
  })

  it('refuses publication before local approval', async () => {
    const { service, runner } = createService({ ...draft, status: 'ready' })

    await expect(service.publish(projectId, taskId)).rejects.toMatchObject({
      code: 'TASK_DRAFT_NOT_APPROVED',
    })
    expect(runner.run).not.toHaveBeenCalled()
  })

  it('creates a new GitHub issue when the draft targets a new task', async () => {
    const { service, runner, tasks } = createService({
      ...draft,
      operation: 'create',
    })

    await service.publish(projectId, taskId)

    expect(runner.run).toHaveBeenCalledWith({
      command: 'gh',
      args: [
        'issue',
        'create',
        '--repo',
        'octocat/pathdrasil',
        '--assignee',
        '@me',
        '--title',
        'Nowy tytuł',
        '--body',
        'Nowy opis\n\n## Kryteria akceptacji\n- Da się zapisać draft.\n\n## Plan\n- Dodać endpoint.\n\n## Otwarte pytania\n- Czy wdrażać teraz?',
      ],
      timeoutMs: 20_000,
    })
    expect(tasks.invalidate).toHaveBeenCalledWith(projectId)
  })

  it('deletes other tasks explicitly named in the draft', async () => {
    const { service, runner } = createService({
      ...draft,
      deleteTaskTitles: ['Test Subissue'],
    })
    runner.run
      .mockResolvedValueOnce({
        ok: true,
        stdout: '',
        stderr: '',
        timedOut: false,
      })
      .mockResolvedValueOnce({
        ok: true,
        stdout: JSON.stringify([{ number: 12, title: 'Test Subissue' }]),
        stderr: '',
        timedOut: false,
      })
      .mockResolvedValueOnce({
        ok: true,
        stdout: '',
        stderr: '',
        timedOut: false,
      })

    await service.publish(projectId, taskId)

    expect(runner.run).toHaveBeenLastCalledWith({
      command: 'gh',
      args: ['issue', 'delete', '12', '--repo', 'octocat/pathdrasil', '--yes'],
      timeoutMs: 20_000,
    })
  })
})

describe('TaskDraftService generation prompt', () => {
  it('makes the latest explicit user instruction authoritative', () => {
    const { service } = createService()
    const prompt = (
      service as unknown as {
        generationPrompt: (
          projectName: string,
          task: TaskSummary,
          messages: Array<{ role: string; content: string }>,
        ) => string
      }
    ).generationPrompt('Pathdrasil', task, [
      { role: 'user', content: 'Zostaw stary tytuł.' },
      { role: 'assistant', content: 'Proponuję dłuższy opis.' },
      { role: 'user', content: 'Zmień tytuł na Test issue.' },
    ])

    expect(prompt).toContain(
      'najnowsza jednoznaczna dyspozycja użytkownika dotycząca tytułu',
    )
    expect(prompt).toContain(
      'Najnowsze wiadomości użytkownika (nadrzędne):\nZostaw stary tytuł.\nZmień tytuł na Test issue.',
    )
  })
})
