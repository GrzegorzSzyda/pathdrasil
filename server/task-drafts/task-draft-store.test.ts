import { mkdtemp, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { TaskDraft } from '../../shared/api/task-drafts.js'
import { TaskDraftStore } from './task-draft-store.js'

const draft: TaskDraft = {
  id: 'da7c8bb1-8b17-45b4-afed-2c08a63fc1de',
  projectId: '5f725a74-710d-45aa-afc6-90f12081ab12',
  taskId: 'github:octocat/pathdrasil:9',
  title: 'Usprawnić opracowywanie tasków',
  description: 'Opis roboczy.',
  acceptanceCriteria: [],
  plan: [],
  dependencies: [],
  questions: [],
  status: 'draft',
  generationStatus: 'idle',
  createdAt: '2026-09-19T10:00:00.000Z',
  updatedAt: '2026-09-19T10:00:00.000Z',
}

describe('TaskDraftStore', () => {
  it('persists one private draft per task', async () => {
    const directory = await mkdtemp(resolve(tmpdir(), 'pathdrasil-drafts-'))
    const file = resolve(directory, 'data', 'task-drafts.json')
    const store = new TaskDraftStore(file)

    await store.save(draft)

    await expect(
      store.get({ projectId: draft.projectId, taskId: draft.taskId }),
    ).resolves.toEqual(draft)
    expect((await stat(file)).mode & 0o777).toBe(0o600)
  })
})
