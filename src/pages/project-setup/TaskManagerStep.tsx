import { useEffect, useState } from 'react'
import {
  CodeIcon,
  GithubLogoIcon,
  WarningCircleIcon,
  WrenchIcon,
} from '@phosphor-icons/react'
import {
  AccountPicker,
  type AccountOption,
} from '../../components/AccountPicker'
import {
  ProviderPicker,
  type ProviderOption,
} from '../../components/ProviderPicker'
import type { StepCommonProps } from './types'

const providers: ProviderOption[] = [
  {
    id: 'github-issues',
    name: 'GitHub Issues',
    description: 'Dostępne przez lokalnie autoryzowane gh',
    icon: <GithubLogoIcon size={25} />,
  },
  {
    id: 'gitlab-issues',
    name: 'GitLab Issues',
    description: 'Dostępne przez lokalnie autoryzowane glab',
    icon: <CodeIcon size={24} />,
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Integracja nie jest jeszcze obsługiwana w Pathdrasil',
    badge: 'Wkrótce',
    available: false,
    icon: <WrenchIcon size={24} />,
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Ten provider nie jest jeszcze obsługiwany',
    badge: 'Wkrótce',
    available: false,
    icon: <WarningCircleIcon size={24} />,
  },
]

type Props = StepCommonProps & {
  value: string
  onChange: (value: string) => void
  account: string
  onAccountChange: (value: string) => void
}

export const TaskManagerStep = ({
  value,
  onChange,
  account,
  onAccountChange,
}: Props): React.JSX.Element => {
  const [accountsByProvider, setAccountsByProvider] = useState<
    Record<string, AccountOption[]>
  >({})
  useEffect(() => {
    fetch('/api/integrations/accounts')
      .then(
        (response) =>
          response.json() as Promise<Record<string, AccountOption[]>>,
      )
      .then(setAccountsByProvider)
      .catch(() => setAccountsByProvider({}))
  }, [])
  const accountOptions = accountsByProvider[value] ?? []
  const handleProviderChange = (provider: string) => {
    onChange(provider)
    const nextAccounts = accountsByProvider[provider] ?? []
    onAccountChange(
      nextAccounts.some((option) => option.id === account)
        ? account
        : (nextAccounts[0]?.id ?? ''),
    )
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
          options={providers}
          value={value}
          onChange={handleProviderChange}
        />
      </section>
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
          onChange={onAccountChange}
        />
      </section>
    </div>
  )
}
