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

export const createConversationMessageRequestSchema = z.object({
  content: z.string().trim().min(1).max(4_000),
})

export const conversationEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('snapshot'), conversation: conversationSchema }),
  z.object({
    type: z.literal('complete'),
    conversationId: z.string().uuid(),
    messageId: z.string().uuid(),
  }),
  z.object({
    type: z.literal('cancelled'),
    conversationId: z.string().uuid(),
    messageId: z.string().uuid(),
  }),
  z.object({
    type: z.literal('error'),
    conversationId: z.string().uuid(),
    messageId: z.string().uuid(),
    message: z.string(),
  }),
])

export type Conversation = z.infer<typeof conversationSchema>
export type ConversationMessage = z.infer<typeof conversationMessageSchema>
export type ConversationEvent = z.infer<typeof conversationEventSchema>
export type CreateConversationMessageRequest = z.infer<
  typeof createConversationMessageRequestSchema
>
