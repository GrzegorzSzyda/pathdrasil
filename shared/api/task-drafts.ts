import { z } from 'zod'

export const taskDraftStatusSchema = z.enum([
  'draft',
  'ready',
  'approved',
  'rejected',
])

export const taskDraftGenerationStatusSchema = z.enum([
  'idle',
  'generating',
  'failed',
])

export const taskDraftContentSchema = z.object({
  operation: z.enum(['update', 'create']).optional(),
  deleteTaskTitles: z
    .array(z.string().trim().min(1).max(240))
    .max(30)
    .optional(),
  title: z.string().trim().min(1).max(240),
  description: z.string().max(20_000),
  acceptanceCriteria: z.array(z.string().trim().min(1).max(1_000)).max(30),
  plan: z.array(z.string().trim().min(1).max(2_000)).max(30),
  dependencies: z.array(z.string().trim().min(1).max(1_000)).max(30),
  questions: z.array(z.string().trim().min(1).max(1_000)).max(30),
})

export const taskDraftSchema = taskDraftContentSchema.extend({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  taskId: z.string().min(1),
  conversationId: z.string().uuid().optional(),
  status: taskDraftStatusSchema,
  generationStatus: taskDraftGenerationStatusSchema,
  generationError: z.string().max(1_000).optional(),
  publishedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const taskDraftResponseSchema = z.object({
  draft: taskDraftSchema.nullable(),
})

export const updateTaskDraftRequestSchema = taskDraftContentSchema.extend({
  status: taskDraftStatusSchema,
})

export type TaskDraft = z.infer<typeof taskDraftSchema>
export type UpdateTaskDraftRequest = z.infer<
  typeof updateTaskDraftRequestSchema
>
