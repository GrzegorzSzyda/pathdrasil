import { z } from 'zod'

export const conversationStatusSchema = z.enum(['idle', 'responding', 'failed'])

export const conversationMessageRoleSchema = z.enum(['user', 'assistant'])

export const conversationMessageStatusSchema = z.enum([
  'streaming',
  'complete',
  'failed',
  'cancelled',
])

export const conversationMessageSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  role: conversationMessageRoleSchema,
  content: z.string(),
  status: conversationMessageStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const conversationSchema = z
  .object({
    id: z.string().uuid(),
    projectId: z.string().uuid(),
    taskId: z.string().min(1),
    agentId: z.literal('codex'),
    status: conversationStatusSchema,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    messages: z.array(conversationMessageSchema),
  })
  .superRefine((conversation, context) => {
    for (const [index, message] of conversation.messages.entries()) {
      if (message.conversationId !== conversation.id)
        context.addIssue({
          code: 'custom',
          message: 'Wiadomość należy do innej rozmowy.',
          path: ['messages', index, 'conversationId'],
        })
    }
  })

export const conversationResponseSchema = z.object({
  conversation: conversationSchema,
})

export type Conversation = z.infer<typeof conversationSchema>
export type ConversationMessage = z.infer<typeof conversationMessageSchema>
