import { mkdtemp, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ConversationStore } from './conversation-store.js'

const identity = {
  projectId: '5f725a74-710d-45aa-afc6-90f12081ab12',
  taskId: 'github:octocat/pathdrasil:9',
}

describe('ConversationStore', () => {
  it('persists one private conversation for a project and task', async () => {
    const directory = await mkdtemp(
      resolve(tmpdir(), 'pathdrasil-conversations-'),
    )
    const file = resolve(directory, 'data', 'conversations.json')
    const store = new ConversationStore(file)

    const first = await store.getOrCreate(identity)
    const second = await store.getOrCreate(identity)

    expect(second).toEqual(first)
    await expect(store.get(identity)).resolves.toEqual(first)
    expect((await stat(file)).mode & 0o777).toBe(0o600)
  })

  it('saves conversation state and messages', async () => {
    const directory = await mkdtemp(
      resolve(tmpdir(), 'pathdrasil-conversations-'),
    )
    const file = resolve(directory, 'conversations.json')
    const store = new ConversationStore(file)
    const conversation = await store.getOrCreate(identity)
    const updatedAt = '2026-09-19T10:01:00.000Z'
    const updated = {
      ...conversation,
      status: 'responding' as const,
      updatedAt,
      messages: [
        {
          id: '231f5bb4-17d5-4b8d-a911-a9e2f7e6d01c',
          conversationId: conversation.id,
          role: 'user' as const,
          content: 'Przeanalizuj ten task.',
          status: 'complete' as const,
          createdAt: updatedAt,
          updatedAt,
        },
      ],
    }

    await store.save(updated)

    await expect(store.get(identity)).resolves.toEqual(updated)
  })

  it('reports a corrupt local store', async () => {
    const directory = await mkdtemp(
      resolve(tmpdir(), 'pathdrasil-conversations-'),
    )
    const file = resolve(directory, 'conversations.json')
    await writeFile(file, '{not json')

    await expect(
      new ConversationStore(file).get(identity),
    ).rejects.toMatchObject({
      code: 'INVALID_CONVERSATION_STORE',
    })
  })
})
