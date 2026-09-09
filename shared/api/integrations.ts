import { z } from 'zod'

export const integrationStatusSchema = z.enum([
  'available',
  'not-installed',
  'not-authenticated',
  'unreachable',
  'unsupported',
  'error',
])

export const integrationAccountSchema = z.object({
  id: z.string(),
  host: z.string(),
  login: z.string(),
  name: z.string().optional(),
  active: z.boolean(),
})

export const integrationProviderSchema = z.object({
  id: z.enum(['github-issues', 'gitlab-issues', 'linear', 'jira']),
  domain: z.literal('task-manager'),
  status: integrationStatusSchema,
  message: z.string().optional(),
  cli: z
    .object({
      command: z.string(),
      installed: z.boolean(),
      version: z.string().optional(),
    })
    .optional(),
  accounts: z.array(integrationAccountSchema),
})

export const integrationsResponseSchema = z.object({
  providers: z.array(integrationProviderSchema),
})

export const taskSourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  fullName: z.string().min(1),
  url: z.string().url(),
  description: z.string().optional(),
  private: z.boolean().optional(),
})

export const taskSourcesResponseSchema = z.object({
  sources: z.array(taskSourceSchema),
})

export type IntegrationStatus = z.infer<typeof integrationStatusSchema>
export type IntegrationAccount = z.infer<typeof integrationAccountSchema>
export type IntegrationProvider = z.infer<typeof integrationProviderSchema>
export type IntegrationsResponse = z.infer<typeof integrationsResponseSchema>
export type TaskSource = z.infer<typeof taskSourceSchema>
