import { FormField, TextInput } from '../../components/FormField'
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
    <TextInput
      id="project-name"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Nazwa projektu"
      hasError={hasError}
    />
  </FormField>
)
