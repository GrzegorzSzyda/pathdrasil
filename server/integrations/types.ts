import type {
  IntegrationAccount,
  IntegrationProvider,
  IntegrationStatus,
  TaskSource,
} from '../../shared/api/integrations.js'

export type IntegrationAdapter = {
  id: 'github-issues' | 'gitlab-issues'
  detect(): Promise<IntegrationProvider>
  listSources(): Promise<TaskSource[]>
}

export type Identity = Omit<IntegrationAccount, 'id' | 'active'>

export type FailureStatus = Exclude<
  IntegrationStatus,
  'available' | 'unsupported'
>
