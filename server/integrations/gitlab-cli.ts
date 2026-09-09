import { z } from 'zod'
import { AppError } from '../errors/app-error.js'
import type { CommandRunner } from '../infrastructure/command-runner.js'
import { createCliAdapter } from './cli-adapter.js'

const gitlabUserSchema = z.object({
  username: z.string().min(1),
  name: z.string().nullish(),
  web_url: z.string().url(),
})
const gitlabProjectSchema = z.object({
  path_with_namespace: z.string().min(1),
  name: z.string().min(1),
  web_url: z.string().url(),
  description: z.string().nullish(),
  visibility: z.string(),
})

export const createGitLabAdapter = (runner: CommandRunner) =>
  createCliAdapter(runner, {
    id: 'gitlab-issues',
    command: 'glab',
    providerName: 'GitLab CLI',
    readIdentity(output) {
      const user = gitlabUserSchema.parse(JSON.parse(output))
      return {
        host: new URL(user.web_url).host,
        login: user.username,
        ...(user.name ? { name: user.name } : {}),
      }
    },
    async listSources() {
      const result = await runner.run({
        command: 'glab',
        args: [
          'api',
          'projects?membership=true&simple=true&per_page=100&order_by=last_activity_at',
        ],
        timeoutMs: 20_000,
      })
      if (!result.ok)
        throw new AppError(
          'TASK_SOURCES_FAILED',
          'Nie udało się pobrać projektów z GitLaba.',
          502,
        )
      return z
        .array(gitlabProjectSchema)
        .parse(JSON.parse(result.stdout))
        .map((project) => ({
          id: project.path_with_namespace,
          name: project.name,
          fullName: project.path_with_namespace,
          url: project.web_url,
          ...(project.description ? { description: project.description } : {}),
          private: project.visibility !== 'public',
        }))
    },
  })
