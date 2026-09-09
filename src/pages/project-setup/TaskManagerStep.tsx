import { useEffect, useRef, useState } from 'react'
import {
  CodeIcon,
  GithubLogoIcon,
  WarningCircleIcon,
  WrenchIcon,
} from '@phosphor-icons/react'
import {
  integrationsResponseSchema,
  taskSourcesResponseSchema,
  type IntegrationProvider,
  type TaskSource,
} from '../../../shared/api/integrations'
import {
  AccountPicker,
  type AccountOption,
} from '../../components/AccountPicker'
import { InlineAlert } from '../../components/InlineAlert'
import {
  ProviderPicker,
  type ProviderOption,
} from '../../components/ProviderPicker'
import { TaskSourcePicker } from '../../components/TaskSourcePicker'
import { requestJson } from '../../lib/api'
import type { StepCommonProps } from './types'

const providerDefinitions: Array<Pick<ProviderOption, 'id' | 'name' | 'icon'>> =
  [
    {
      id: 'github-issues',
      name: 'GitHub Issues',
      icon: <GithubLogoIcon size={25} />,
    },
    {
      id: 'gitlab-issues',
      name: 'GitLab Issues',
      icon: <CodeIcon size={24} />,
    },
    {
      id: 'linear',
      name: 'Linear',
      icon: <WrenchIcon size={24} />,
    },
    {
      id: 'jira',
      name: 'Jira',
      icon: <WarningCircleIcon size={24} />,
    },
  ]

const statusBadge: Record<IntegrationProvider['status'], string> = {
  available: 'Dostępny',
  'not-installed': 'Brak CLI',
  'not-authenticated': 'Brak autoryzacji',
  unreachable: 'Brak połączenia',
  unsupported: 'Wkrótce',
  error: 'Błąd',
}

type Props = StepCommonProps & {
  value: string
  onChange: (value: string) => void
  account: string
  onAccountChange: (value: string) => void
  source: TaskSource | null
  onSourceChange: (source: TaskSource | null) => void
}

export const TaskManagerStep = ({
  value,
  onChange,
  account,
  onAccountChange,
  source,
  onSourceChange,
}: Props): React.JSX.Element => {
  const [detectedProviders, setDetectedProviders] = useState<
    IntegrationProvider[]
  >([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [sources, setSources] = useState<TaskSource[]>([])
  const [sourcesLoading, setSourcesLoading] = useState(true)
  const [sourcesError, setSourcesError] = useState('')
  const initialProvider = useRef(value)
  const selectedSource = useRef(source)

  useEffect(() => {
    selectedSource.current = source
  }, [source])

  useEffect(() => {
    let active = true
    requestJson('/api/integrations', integrationsResponseSchema)
      .then(({ providers }) => {
        if (!active) return
        setDetectedProviders(providers)
        setLoadError('')
        const selected = providers.find(
          (provider) => provider.id === initialProvider.current,
        )
        const fallback = providers.find(
          (provider) => provider.status === 'available',
        )
        const nextProvider =
          selected?.status === 'available' ? selected : fallback
        if (nextProvider && nextProvider.id !== initialProvider.current)
          onChange(nextProvider.id)
        const nextAccount = nextProvider?.accounts[0]
        if (nextAccount) {
          setSourcesLoading(true)
          onAccountChange(nextAccount.id)
        } else onAccountChange('')
      })
      .catch((error: unknown) => {
        if (active)
          setLoadError(
            error instanceof Error
              ? error.message
              : 'Nie udało się połączyć z backendem.',
          )
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [onAccountChange, onChange])

  useEffect(() => {
    if (!account || !['github-issues', 'gitlab-issues'].includes(value)) return
    let active = true
    requestJson(
      `/api/integrations/${encodeURIComponent(value)}/sources`,
      taskSourcesResponseSchema,
    )
      .then(({ sources: loadedSources }) => {
        if (!active) return
        setSources(loadedSources)
        const current = loadedSources.find(
          (item) => item.id === selectedSource.current?.id,
        )
        onSourceChange(current ?? loadedSources[0] ?? null)
      })
      .catch((error: unknown) => {
        if (!active) return
        setSources([])
        onSourceChange(null)
        setSourcesError(
          error instanceof Error
            ? error.message
            : 'Nie udało się pobrać projektów.',
        )
      })
      .finally(() => {
        if (active) setSourcesLoading(false)
      })
    return () => {
      active = false
    }
  }, [account, onSourceChange, value])

  const providerOptions: ProviderOption[] = providerDefinitions.map(
    (definition) => {
      const detected = detectedProviders.find(
        (provider) => provider.id === definition.id,
      )
      return {
        ...definition,
        description:
          detected?.message ??
          (detected?.status === 'available'
            ? `Połączono przez ${detected.cli?.command ?? 'CLI'}`
            : loading
              ? 'Sprawdzanie lokalnej integracji…'
              : 'Brak informacji o integracji.'),
        badge: detected ? statusBadge[detected.status] : undefined,
        available: detected?.status === 'available',
      }
    },
  )
  const selectedProvider = detectedProviders.find(
    (provider) => provider.id === value,
  )
  const accountOptions: AccountOption[] =
    selectedProvider?.accounts.map((option) => ({
      id: option.id,
      name: option.name ? `${option.name} (${option.login})` : option.login,
      description: `${option.host} · aktywne konto CLI`,
    })) ?? []
  const handleProviderChange = (provider: string) => {
    onChange(provider)
    onSourceChange(null)
    setSourcesLoading(true)
    setSourcesError('')
    const nextAccounts =
      detectedProviders.find((item) => item.id === provider)?.accounts ?? []
    onAccountChange(
      nextAccounts.some((option) => option.id === account)
        ? account
        : (nextAccounts[0]?.id ?? ''),
    )
  }
  const handleAccountChange = (nextAccount: string) => {
    onAccountChange(nextAccount)
    onSourceChange(null)
    setSourcesLoading(true)
    setSourcesError('')
  }
  return (
    <div className="grid gap-8">
      <section className="grid gap-5" aria-labelledby="task-manager-heading">
        <h3
          id="task-manager-heading"
          className="text-heading text-lg font-semibold"
        >
          Menedżer zadań
        </h3>
        <ProviderPicker
          label="Menedżer zadań"
          options={providerOptions}
          value={value}
          onChange={handleProviderChange}
        />
      </section>
      {loadError && <InlineAlert tone="danger">{loadError}</InlineAlert>}
      <section className="grid gap-5" aria-labelledby="task-account-heading">
        <h3
          id="task-account-heading"
          className="text-heading text-lg font-semibold"
        >
          Konto narzędzia
        </h3>
        <AccountPicker
          label="Konto narzędzia"
          options={accountOptions}
          value={account}
          onChange={handleAccountChange}
        />
      </section>
      {account && (
        <section className="grid gap-5" aria-labelledby="task-source-heading">
          <h3
            id="task-source-heading"
            className="text-heading text-lg font-semibold"
          >
            Projekt z taskami
          </h3>
          {sourcesLoading ? (
            <p className="text-muted px-4 py-3 text-sm">
              Pobieranie projektów…
            </p>
          ) : (
            <TaskSourcePicker
              options={sources}
              value={source?.id ?? ''}
              onChange={onSourceChange}
            />
          )}
          {sourcesError && (
            <InlineAlert tone="danger">{sourcesError}</InlineAlert>
          )}
        </section>
      )}
    </div>
  )
}
