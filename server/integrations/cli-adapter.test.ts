import { describe, expect, it } from 'vitest'
import type {
  CommandResult,
  CommandRunner,
} from '../infrastructure/command-runner.js'
import { createGitHubAdapter } from './github-cli.js'

const result = (values: Partial<CommandResult>): CommandResult => ({
  ok: true,
  stdout: '',
  stderr: '',
  timedOut: false,
  ...values,
})

const queuedRunner = (results: CommandResult[]): CommandRunner => ({
  async run() {
    const next = results.shift()
    if (!next) throw new Error('Unexpected command')
    return next
  },
})

describe('GitHub CLI adapter', () => {
  it('reads identity from provider API JSON', async () => {
    const adapter = createGitHubAdapter(
      queuedRunner([
        result({ stdout: 'gh version 2.80.0' }),
        result({
          stdout: JSON.stringify({
            login: 'octocat',
            name: 'The Octocat',
            html_url: 'https://github.com/octocat',
          }),
        }),
      ]),
    )
    await expect(adapter.detect()).resolves.toMatchObject({
      status: 'available',
      accounts: [
        {
          id: 'github-issues:github.com:octocat',
          login: 'octocat',
          host: 'github.com',
          active: true,
        },
      ],
    })
  })

  it('distinguishes a missing executable', async () => {
    const adapter = createGitHubAdapter(
      queuedRunner([result({ ok: false, errorCode: 'ENOENT' })]),
    )
    await expect(adapter.detect()).resolves.toMatchObject({
      status: 'not-installed',
      cli: { installed: false },
    })
  })

  it('does not expose authentication stderr', async () => {
    const adapter = createGitHubAdapter(
      queuedRunner([
        result({ stdout: 'gh version 2.80.0' }),
        result({
          ok: false,
          stderr: 'authentication token secret-value is invalid',
          exitCode: 1,
        }),
      ]),
    )
    const provider = await adapter.detect()
    expect(provider.status).toBe('not-authenticated')
    expect(JSON.stringify(provider)).not.toContain('secret-value')
  })

  it('maps accessible repositories to task sources', async () => {
    const adapter = createGitHubAdapter(
      queuedRunner([
        result({
          stdout: JSON.stringify([
            {
              full_name: 'octocat/pathdrasil',
              name: 'pathdrasil',
              html_url: 'https://github.com/octocat/pathdrasil',
              description: 'Local AI orchestrator',
              private: true,
            },
          ]),
        }),
      ]),
    )
    await expect(adapter.listSources()).resolves.toEqual([
      {
        id: 'octocat/pathdrasil',
        name: 'pathdrasil',
        fullName: 'octocat/pathdrasil',
        url: 'https://github.com/octocat/pathdrasil',
        description: 'Local AI orchestrator',
        private: true,
      },
    ])
  })
})
