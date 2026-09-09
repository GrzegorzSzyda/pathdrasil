import { z } from 'zod'

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string(),
  }),
})

export type ApiErrorResponse = z.infer<typeof apiErrorSchema>
