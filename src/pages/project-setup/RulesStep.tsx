import { CheckCircleIcon } from '@phosphor-icons/react'
import { FormField } from '../../components/FormField'
import { inputClassName } from '../../components/Input'
import type { StepCommonProps } from './types'

type Props = StepCommonProps & {
  taskLanguage: string
  repositoryLanguage: string
  pathdrasilLanguage: string
  onTaskLanguageChange: (value: string) => void
  onRepositoryLanguageChange: (value: string) => void
  onPathdrasilLanguageChange: (value: string) => void
}
export const RulesStep = ({
  taskLanguage,
  repositoryLanguage,
  pathdrasilLanguage,
  onTaskLanguageChange,
  onRepositoryLanguageChange,
  onPathdrasilLanguageChange,
}: Props): React.JSX.Element => (
  <div className="grid gap-6">
    <FormField
      id="task-language"
      label="Język task managera"
      hint="Tytuły, opisy, komentarze i kryteria akceptacji tasków."
    >
      <select
        id="task-language"
        className={inputClassName()}
        value={taskLanguage}
        onChange={(event) => onTaskLanguageChange(event.target.value)}
      >
        <option>Polski</option>
        <option>English</option>
      </select>
    </FormField>
    <FormField
      id="repository-language"
      label="Język repozytorium"
      hint="Commity, pull requesty i dokumentacja techniczna."
    >
      <select
        id="repository-language"
        className={inputClassName()}
        value={repositoryLanguage}
        onChange={(event) => onRepositoryLanguageChange(event.target.value)}
      >
        <option>Polski</option>
        <option>English</option>
      </select>
    </FormField>
    <FormField
      id="pathdrasil-language"
      label="Język pracy w Pathdrasilu"
      hint="Rozmowy z agentami, plany, pytania i podsumowania pracy."
    >
      <select
        id="pathdrasil-language"
        className={inputClassName()}
        value={pathdrasilLanguage}
        onChange={(event) => onPathdrasilLanguageChange(event.target.value)}
      >
        <option>Polski</option>
        <option>English</option>
      </select>
    </FormField>
    <section
      className="border-border grid gap-4 rounded-2xl border p-5"
      aria-labelledby="agent-access-heading"
    >
      <h3
        id="agent-access-heading"
        className="text-heading text-sm font-semibold"
      >
        Zakres działania agenta
      </h3>
      <p className="text-muted text-sm leading-relaxed">
        Na tym etapie Pathdrasil korzysta z jednego, stałego profilu. Agent
        otrzyma następujące możliwości:
      </p>
      {[
        ['Praca lokalna w kodzie', 'Edycja plików i uruchamianie narzędzi.'],
        [
          'Aktualizowanie tasków w źródle',
          'Zmiana danych taska w wybranym menedżerze zadań.',
        ],
        [
          'Publikowanie zmian na branchach',
          'Push brancha oraz utworzenie lub aktualizacja draft PR/MR.',
        ],
      ].map(([label, description]) => (
        <div key={label} className="flex items-start gap-3 text-sm">
          <CheckCircleIcon
            className="text-brand mt-0.5 shrink-0"
            size={18}
            weight="fill"
            aria-hidden="true"
          />
          <span>
            <span className="text-heading block font-semibold">{label}</span>
            <span className="text-muted mt-1 block">{description}</span>
          </span>
        </div>
      ))}
    </section>
  </div>
)
