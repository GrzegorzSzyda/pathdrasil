import { describe, expect, it } from 'vitest'
import { parseCodexEvent } from './codex-adapter.js'

describe('parseCodexEvent', () => {
  it('reads the persistent Codex thread identifier', () => {
    expect(
      parseCodexEvent(
        JSON.stringify({
          type: 'thread.started',
          thread_id: '01a0b6ac-45ae-7233-993f-cdf4c7680042',
        }),
      ),
    ).toEqual({
      type: 'thread-started',
      threadId: '01a0b6ac-45ae-7233-993f-cdf4c7680042',
    })
  })

  it('reads a completed agent message without exposing other item types', () => {
    expect(
      parseCodexEvent(
        JSON.stringify({
          type: 'item.completed',
          item: { type: 'agent_message', text: 'Analiza taska.' },
        }),
      ),
    ).toEqual({ type: 'message-completed', content: 'Analiza taska.' })
    expect(
      parseCodexEvent(
        JSON.stringify({
          type: 'item.completed',
          item: { type: 'command_execution', command: 'ls' },
        }),
      ),
    ).toBeUndefined()
  })

  it('ignores malformed JSONL', () => {
    expect(parseCodexEvent('not json')).toBeUndefined()
  })
})
