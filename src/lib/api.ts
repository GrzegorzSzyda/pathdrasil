import type { ZodType } from 'zod'
import { apiErrorSchema } from '../../shared/api/common'

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly code = 'REQUEST_FAILED',
    readonly requestId?: string,
  ) {
    super(message)
    this.name = 'ApiClientError'
  }
}

export const requestJson = async <T>(
  input: RequestInfo | URL,
  schema: ZodType<T>,
  init?: RequestInit,
): Promise<T> => {
  const response = await fetch(input, {
    ...init,
    headers: {
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
      ...init?.headers,
    },
  })
  const payload: unknown = await response.json().catch(() => undefined)
  if (!response.ok) {
    const parsed = apiErrorSchema.safeParse(payload)
    if (parsed.success)
      throw new ApiClientError(
        parsed.data.error.message,
        parsed.data.error.code,
        parsed.data.error.requestId,
      )
    throw new ApiClientError('Backend zwrócił niepoprawną odpowiedź.')
  }
  const parsed = schema.safeParse(payload)
  if (!parsed.success)
    throw new ApiClientError('Backend zwrócił nieobsługiwany format danych.')
  return parsed.data
}
