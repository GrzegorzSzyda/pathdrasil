import type { IntegrationProvider } from '../../shared/api/integrations.js'
import type { CommandRunner } from '../infrastructure/command-runner.js'
import { createGitHubAdapter } from './github-cli.js'
import { createGitLabAdapter } from './gitlab-cli.js'
import type { IntegrationAdapter } from './types.js'

export type IntegrationRegistry = ReturnType<typeof createIntegrationRegistry>

const unsupportedProviders: IntegrationProvider[] = [
  {
    id: 'linear',
    domain: 'task-manager',
    status: 'unsupported',
    message: 'Integracja z Linear nie jest jeszcze obsługiwana.',
    accounts: [],
  },
  {
    id: 'jira',
    domain: 'task-manager',
    status: 'unsupported',
    message: 'Integracja z Jira nie jest jeszcze obsługiwana.',
    accounts: [],
  },
]

export const createIntegrationRegistry = (runner: CommandRunner) => {
  const adapters: IntegrationAdapter[] = [
    createGitHubAdapter(runner),
    createGitLabAdapter(runner),
  ]
  const byId = new Map(adapters.map((adapter) => [adapter.id, adapter]))
  return {
    get(id: string) {
      return byId.get(id as IntegrationAdapter['id'])
    },
    async detectAll(): Promise<IntegrationProvider[]> {
      const detected = await Promise.all(
        adapters.map((adapter) => adapter.detect()),
      )
      return [...detected, ...unsupportedProviders]
    },
  }
}
