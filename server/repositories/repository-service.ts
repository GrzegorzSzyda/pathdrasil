import { realpath } from 'node:fs/promises'
import { isAbsolute, resolve } from 'node:path'
import { z } from 'zod'
import type {
  Repository,
  VerifyRepositoryRequest,
} from '../../shared/api/repositories.js'
import { AppError } from '../errors/app-error.js'
import type { CommandRunner } from '../infrastructure/command-runner.js'
import { DirectoryService } from './directory-service.js'

const remoteSchema = z.string().min(1)
const githubRepositorySchema = z.object({
  nameWithOwner: z.string().min(3),
  url: z.string().url(),
  defaultBranchRef: z.object({ name: z.string().min(1) }).nullish(),
  viewerPermission: z.string().nullish(),
})
const gitlabRepositorySchema = z.object({
  path_with_namespace: z.string().min(3),
  web_url: z.string().url(),
  default_branch: z.string().nullish(),
  permissions: z
    .object({
      project_access: z.object({ access_level: z.number() }).nullish(),
      group_access: z.object({ access_level: z.number() }).nullish(),
    })
    .nullish(),
})

const parseRemote = (remoteUrl: string): { host: string; slug: string } => {
  const ssh = remoteUrl.match(/^git@([^:]+):(.+?)(?:\.git)?$/)
  if (ssh) return { host: ssh[1], slug: ssh[2].replace(/\.git$/, '') }
  try {
    const url = new URL(remoteUrl)
    return {
      host: url.host,
      slug: url.pathname.replace(/^\//, '').replace(/\.git$/, ''),
    }
  } catch {
    throw new AppError(
      'UNSUPPORTED_REMOTE',
      'Remote origin ma nieobsługiwany format.',
      400,
    )
  }
}

export class RepositoryService {
  constructor(
    private readonly runner: CommandRunner,
    private readonly directories = new DirectoryService(),
  ) {}

  async verify(input: VerifyRepositoryRequest): Promise<Repository> {
    const selectedPath = await this.directories.normalizeDirectory(input.path)
    const rootResult = await this.runner.run({
      command: 'git',
      args: ['rev-parse', '--show-toplevel'],
      cwd: selectedPath,
    })
    if (!rootResult.ok)
      throw new AppError(
        'NOT_A_GIT_REPOSITORY',
        'Wybrany katalog nie jest repozytorium Git.',
        400,
      )
    const repositoryPath = await realpath(rootResult.stdout.trim())
    if (repositoryPath !== selectedPath)
      throw new AppError(
        'SELECT_REPOSITORY_ROOT',
        'Wybierz główny katalog repozytorium.',
        400,
      )

    const [remoteResult, branchResult] = await Promise.all([
      this.runner.run({
        command: 'git',
        args: ['remote', 'get-url', 'origin'],
        cwd: repositoryPath,
      }),
      this.runner.run({
        command: 'git',
        args: ['symbolic-ref', 'refs/remotes/origin/HEAD', '--short'],
        cwd: repositoryPath,
      }),
    ])
    if (!remoteResult.ok)
      throw new AppError(
        'MISSING_ORIGIN',
        'Repozytorium nie ma remote origin.',
        400,
      )
    const remoteUrl = remoteSchema.parse(remoteResult.stdout.trim())
    const remote = parseRemote(remoteUrl)
    if (input.provider === 'github' && remote.host !== 'github.com')
      throw new AppError(
        'PROVIDER_MISMATCH',
        'Remote origin nie wskazuje na GitHub.',
        400,
      )
    if (input.provider === 'gitlab' && remote.host === 'github.com')
      throw new AppError(
        'PROVIDER_MISMATCH',
        'Remote origin nie wskazuje na GitLab.',
        400,
      )

    if (input.worktree && !isAbsolute(input.worktree))
      throw new AppError(
        'INVALID_WORKTREE_PATH',
        'Katalog worktree musi mieć ścieżkę bezwzględną.',
        400,
      )
    const worktree = input.worktree
      ? input.worktree
      : resolve(
          repositoryPath,
          '..',
          `${remote.slug.split('/').at(-1)}-worktrees`,
        )
    if (input.provider === 'github') {
      const providerResult = await this.runner.run({
        command: 'gh',
        args: [
          'repo',
          'view',
          '--json',
          'nameWithOwner,url,defaultBranchRef,viewerPermission',
        ],
        cwd: repositoryPath,
        timeoutMs: 20_000,
      })
      if (!providerResult.ok)
        throw new AppError(
          'REPOSITORY_PROVIDER_UNAVAILABLE',
          'GitHub CLI nie może odczytać tego repozytorium.',
          400,
        )
      const githubRepository = githubRepositorySchema.parse(
        JSON.parse(providerResult.stdout),
      )
      return {
        provider: input.provider,
        path: repositoryPath,
        worktree,
        remoteUrl: githubRepository.url,
        slug: githubRepository.nameWithOwner,
        host: new URL(githubRepository.url).host,
        ...(githubRepository.defaultBranchRef
          ? { defaultBranch: githubRepository.defaultBranchRef.name }
          : {}),
        ...(githubRepository.viewerPermission
          ? { permission: githubRepository.viewerPermission }
          : {}),
      }
    }

    const providerResult = await this.runner.run({
      command: 'glab',
      args: ['api', 'projects/:fullpath'],
      cwd: repositoryPath,
      timeoutMs: 20_000,
    })
    if (!providerResult.ok)
      throw new AppError(
        'REPOSITORY_PROVIDER_UNAVAILABLE',
        'GitLab CLI nie może odczytać tego repozytorium.',
        400,
      )
    const gitlabRepository = gitlabRepositorySchema.parse(
      JSON.parse(providerResult.stdout),
    )
    if (new URL(gitlabRepository.web_url).host !== remote.host)
      throw new AppError(
        'PROVIDER_MISMATCH',
        'GitLab CLI zwrócił repozytorium z innego hosta.',
        400,
      )
    const projectAccess =
      gitlabRepository.permissions?.project_access?.access_level ??
      gitlabRepository.permissions?.group_access?.access_level

    return {
      provider: input.provider,
      path: repositoryPath,
      worktree,
      remoteUrl: gitlabRepository.web_url,
      slug: gitlabRepository.path_with_namespace,
      host: new URL(gitlabRepository.web_url).host,
      ...(gitlabRepository.default_branch
        ? { defaultBranch: gitlabRepository.default_branch }
        : branchResult.ok
          ? {
              defaultBranch: branchResult.stdout
                .trim()
                .replace(/^origin\//, ''),
            }
          : {}),
      ...(projectAccess !== undefined
        ? { permission: String(projectAccess) }
        : {}),
    }
  }
}
