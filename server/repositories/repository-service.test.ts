import { mkdir, mkdtemp, realpath } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type {
  CommandRequest,
  CommandRunner,
} from '../infrastructure/command-runner.js'
import { DirectoryService } from './directory-service.js'
import { RepositoryService } from './repository-service.js'

describe('RepositoryService', () => {
  it('recognizes a GitHub repository without invoking a shell', async () => {
    const root = await mkdtemp(resolve(tmpdir(), 'pathdrasil-repository-'))
    const repositoryDirectory = resolve(root, 'repository')
    await mkdir(repositoryDirectory)
    const repositoryPath = await realpath(repositoryDirectory)
    const requests: CommandRequest[] = []
    const runner: CommandRunner = {
      async run(request) {
        requests.push(request)
        const args = request.args.join(' ')
        if (args === 'rev-parse --show-toplevel')
          return {
            ok: true,
            stdout: repositoryPath,
            stderr: '',
            timedOut: false,
          }
        if (args === 'remote get-url origin')
          return {
            ok: true,
            stdout: 'git@github.com:octocat/pathdrasil.git',
            stderr: '',
            timedOut: false,
          }
        if (args.startsWith('repo view --json'))
          return {
            ok: true,
            stdout: JSON.stringify({
              nameWithOwner: 'octocat/pathdrasil',
              url: 'https://github.com/octocat/pathdrasil',
              defaultBranchRef: { name: 'main' },
              viewerPermission: 'ADMIN',
            }),
            stderr: '',
            timedOut: false,
          }
        return {
          ok: true,
          stdout: 'origin/main',
          stderr: '',
          timedOut: false,
        }
      },
    }
    const service = new RepositoryService(runner, new DirectoryService([root]))
    await expect(
      service.verify({
        provider: 'github',
        path: repositoryPath,
        worktree: resolve(root, 'worktrees'),
      }),
    ).resolves.toMatchObject({
      path: repositoryPath,
      slug: 'octocat/pathdrasil',
      host: 'github.com',
      defaultBranch: 'main',
    })
    expect(requests.map((request) => request.command)).toEqual([
      'git',
      'git',
      'git',
      'gh',
    ])
  })
})
