import { useEffect, useRef } from 'react'
import {
  CodeIcon,
  FolderOpenIcon,
  GithubLogoIcon,
  XIcon,
} from '@phosphor-icons/react'
import { Button } from '../../components/Button'
import { FormField } from '../../components/FormField'
import { Input } from '../../components/Input'
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
    description: 'Repozytoria i issues przez glab',
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
  onBrowse: (index: number, field: keyof RepositoryDraft) => void
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
}: Props): React.JSX.Element => {
  const firstBrowseRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!provider) return
    const frame = requestAnimationFrame(() => firstBrowseRef.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [provider])

  return (
    <div className="grid gap-6">
      <ProviderPicker
        label="Provider repozytoriów"
        options={providers}
        value={provider}
        onChange={onProviderChange}
      />
      {repositories.map((repo, index) => (
        <div className="bg-page-deep grid gap-5 rounded-2xl p-5" key={index}>
          {repositories.length > 1 && (
            <div className="flex justify-end">
              <Button
                type="button"
                appearance="ghost"
                size="icon"
                aria-label={`Usuń repozytorium ${index + 1}`}
                onClick={() => onRemove(index)}
              >
                <XIcon aria-hidden="true" />
              </Button>
            </div>
          )}
          <FormField id={`repo-path-${index}`} label="Repozytorium" required>
            <div className="flex gap-2">
              <Button
                ref={index === 0 ? firstBrowseRef : undefined}
                type="button"
                appearance="ghost"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') event.stopPropagation()
                }}
                onClick={() => onBrowse(index, 'path')}
              >
                <FolderOpenIcon aria-hidden="true" /> Przeglądaj
              </Button>
              <Input
                id={`repo-path-${index}`}
                value={repo.path}
                onChange={(event) =>
                  onUpdate(index, 'path', event.target.value)
                }
                hasError={Boolean(hasError && !repo.path)}
              />
            </div>
          </FormField>
          <FormField id={`worktree-path-${index}`} label="Worktree" required>
            <div className="flex gap-2">
              <Button
                type="button"
                appearance="ghost"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') event.stopPropagation()
                }}
                onClick={() => onBrowse(index, 'worktree')}
              >
                <FolderOpenIcon aria-hidden="true" /> Przeglądaj
              </Button>
              <Input
                id={`worktree-path-${index}`}
                value={repo.worktree}
                onChange={(event) =>
                  onUpdate(index, 'worktree', event.target.value)
                }
              />
            </div>
          </FormField>
        </div>
      ))}
      <Button type="button" appearance="ghost" onClick={onAdd}>
        + Dodaj kolejne repozytorium
      </Button>
    </div>
  )
}
