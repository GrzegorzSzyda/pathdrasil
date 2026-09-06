import { RobotIcon } from '@phosphor-icons/react'
import { InlineAlert } from '../../components/InlineAlert'
import {
  ProviderPicker,
  type ProviderOption,
} from '../../components/ProviderPicker'
import type { StepCommonProps } from './types'

const providers: ProviderOption[] = [
  {
    id: 'codex',
    name: 'Codex CLI',
    description: 'Lokalny agent wykrywany przez backend Pathdrasil',
    icon: <RobotIcon size={25} />,
  },
  {
    id: 'claude',
    name: 'Claude CLI',
    description: 'Provider nie jest jeszcze obsługiwany',
    badge: 'Wkrótce',
    available: false,
    icon: <RobotIcon size={25} />,
  },
]

type Props = StepCommonProps & {
  value: string
  onChange: (value: string) => void
}
export const AgentStep = ({ value, onChange }: Props): React.JSX.Element => (
  <div className="grid gap-6">
    <ProviderPicker
      label="Agent"
      options={providers}
      value={value}
      onChange={onChange}
    />
    <InlineAlert>
      Backend sprawdzi dostępność `codex` przed uruchomieniem pracy.
    </InlineAlert>
  </div>
)
