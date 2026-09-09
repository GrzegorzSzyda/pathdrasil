import { z } from 'zod'

export const repositoryProviderSchema = z.enum(['github', 'gitlab'])

export const repositoryDraftSchema = z.object({
  provider: repositoryProviderSchema,
  path: z.string().trim().min(1),
  worktree: z.string().trim().min(1),
})

export const repositorySchema = repositoryDraftSchema.extend({
  path: z.string(),
  worktree: z.string(),
  remoteUrl: z.string(),
  slug: z.string(),
  host: z.string(),
  defaultBranch: z.string().optional(),
  permission: z.string().optional(),
})

export const verifyRepositoryRequestSchema = z.object({
  provider: repositoryProviderSchema,
  path: z.string().trim().min(1),
  worktree: z.string().trim().min(1).optional(),
})

export const directoryEntrySchema = z.object({
  name: z.string(),
  path: z.string(),
})

export const directoryListingSchema = z.object({
  path: z.string(),
  parent: z.string().nullable(),
  roots: z.array(z.string()),
  entries: z.array(directoryEntrySchema),
})

export type RepositoryDraft = z.infer<typeof repositoryDraftSchema>
export type Repository = z.infer<typeof repositorySchema>
export type VerifyRepositoryRequest = z.infer<
  typeof verifyRepositoryRequestSchema
>
export type DirectoryListing = z.infer<typeof directoryListingSchema>
