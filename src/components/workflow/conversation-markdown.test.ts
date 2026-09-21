import { describe, expect, it } from 'vitest'
import { renderConversationMarkdown } from './conversation-markdown'

describe('renderConversationMarkdown', () => {
  it('renders a proposed Markdown document instead of displaying it as code', () => {
    expect(
      renderConversationMarkdown(
        'Propozycja:\n\n```md\n## Tytuł\n\n- punkt\n```',
      ),
    ).toBe('Propozycja:\n\n## Tytuł\n\n- punkt')
  })

  it('does not alter ordinary code blocks', () => {
    expect(renderConversationMarkdown('```ts\nconst value = 1\n```')).toBe(
      '```ts\nconst value = 1\n```',
    )
  })
})
