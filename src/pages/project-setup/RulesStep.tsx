import { FormField, fieldClassName } from '../../components/FormField'
import { InlineAlert } from '../../components/InlineAlert'
import type { StepCommonProps } from './types'

type Props = StepCommonProps & {
  language: string
  autonomy: string
  onLanguageChange: (value: string) => void
  onAutonomyChange: (value: string) => void
}
export const RulesStep = ({
  language,
  autonomy,
  onLanguageChange,
  onAutonomyChange,
}: Props): React.JSX.Element => (
  <div className="grid gap-6">
    <FormField id="language" label="Domyślny język projektu">
      <select
        id="language"
        className={fieldClassName()}
        value={language}
        onChange={(event) => onLanguageChange(event.target.value)}
      >
        <option>Polski</option>
        <option>English</option>
      </select>
    </FormField>
    <FormField id="autonomy" label="Poziom autonomii">
      <select
        id="autonomy"
        className={fieldClassName()}
        value={autonomy}
        onChange={(event) => onAutonomyChange(event.target.value)}
      >
        <option value="proponuj">Tylko proponuj</option>
        <option value="lokalnie">Pracuj lokalnie</option>
        <option value="pytaj-przed-publikacja">Pytaj przed publikacją</option>
      </select>
    </FormField>
    <InlineAlert tone="warning">
      Uprawnienia publikowania i merge pozostają domyślnie po stronie
      użytkownika.
    </InlineAlert>
  </div>
)
