import {
  CodeIcon,
  GithubLogoIcon,
  WarningCircleIcon,
  WrenchIcon,
  ArrowSquareOutIcon,
} from '@phosphor-icons/react'
import { Button } from '../../components/Button'
import { FormField, fieldClassName } from '../../components/FormField'
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
    id: 'linear',
    name: 'Linear',
    description: 'Integracja przez API będzie dostępna później',
    badge: 'Wkrótce',
    available: false,
    icon: <WrenchIcon size={24} />,
  },
  {
    id: 'gitlab-issues',
    name: 'GitLab Issues',
    description: 'Nie znaleziono autoryzowanego narzędzia GitLab CLI',
    badge: 'Brak autoryzacji',
    available: false,
    icon: <CodeIcon size={24} />,
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Provider zwrócił błąd połączenia',
    badge: 'Błąd połączenia',
    available: false,
    icon: <WarningCircleIcon size={24} />,
  },
]

type Props = StepCommonProps & {
  value: string
  onChange: (value: string) => void
  account: string
  onAccountChange: (value: string) => void
  onOpenStates: () => void
}

export const TaskManagerStep = ({
  value,
  onChange,
  account,
  onAccountChange,
  onOpenStates,
}: Props): React.JSX.Element => (
  <div className="grid gap-8">
    <ProviderPicker
      label="Task manager"
      options={providers}
      value={value}
      onChange={onChange}
    />
    <FormField
      id="task-account"
      label="Konto narzędzia"
      hint="Wybierz profil wykryty lokalnie przez CLI."
    >
      <select
        id="task-account"
        className={fieldClassName()}
        value={account}
        onChange={(event) => onAccountChange(event.target.value)}
      >
        <option value="gh-grzegorz">GitHub · GrzegorzSzyda (gh)</option>
        <option value="gh-work">GitHub · konto firmowe (gh)</option>
        <option value="gl-personal">GitLab · konto prywatne (glab)</option>
      </select>
    </FormField>
    <Button type="button" appearance="outline" onClick={onOpenStates}>
      <ArrowSquareOutIcon aria-hidden="true" /> Zobacz stany integracji
    </Button>
  </div>
)
