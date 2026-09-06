import { FormField } from '../../components/FormField'
import { Input } from '../../components/Input'
import type { StepCommonProps } from './types'

type Props = StepCommonProps & {
  value: string
  onChange: (value: string) => void
  hasError: boolean
}

export const ProjectStep = ({
  value,
  onChange,
  hasError,
}: Props): React.JSX.Element => (
  <FormField id="project-name" label="Nazwa projektu" required>
    <Input
      id="project-name"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Nazwa projektu"
      hasError={hasError}
    />
  </FormField>
)
