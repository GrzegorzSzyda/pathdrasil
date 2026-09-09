import { FormField } from '../../components/FormField'
import { InlineAlert } from '../../components/InlineAlert'
import { inputClassName } from '../../components/Input'
import type { StepCommonProps } from './types'

type Props = StepCommonProps & {
  taskLanguage: string
  repositoryLanguage: string
  pathdrasilLanguage: string
  autonomy: string
  permissions: {
    pushBranch: boolean
    createPullRequest: boolean
    merge: boolean
    respondToReview: boolean
    updateTask: boolean
    sendMessages: boolean
  }
  onTaskLanguageChange: (value: string) => void
  onRepositoryLanguageChange: (value: string) => void
  onPathdrasilLanguageChange: (value: string) => void
  onAutonomyChange: (value: string) => void
  onPermissionChange: (
    permission: keyof Props['permissions'],
    enabled: boolean,
  ) => void
}
export const RulesStep = ({
  taskLanguage,
  repositoryLanguage,
  pathdrasilLanguage,
  autonomy,
  permissions,
  onTaskLanguageChange,
  onRepositoryLanguageChange,
  onPathdrasilLanguageChange,
  onAutonomyChange,
  onPermissionChange,
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
    <FormField id="autonomy" label="Poziom autonomii">
      <select
        id="autonomy"
        className={inputClassName()}
        value={autonomy}
        onChange={(event) => onAutonomyChange(event.target.value)}
      >
        <option value="proponuj">Tylko proponuj</option>
        <option value="lokalnie">Pracuj lokalnie</option>
        <option value="publikuj-draft-pr-mr">
          Pracuj i wystaw draft PR/MR
        </option>
      </select>
    </FormField>
    <fieldset className="border-border grid gap-4 rounded-2xl border p-5">
      <legend className="text-heading px-2 text-sm font-semibold">
        Uprawnienia publikacji
      </legend>
      <p className="text-muted text-sm leading-relaxed">
        Domyślnie agent może wypchnąć branch i wystawić draft PR/MR. Pozostałe
        działania wymagają osobnego włączenia.
      </p>
      {[
        [
          'pushBranch',
          'Pushuj branch roboczy',
          'Wyślij zmiany na zdalny branch.',
        ],
        [
          'createPullRequest',
          'Wystawiaj i aktualizuj draft PR/MR',
          'Utwórz lub aktualizuj opis własnego PR/MR.',
        ],
        ['merge', 'Wykonuj merge', 'Scal zmiany do wybranej gałęzi.'],
        [
          'respondToReview',
          'Odpowiadaj na review',
          'Publikuj odpowiedzi w dyskusjach PR/MR.',
        ],
        ['updateTask', 'Aktualizuj task', 'Zmieniaj dane taska w providerze.'],
        ['sendMessages', 'Wysyłaj wiadomości', 'Pisz do ludzi i zespołów.'],
      ].map(([permission, label, description]) => (
        <label key={permission} className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="accent-brand mt-1 size-4"
            checked={permissions[permission as keyof typeof permissions]}
            onChange={(event) =>
              onPermissionChange(
                permission as keyof typeof permissions,
                event.target.checked,
              )
            }
          />
          <span>
            <span className="text-heading block font-semibold">{label}</span>
            <span className="text-muted mt-1 block">{description}</span>
          </span>
        </label>
      ))}
    </fieldset>
    <InlineAlert tone="warning">
      Uprawnienia publikowania i merge pozostają domyślnie po stronie
      użytkownika.
    </InlineAlert>
  </div>
)
