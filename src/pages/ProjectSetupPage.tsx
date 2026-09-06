import { useEffect, useRef, useState } from 'react'
import {
  CheckCircleIcon,
  CodeIcon,
  FolderOpenIcon,
  GithubLogoIcon,
  RobotIcon,
  SlidersHorizontalIcon,
  WrenchIcon,
  XIcon,
} from '@phosphor-icons/react'
import { Button } from '../components/Button'
import { Dialog } from '../components/Dialog'
import { FormField, TextInput, fieldClassName } from '../components/FormField'
import { InlineAlert } from '../components/InlineAlert'
import {
  ProviderPicker,
  type ProviderOption,
} from '../components/ProviderPicker'
import { SetupLayout, type SetupStep } from '../components/SetupLayout'

type RepositoryDraft = { path: string; worktree: string }

const steps: SetupStep[] = [
  { title: 'Projekt', description: 'Podstawowe informacje' },
  { title: 'Task manager', description: 'Źródło tasków' },
  { title: 'Repozytoria', description: 'Kod i worktree' },
  { title: 'Agent', description: 'Wykonawca pracy' },
  { title: 'Reguły', description: 'Język i autonomia' },
  { title: 'Podsumowanie', description: 'Sprawdź i utwórz' },
]

const taskProviders: ProviderOption[] = [
  {
    id: 'github-issues',
    name: 'GitHub Issues',
    description: 'Issues i statusy przez lokalnie autoryzowane gh',
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
]

const repoProviders: ProviderOption[] = [
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

const agentProviders: ProviderOption[] = [
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

type ProjectSetupPageProps = { onCancel: () => void; onComplete: () => void }

export const ProjectSetupPage = ({
  onCancel,
  onComplete,
}: ProjectSetupPageProps): React.JSX.Element => {
  const [activeStep, setActiveStep] = useState(0)
  const [projectName, setProjectName] = useState('')
  const [taskProvider, setTaskProvider] = useState('github-issues')
  const [repoProvider, setRepoProvider] = useState('github')
  const [repositories, setRepositories] = useState<RepositoryDraft[]>([
    { path: '', worktree: '' },
  ])
  const [agent, setAgent] = useState('codex')
  const [language, setLanguage] = useState('Polski')
  const [autonomy, setAutonomy] = useState('pytaj-przed-publikacja')
  const [error, setError] = useState('')
  const [shortcutsVisible, setShortcutsVisible] = useState(false)
  const [directoryIndex, setDirectoryIndex] = useState<number | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const firstControl = document.querySelector<HTMLElement>(
      '#setup-content input:not([disabled]), #setup-content select:not([disabled]), #setup-content textarea:not([disabled]), #setup-content button:not([disabled])',
    )
    if (firstControl) firstControl.focus()
    else headingRef.current?.focus()
  }, [activeStep])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const editing =
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
        target.isContentEditable
      if (event.key === '?' && !editing) {
        event.preventDefault()
        setShortcutsVisible((visible) => !visible)
      }
      if (directoryIndex !== null) return
      if ((event.key === 'Escape' || event.key === 'Backspace') && !editing) {
        event.preventDefault()
        if (activeStep === 0) onCancel()
        else setActiveStep((step) => step - 1)
        setError('')
        return
      }
      if (event.altKey && event.key === 'ArrowLeft' && activeStep > 0) {
        event.preventDefault()
        setError('')
        setActiveStep((step) => step - 1)
      }
      if (
        event.altKey &&
        event.key === 'ArrowRight' &&
        canContinue(activeStep)
      ) {
        event.preventDefault()
        advance()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  })

  const canContinue = (step: number): boolean => {
    if (step === 0) return projectName.trim().length > 0
    if (step === 1) return Boolean(taskProvider)
    if (step === 2)
      return (
        repositories.length > 0 &&
        repositories.every((repo) => repo.path.trim() && repo.worktree.trim())
      )
    if (step === 3) return Boolean(agent)
    return true
  }

  const validate = (): boolean => {
    if (activeStep === 0 && !projectName.trim())
      return (setError('Podaj nazwę projektu.'), false)
    if (
      activeStep === 2 &&
      repositories.some((repo) => !repo.path.trim() || !repo.worktree.trim())
    )
      return (
        setError('Uzupełnij ścieżkę repozytorium i katalog worktree.'),
        false
      )
    setError('')
    return true
  }

  const advance = () => {
    if (!validate()) return
    if (activeStep === steps.length - 1) {
      onComplete()
      return
    }
    setActiveStep((step) => step + 1)
  }

  const updateRepository = (
    index: number,
    key: keyof RepositoryDraft,
    value: string,
  ) => {
    setRepositories((items) =>
      items.map((repo, itemIndex) =>
        itemIndex === index ? { ...repo, [key]: value } : repo,
      ),
    )
    setError('')
  }

  return (
    <>
      <SetupLayout
        steps={steps}
        activeStep={activeStep}
        onStepChange={(step) => {
          setError('')
          setActiveStep(step)
        }}
        onBack={() =>
          activeStep > 0 ? setActiveStep((step) => step - 1) : onCancel()
        }
        onNext={advance}
        canNext={canContinue(activeStep)}
        nextLabel={activeStep === steps.length - 1 ? 'Utwórz projekt' : 'Dalej'}
        shortcutsVisible={shortcutsVisible}
      >
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-heading text-4xl font-semibold tracking-tight outline-none sm:text-5xl"
        >
          {steps[activeStep].title}
        </h2>
        <p className="text-muted mt-4 mb-8 text-base leading-relaxed">
          {activeStep === 0 &&
            'Utwórz odseparowaną przestrzeń dla tasków, repozytoriów i agentów.'}
          {activeStep === 1 &&
            'Wybierz narzędzie, z którego Pathdrasil będzie pobierał taski.'}
          {activeStep === 2 &&
            'Dodaj jedno lub więcej repozytoriów należących do tego projektu.'}
          {activeStep === 3 &&
            'Wybierz lokalnego agenta, który będzie wykonywał zaplanowaną pracę.'}
          {activeStep === 4 &&
            'Ustal domyślny język i poziom autonomii dla tego projektu.'}
          {activeStep === 5 &&
            'Sprawdź konfigurację. Projekt zostanie zapisany dopiero po zatwierdzeniu.'}
        </p>

        {activeStep === 0 && (
          <div className="grid gap-6">
            <FormField
              id="project-name"
              label="Nazwa projektu"
              hint="Np. Pathdrasil — rozwój aplikacji"
              required
            >
              <TextInput
                id="project-name"
                value={projectName}
                onChange={(event) => {
                  setProjectName(event.target.value)
                  setError('')
                }}
                placeholder="Nazwa projektu"
                hasError={Boolean(error)}
              />
            </FormField>
            <InlineAlert>
              Projekt pozostaje lokalny. Integracje użyją autoryzacji narzędzi
              dostępnych na tym komputerze.
            </InlineAlert>
          </div>
        )}

        {activeStep === 1 && (
          <div className="grid gap-6">
            <ProviderPicker
              label="Task manager"
              options={taskProviders}
              value={taskProvider}
              onChange={setTaskProvider}
            />
            <InlineAlert tone="info">
              GitHub Issues zostanie zweryfikowane przez `gh` przed pierwszą
              synchronizacją.
            </InlineAlert>
          </div>
        )}

        {activeStep === 2 && (
          <div className="grid gap-6">
            <ProviderPicker
              label="Provider repozytoriów"
              options={repoProviders}
              value={repoProvider}
              onChange={setRepoProvider}
            />
            {repositories.map((repo, index) => (
              <div
                className="border-border bg-page-deep grid gap-5 rounded-2xl border p-5"
                key={index}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-heading font-semibold">
                    Repozytorium {index + 1}
                  </h2>
                  {repositories.length > 1 && (
                    <Button
                      type="button"
                      appearance="ghost"
                      size="icon"
                      aria-label={`Usuń repozytorium ${index + 1}`}
                      onClick={() =>
                        setRepositories((items) =>
                          items.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
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
                      onChange={(event) =>
                        updateRepository(index, 'path', event.target.value)
                      }
                      placeholder="/home/użytkownik/projekt"
                      hasError={Boolean(error && !repo.path)}
                    />
                    <Button
                      type="button"
                      appearance="outline"
                      onClick={() => setDirectoryIndex(index)}
                    >
                      <FolderOpenIcon aria-hidden="true" /> Przeglądaj
                    </Button>
                  </div>
                </FormField>
                <FormField
                  id={`worktree-path-${index}`}
                  label="Katalog worktree"
                  hint="Katalog, w którym agent utworzy robocze worktree"
                  required
                >
                  <TextInput
                    id={`worktree-path-${index}`}
                    value={repo.worktree}
                    onChange={(event) =>
                      updateRepository(index, 'worktree', event.target.value)
                    }
                    placeholder="/home/użytkownik/worktrees"
                  />
                </FormField>
              </div>
            ))}
            <Button
              type="button"
              appearance="outline"
              onClick={() =>
                setRepositories((items) => [
                  ...items,
                  { path: '', worktree: '' },
                ])
              }
            >
              + Dodaj kolejne repozytorium
            </Button>
            <InlineAlert tone="info">
              Weryfikacja ścieżek i remote odbędzie się przez `git` i lokalnie
              autoryzowane `gh`.
            </InlineAlert>
          </div>
        )}

        {activeStep === 3 && (
          <div className="grid gap-6">
            <ProviderPicker
              label="Agent"
              options={agentProviders}
              value={agent}
              onChange={setAgent}
            />
            <InlineAlert>
              Pathdrasil nie kopiuje tokenów agenta. Backend sprawdzi dostępność
              `codex` przed uruchomieniem pracy.
            </InlineAlert>
          </div>
        )}

        {activeStep === 4 && (
          <div className="grid gap-6">
            <FormField id="language" label="Domyślny język projektu">
              <select
                id="language"
                className={fieldClassName()}
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
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
                onChange={(event) => setAutonomy(event.target.value)}
              >
                <option value="proponuj">Tylko proponuj</option>
                <option value="lokalnie">Pracuj lokalnie</option>
                <option value="pytaj-przed-publikacja">
                  Pytaj przed publikacją
                </option>
              </select>
            </FormField>
            <InlineAlert tone="warning">
              Uprawnienia publikowania i merge pozostają domyślnie po stronie
              użytkownika.
            </InlineAlert>
          </div>
        )}

        {activeStep === 5 && (
          <div className="border-border divide-border bg-page-deep divide-y rounded-2xl border">
            <SummaryRow
              label="Projekt"
              value={projectName || '—'}
              icon={<SlidersHorizontalIcon />}
            />
            <SummaryRow
              label="Task manager"
              value="GitHub Issues"
              icon={<GithubLogoIcon />}
            />
            <SummaryRow
              label="Repozytoria"
              value={`${repositories.length} ${repositories.length === 1 ? 'repozytorium' : 'repozytoria'}`}
              icon={<CodeIcon />}
            />
            <SummaryRow label="Agent" value="Codex CLI" icon={<RobotIcon />} />
            <SummaryRow
              label="Język / autonomia"
              value={`${language} · ${autonomy === 'pytaj-przed-publikacja' ? 'pytaj przed publikacją' : autonomy}`}
              icon={<CheckCircleIcon />}
            />
          </div>
        )}
        {error && (
          <p className="text-danger mt-5 text-sm" role="alert">
            {error}
          </p>
        )}
      </SetupLayout>
      <Dialog
        open={directoryIndex !== null}
        onClose={() => setDirectoryIndex(null)}
        title="Wybierz folder"
      >
        <p className="text-muted mb-4 text-sm">
          W wersji backendowej lista będzie pochodziła z lokalnego systemu
          plików.
        </p>
        <div className="grid gap-2">
          {['/home', '/home/grzegorzszyda/Projekty', '/mnt/c/Users'].map(
            (path) => (
              <button
                key={path}
                type="button"
                className="border-border bg-page-deep text-heading hover:bg-surface rounded-xl border px-4 py-3 text-left text-sm"
                onClick={() => {
                  if (directoryIndex !== null)
                    updateRepository(directoryIndex, 'path', path)
                  setDirectoryIndex(null)
                }}
              >
                {path}
              </button>
            ),
          )}
        </div>
      </Dialog>
    </>
  )
}

const SummaryRow = ({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: React.ReactNode
}): React.JSX.Element => (
  <div className="flex items-center justify-between gap-4 px-5 py-4">
    <span className="text-muted flex items-center gap-3 text-sm">
      <span className="text-brand">{icon}</span>
      {label}
    </span>
    <strong className="text-heading text-right text-sm">{value}</strong>
  </div>
)
