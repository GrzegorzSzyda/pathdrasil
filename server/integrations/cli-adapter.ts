import type {
  IntegrationAccount,
  TaskSource,
} from '../../shared/api/integrations.js'
import type {
  AllowedCommand,
  CommandResult,
  CommandRunner,
} from '../infrastructure/command-runner.js'
import type { FailureStatus, Identity, IntegrationAdapter } from './types.js'

type CliAdapterOptions = {
  id: IntegrationAdapter['id']
  command: AllowedCommand
  providerName: string
  readIdentity(output: string): Identity
  listSources(): Promise<TaskSource[]>
}

const classifyFailure = (result: CommandResult): FailureStatus => {
  if (result.errorCode === 'ENOENT') return 'not-installed'
  if (result.timedOut) return 'unreachable'
  const output = `${result.stdout}\n${result.stderr}`
  if (
    /auth|login|log in|unauthorized|forbidden|401|403|token|credentials/i.test(
      output,
    )
  )
    return 'not-authenticated'
  if (
    /network|connect|connection|resolve|dns|timed?\s*out|502|503|504/i.test(
      output,
    )
  )
    return 'unreachable'
  return 'error'
}

const statusMessage = (status: FailureStatus, command: string): string => {
  if (status === 'not-installed')
    return `Nie znaleziono programu ${command} w PATH.`
  if (status === 'not-authenticated')
    return `Zaloguj się w ${command} i ponów sprawdzenie.`
  if (status === 'unreachable')
    return 'Nie udało się połączyć z providerem. Sprawdź sieć i spróbuj ponownie.'
  return `Nie udało się sprawdzić integracji ${command}.`
}

export const createCliAdapter = (
  runner: CommandRunner,
  options: CliAdapterOptions,
): IntegrationAdapter => ({
  id: options.id,
  listSources: options.listSources,
  async detect() {
    const versionResult = await runner.run({
      command: options.command,
      args: ['--version'],
    })
    if (!versionResult.ok) {
      const status = classifyFailure(versionResult)
      return {
        id: options.id,
        domain: 'task-manager',
        status,
        message: statusMessage(status, options.command),
        cli: {
          command: options.command,
          installed: status !== 'not-installed',
        },
        accounts: [],
      }
    }

    const version = versionResult.stdout.split('\n')[0]?.trim()
    const identityResult = await runner.run({
      command: options.command,
      args: ['api', 'user'],
    })
    if (!identityResult.ok) {
      const status = classifyFailure(identityResult)
      return {
        id: options.id,
        domain: 'task-manager',
        status,
        message: statusMessage(status, options.command),
        cli: {
          command: options.command,
          installed: true,
          ...(version ? { version } : {}),
        },
        accounts: [],
      }
    }

    try {
      const identity = options.readIdentity(identityResult.stdout)
      const account: IntegrationAccount = {
        ...identity,
        id: `${options.id}:${identity.host}:${identity.login}`,
        active: true,
      }
      return {
        id: options.id,
        domain: 'task-manager',
        status: 'available',
        cli: {
          command: options.command,
          installed: true,
          ...(version ? { version } : {}),
        },
        accounts: [account],
      }
    } catch {
      return {
        id: options.id,
        domain: 'task-manager',
        status: 'error',
        message: `${options.providerName} zwrócił nieobsługiwany format danych.`,
        cli: {
          command: options.command,
          installed: true,
          ...(version ? { version } : {}),
        },
        accounts: [],
      }
    }
  },
})
