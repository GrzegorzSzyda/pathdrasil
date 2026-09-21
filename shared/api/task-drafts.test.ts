import { describe, expect, it } from 'vitest'
import { taskDraftSchema } from './task-drafts.js'

const draft = {
  id: 'da7c8bb1-8b17-45b4-afed-2c08a63fc1de',
  projectId: '5f725a74-710d-45aa-afc6-90f12081ab12',
  taskId: 'github:octocat/pathdrasil:9',
  title: 'Usprawnić opracowywanie tasków',
  description: 'Opis roboczy.',
  acceptanceCriteria: ['Draft można zapisać lokalnie.'],
  plan: ['Dodać model draftu.'],
  dependencies: [],
  questions: ['Czy opis ma trafić do issue?'],
  status: 'draft' as const,
  generationStatus: 'idle' as const,
  createdAt: '2026-09-19T10:00:00.000Z',
  updatedAt: '2026-09-19T10:00:00.000Z',
}

describe('taskDraftSchema', () => {
  it('accepts a local task draft', () => {
    expect(taskDraftSchema.parse(draft)).toEqual(draft)
  })

  it('preserves the explanation of a failed generation', () => {
    expect(
      taskDraftSchema.parse({
        ...draft,
        generationStatus: 'failed',
        generationError: 'Codex nie zwrócił poprawnego JSON-a.',
      }).generationError,
    ).toBe('Codex nie zwrócił poprawnego JSON-a.')
  })

  it('rejects an empty draft title', () => {
    expect(taskDraftSchema.safeParse({ ...draft, title: '  ' }).success).toBe(
      false,
    )
  })
})
