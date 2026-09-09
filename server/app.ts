import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { randomUUID } from 'node:crypto'
import { resolve } from 'node:path'
import type { Logger } from 'pino'
import type { ZodType } from 'zod'
import {
  createProjectRequestSchema,
  type CreateProjectRequest,
} from '../shared/api/projects.js'
import {
  verifyRepositoryRequestSchema,
  type VerifyRepositoryRequest,
} from '../shared/api/repositories.js'
import { readConfig } from './config.js'
import { AppError } from './errors/app-error.js'
import { createCommandRunner } from './infrastructure/command-runner.js'
import { createLogger } from './infrastructure/logger.js'
import {
  createIntegrationRegistry,
  type IntegrationRegistry,
} from './integrations/registry.js'
import { ProjectService } from './projects/project-service.js'
import { ProjectStore } from './projects/project-store.js'
import { DirectoryService } from './repositories/directory-service.js'
import { RepositoryService } from './repositories/repository-service.js'
import { TaskService } from './tasks/task-service.js'

type AppVariables = { requestId: string }

export type AppDependencies = {
  integrations?: IntegrationRegistry
  logger?: Logger
  version?: string
  directories?: DirectoryService
  repositories?: RepositoryService
  projects?: ProjectService
  tasks?: TaskService
}

const readJson = async <T>(
  request: Request,
  schema: ZodType<T>,
): Promise<T> => {
  try {
    return schema.parse(await request.json())
  } catch (error) {
    throw new AppError(
      'INVALID_REQUEST',
      'Niepoprawne dane wejściowe.',
      400,
      error,
    )
  }
}

const isLocalOrigin = (origin: string): boolean => {
  try {
    return ['localhost', '127.0.0.1', '::1'].includes(new URL(origin).hostname)
  } catch {
    return false
  }
}

export const createApp = (dependencies: AppDependencies = {}) => {
  const app = new Hono<{ Variables: AppVariables }>()
  const logger = dependencies.logger ?? createLogger('info')
  const integrations =
    dependencies.integrations ??
    createIntegrationRegistry(createCommandRunner())
  const version = dependencies.version ?? '0.1.0'
  const config = readConfig()
  const runner = createCommandRunner()
  const directories = dependencies.directories ?? new DirectoryService()
  const repositories =
    dependencies.repositories ?? new RepositoryService(runner, directories)
  const projects =
    dependencies.projects ??
    new ProjectService(
      new ProjectStore(resolve(config.dataDirectory, 'projects.json')),
      repositories,
    )
  const tasks = dependencies.tasks ?? new TaskService(runner, projects)

  app.use('*', async (context, next) => {
    const requestId = context.req.header('x-request-id') ?? randomUUID()
    context.set('requestId', requestId)
    context.header('x-request-id', requestId)
    const origin = context.req.header('origin')
    if (origin && !isLocalOrigin(origin))
      throw new AppError(
        'REMOTE_ORIGIN_FORBIDDEN',
        'Backend przyjmuje żądania tylko z lokalnej aplikacji.',
        403,
      )
    const contentLength = Number(context.req.header('content-length') ?? 0)
    if (contentLength > 1024 * 1024)
      throw new AppError(
        'REQUEST_TOO_LARGE',
        'Żądanie przekracza dozwolony rozmiar.',
        413,
      )
    await next()
  })

  app.get('/api/health', (context) =>
    context.json({ status: 'ok' as const, version }),
  )

  app.get('/api/integrations', async (context) =>
    context.json({ providers: await integrations.detectAll() }),
  )

  app.post('/api/integrations/:provider/verify', async (context) => {
    const adapter = integrations.get(context.req.param('provider'))
    if (!adapter)
      throw new AppError('INVALID_PROVIDER', 'Nieobsługiwany provider.', 400)
    return context.json(await adapter.detect())
  })

  app.get('/api/integrations/:provider/sources', async (context) => {
    const adapter = integrations.get(context.req.param('provider'))
    if (!adapter)
      throw new AppError('INVALID_PROVIDER', 'Nieobsługiwany provider.', 400)
    return context.json({ sources: await adapter.listSources() })
  })

  app.get('/api/directories', async (context) =>
    context.json(await directories.list(context.req.query('path'))),
  )

  app.post('/api/repositories/verify', async (context) => {
    const input = await readJson<VerifyRepositoryRequest>(
      context.req.raw,
      verifyRepositoryRequestSchema,
    )
    return context.json(await repositories.verify(input))
  })

  app.get('/api/projects', async (context) =>
    context.json({ projects: await projects.list() }),
  )

  app.get('/api/projects/:id', async (context) =>
    context.json(await projects.get(context.req.param('id'))),
  )

  app.post('/api/projects', async (context) => {
    const input = await readJson<CreateProjectRequest>(
      context.req.raw,
      createProjectRequestSchema,
    )
    return context.json(await projects.create(input), 201)
  })

  app.delete('/api/projects/:id', async (context) => {
    await projects.remove(context.req.param('id'))
    return context.json({ deleted: true as const })
  })

  app.get('/api/projects/:id/tasks', async (context) => {
    const refresh = context.req.query('refresh') === 'true'
    return context.json({
      tasks: await tasks.list(context.req.param('id'), refresh),
      syncedAt: new Date().toISOString(),
    })
  })

  app.all('/api/*', (context) =>
    context.json(
      {
        error: {
          code: 'NOT_FOUND',
          message: 'Nie znaleziono zasobu.',
          requestId: context.get('requestId'),
        },
      },
      404,
    ),
  )

  app.use('*', serveStatic({ root: './dist' }))
  app.get('*', serveStatic({ path: './dist/index.html' }))

  app.notFound((context) =>
    context.json(
      {
        error: {
          code: 'NOT_FOUND',
          message: 'Nie znaleziono zasobu.',
          requestId: context.get('requestId'),
        },
      },
      404,
    ),
  )

  app.onError((error, context) => {
    const requestId = context.get('requestId') ?? randomUUID()
    const appError =
      error instanceof AppError
        ? error
        : new AppError('INTERNAL_ERROR', 'Wewnętrzny błąd serwera.', 500, error)
    logger.error(
      { requestId, code: appError.code, error: appError.cause ?? appError },
      'Request failed',
    )
    return context.json(
      {
        error: {
          code: appError.code,
          message: appError.message,
          requestId,
        },
      },
      appError.status as ContentfulStatusCode,
    )
  })

  return app
}
