import { z } from 'zod'
import { AppError } from '../errors/app-error.js'
import type { CommandRunner } from '../infrastructure/command-runner.js'
import { createCliAdapter } from './cli-adapter.js'

const githubUserSchema = z.object({
  login: z.string().min(1),
  name: z.string().nullish(),
  html_url: z.string().url(),
})
const githubRepositorySchema = z.object({
  full_name: z.string().min(1),
  name: z.string().min(1),
  html_url: z.string().url(),
  description: z.string().nullish(),
  private: z.boolean(),
})

export const createGitHubAdapter = (runner: CommandRunner) =>
  createCliAdapter(runner, {
    id: 'github-issues',
    command: 'gh',
    providerName: 'GitHub CLI',
    readIdentity(output) {
      const user = githubUserSchema.parse(JSON.parse(output))
      return {
        host: new URL(user.html_url).host,
        login: user.login,
        ...(user.name ? { name: user.name } : {}),
      }
    },
    async listSources() {
      const result = await runner.run({
        command: 'gh',
        args: [
          'api',
          'user/repos?per_page=100&affiliation=owner,collaborator,organization_member&sort=updated',
        ],
        timeoutMs: 20_000,
      })
      if (!result.ok)
        throw new AppError(
          'TASK_SOURCES_FAILED',
          'Nie udało się pobrać projektów z GitHuba.',
          502,
        )
      return z
        .array(githubRepositorySchema)
        .parse(JSON.parse(result.stdout))
        .map((repository) => ({
          id: repository.full_name,
          name: repository.name,
          fullName: repository.full_name,
          url: repository.html_url,
          ...(repository.description
            ? { description: repository.description }
            : {}),
          private: repository.private,
        }))
    },
  })
