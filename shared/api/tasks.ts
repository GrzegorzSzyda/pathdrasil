import { z } from 'zod'

export const taskStatusSchema = z.enum(['todo', 'in-progress', 'review'])

export const taskSummarySchema = z.object({
  id: z.string(),
  provider: z.enum(['github', 'gitlab']),
  repository: z.string(),
  externalId: z.number().int().positive(),
  title: z.string(),
  description: z.string(),
  url: z.string().url(),
  status: taskStatusSchema,
  labels: z.array(z.string()),
  updatedAt: z.string(),
})

export const tasksResponseSchema = z.object({
  tasks: z.array(taskSummarySchema),
  syncedAt: z.string().datetime(),
})

export type TaskSummary = z.infer<typeof taskSummarySchema>
