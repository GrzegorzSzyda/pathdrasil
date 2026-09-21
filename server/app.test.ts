import { describe, expect, it } from 'vitest'
import { createApp } from './app.js'
import type { CommandRunner } from './infrastructure/command-runner.js'
import { createLogger } from './infrastructure/logger.js'
import { createIntegrationRegistry } from './integrations/registry.js'
import type { TaskDraftService } from './task-drafts/task-draft-service.js'

const missingCliRunner: CommandRunner = {
  async run() {
    return {
      ok: false,
      stdout: '',
      stderr: '',
      errorCode: 'ENOENT',
      timedOut: false,
    }
  },
}

describe('HTTP app', () => {
  const app = createApp({
    integrations: createIntegrationRegistry(missingCliRunner),
    logger: createLogger('silent'),
    version: 'test',
  })

  it('reports health', async () => {
    const response = await app.request('/api/health')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      status: 'ok',
      version: 'test',
    })
  })

  it('returns integration business states with HTTP 200', async () => {
    const response = await app.request('/api/integrations')
    expect(response.status).toBe(200)
    const payload = (await response.json()) as {
      providers: Array<{ id: string; status: string }>
    }
    expect(payload.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'github-issues',
          status: 'not-installed',
        }),
        expect.objectContaining({ id: 'linear', status: 'unsupported' }),
      ]),
    )
  })

  it('uses the common error format', async () => {
    const response = await app.request('/api/integrations/unknown/verify', {
      method: 'POST',
    })
    expect(response.status).toBe(400)
    const payload = (await response.json()) as {
      error: { code: string; requestId: string }
    }
    expect(payload.error.code).toBe('INVALID_PROVIDER')
    expect(payload.error.requestId).toBeTruthy()
  })

  it('rejects requests from a remote browser origin', async () => {
    const response = await app.request('/api/health', {
      headers: { origin: 'https://example.com' },
    })
    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'REMOTE_ORIGIN_FORBIDDEN' },
    })
  })

  it('starts draft generation and publication only through its dedicated endpoint', async () => {
    const draft = { id: 'draft-id' }
    const calls: Array<{ projectId: string; taskId: string }> = []
    const generateAndPublish = async (projectId: string, taskId: string) => {
      calls.push({ projectId, taskId })
      return draft
    }
    const publishingApp = createApp({
      integrations: createIntegrationRegistry(missingCliRunner),
      logger: createLogger('silent'),
      taskDrafts: { generateAndPublish } as unknown as TaskDraftService,
    })

    const response = await publishingApp.request(
      '/api/projects/project-1/tasks/task-1/draft/generate-and-publish',
      { method: 'POST' },
    )

    expect(response.status).toBe(202)
    await expect(response.json()).resolves.toEqual({ draft })
    expect(calls).toEqual([{ projectId: 'project-1', taskId: 'task-1' }])
  })
})
