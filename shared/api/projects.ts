import { z } from 'zod'
import { taskSourceSchema } from './integrations.js'
import { repositoryDraftSchema, repositorySchema } from './repositories.js'

export const createProjectRequestSchema = z.object({
  name: z.string().trim().min(1).max(120),
  taskManager: z.object({
    providerId: z.enum(['github-issues', 'gitlab-issues']),
    accountId: z.string().min(1),
    sources: z.array(taskSourceSchema).min(1).max(1),
  }),
  repositories: z.array(repositoryDraftSchema).min(1),
  agent: z.object({ id: z.string().min(1) }),
  rules: z.object({
    taskLanguage: z.string().min(1),
    repositoryLanguage: z.string().min(1),
    pathdrasilLanguage: z.string().min(1),
    autonomy: z.string().min(1),
    permissions: z.object({
      pushBranch: z.boolean(),
      createPullRequest: z.boolean(),
      merge: z.boolean(),
      respondToReview: z.boolean(),
      updateTask: z.boolean(),
      sendMessages: z.boolean(),
    }),
  }),
})

export const projectSchema = createProjectRequestSchema
  .omit({ repositories: true })
  .extend({
    id: z.string().uuid(),
    repositories: z.array(repositorySchema).min(1),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })

export const projectsResponseSchema = z.object({
  projects: z.array(projectSchema),
})

export type CreateProjectRequest = z.infer<typeof createProjectRequestSchema>
export type Project = z.infer<typeof projectSchema>
