import { describe, expect, it } from 'vitest'
import { conversationSchema } from './conversations.js'

const conversation = {
  id: '4799b951-2c08-4862-a165-b9087e820d14',
  projectId: '5f725a74-710d-45aa-afc6-90f12081ab12',
  taskId: 'github:octocat/pathdrasil:9',
  agentId: 'codex' as const,
  status: 'idle' as const,
  createdAt: '2026-09-19T10:00:00.000Z',
  updatedAt: '2026-09-19T10:00:00.000Z',
  messages: [
    {
      id: '231f5bb4-17d5-4b8d-a911-a9e2f7e6d01c',
      conversationId: '4799b951-2c08-4862-a165-b9087e820d14',
      role: 'assistant' as const,
      content: 'Jakiego efektu oczekujesz?',
      status: 'complete' as const,
      createdAt: '2026-09-19T10:00:00.000Z',
      updatedAt: '2026-09-19T10:00:00.000Z',
    },
  ],
}

describe('conversationSchema', () => {
  it('accepts a persisted conversation with completed messages', () => {
    expect(conversationSchema.parse(conversation)).toEqual(conversation)
  })

  it('preserves cancelled partial assistant messages', () => {
    const parsed = conversationSchema.parse({
      ...conversation,
      status: 'idle',
      messages: [
        {
          ...conversation.messages[0],
          content: 'Częściowa odpowiedź',
          status: 'cancelled',
        },
      ],
    })

    expect(parsed.messages[0]?.status).toBe('cancelled')
  })

  it('rejects messages belonging to another conversation', () => {
    expect(
      conversationSchema.safeParse({
        ...conversation,
        messages: [
          {
            ...conversation.messages[0],
            conversationId: 'ca6c71a1-673d-47a6-90ac-fb921d58c86b',
          },
        ],
      }).success,
    ).toBe(false)
  })
})
