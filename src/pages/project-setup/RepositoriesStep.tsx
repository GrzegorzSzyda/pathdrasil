import {
  CodeIcon,
  FolderOpenIcon,
  GithubLogoIcon,
  XIcon,
} from '@phosphor-icons/react'
import { Button } from '../../components/Button'
import { FormField, TextInput } from '../../components/FormField'
import { InlineAlert } from '../../components/InlineAlert'
import {
  ProviderPicker,
  type ProviderOption,
} from '../../components/ProviderPicker'
import type { RepositoryDraft, StepCommonProps } from './types'

const providers: ProviderOption[] = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Repozytoria, pull requesty i checks przez gh',
    icon: <GithubLogoIcon size={25} />,
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description: 'Provider nie jest jeszcze obsługiwany',
    badge: 'Wkrótce',
    available: false,
    icon: <CodeIcon size={24} />,
  },
]

type Props = StepCommonProps & {
  provider: string
  onProviderChange: (value: string) => void
  repositories: RepositoryDraft[]
  onUpdate: (index: number, key: keyof RepositoryDraft, value: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
  onBrowse: (index: number) => void
  hasError: boolean
}

export const RepositoriesStep = ({
  provider,
  onProviderChange,
  repositories,
  onUpdate,
  onAdd,
  onRemove,
  onBrowse,
  hasError,
}: Props): React.JSX.Element => (
  <div className="grid gap-6">
    <ProviderPicker
      label="Provider repozytoriów"
      options={providers}
      value={provider}
      onChange={onProviderChange}
    />
    {repositories.map((repo, index) => (
      <div
        className="border-border bg-page-deep grid gap-5 rounded-2xl border p-5"
        key={index}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-heading font-semibold">
            Repozytorium {index + 1}
          </h3>
          {repositories.length > 1 && (
            <Button
              type="button"
              appearance="ghost"
              size="icon"
              aria-label={`Usuń repozytorium ${index + 1}`}
              onClick={() => onRemove(index)}
            >
              <XIcon aria-hidden="true" />
            </Button>
          )}
        </div>
        <FormField
          id={`repo-path-${index}`}
          label="Folder repozytorium"
          hint="Ścieżka dostępna dla lokalnego backendu"
          required
        >
          <div className="flex gap-2">
            <TextInput
              id={`repo-path-${index}`}
              value={repo.path}
              onChange={(event) => onUpdate(index, 'path', event.target.value)}
              placeholder="/home/użytkownik/projekt"
              hasError={Boolean(hasError && !repo.path)}
            />
            <Button
              type="button"
              appearance="outline"
              onClick={() => onBrowse(index)}
            >
              <FolderOpenIcon aria-hidden="true" /> Przeglądaj
            </Button>
          </div>
        </FormField>
        <FormField
          id={`worktree-path-${index}`}
          label="Katalog worktree"
          hint="Katalog roboczy dla agenta"
          required
        >
          <TextInput
            id={`worktree-path-${index}`}
            value={repo.worktree}
            onChange={(event) =>
              onUpdate(index, 'worktree', event.target.value)
            }
            placeholder="/home/użytkownik/worktrees"
          />
        </FormField>
      </div>
    ))}
    <Button type="button" appearance="outline" onClick={onAdd}>
      + Dodaj kolejne repozytorium
    </Button>
    <InlineAlert tone="info">
      Każde repozytorium może używać osobnego worktree.
    </InlineAlert>
  </div>
)
