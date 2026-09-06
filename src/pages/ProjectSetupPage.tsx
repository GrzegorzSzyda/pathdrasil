import { useEffect, useRef, useState } from 'react'
import { Dialog } from '../components/Dialog'
import { SetupLayout, type SetupStep } from '../components/SetupLayout'
import { TaskManagerStatesPage } from './TaskManagerStatesPage'
import { AgentStep } from './project-setup/AgentStep'
import { ProjectStep } from './project-setup/ProjectStep'
import { RepositoriesStep } from './project-setup/RepositoriesStep'
import { RulesStep } from './project-setup/RulesStep'
import { SummaryStep } from './project-setup/SummaryStep'
import { TaskManagerStep } from './project-setup/TaskManagerStep'
import type { RepositoryDraft } from './project-setup/types'

const steps: SetupStep[] = [
  { title: 'Projekt', description: 'Podstawowe informacje' },
  { title: 'Task manager', description: 'Źródło tasków' },
  { title: 'Repozytoria', description: 'Kod i worktree' },
  { title: 'Agent', description: 'Wykonawca pracy' },
  { title: 'Reguły', description: 'Język i autonomia' },
  { title: 'Podsumowanie', description: 'Sprawdź i utwórz' },
]

type ProjectSetupPageProps = { onCancel: () => void; onComplete: () => void }

export const ProjectSetupPage = ({
  onCancel,
  onComplete,
}: ProjectSetupPageProps): React.JSX.Element => {
  const [activeStep, setActiveStep] = useState(0)
  const [projectName, setProjectName] = useState('')
  const [taskProvider, setTaskProvider] = useState('github-issues')
  const [taskAccount, setTaskAccount] = useState('gh-grzegorz')
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
  const [taskStatesOpen, setTaskStatesOpen] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const firstControl = document.querySelector<HTMLElement>(
      '#setup-content input:not([disabled]), #setup-content select:not([disabled]), #setup-content textarea:not([disabled]), #setup-content button:not([disabled])',
    )
    if (firstControl) firstControl.focus()
    else headingRef.current?.focus()
  }, [activeStep])

  const canContinue = (step: number): boolean => {
    if (step === 0) return projectName.trim().length > 0
    if (step === 1) return Boolean(taskProvider && taskAccount)
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
    if (activeStep === steps.length - 1) return onComplete()
    setActiveStep((step) => step + 1)
  }

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
      if (taskStatesOpen) {
        if (event.key === 'Escape' || event.key === 'Backspace') {
          event.preventDefault()
          setTaskStatesOpen(false)
        }
        return
      }
      if (directoryIndex !== null) return
      if (/^[1-6]$/.test(event.key) && !editing) {
        const requestedStep = Number(event.key) - 1
        if (requestedStep <= activeStep) {
          event.preventDefault()
          setError('')
          setActiveStep(requestedStep)
        }
        return
      }
      if (event.key === 'Enter' && target.tagName !== 'TEXTAREA') {
        event.preventDefault()
        advance()
        return
      }
      if ((event.key === 'Escape' || event.key === 'Backspace') && !editing) {
        event.preventDefault()
        if (activeStep === 0) onCancel()
        else setActiveStep((step) => step - 1)
        setError('')
        return
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

  const descriptions = [
    'Utwórz odseparowaną przestrzeń dla tasków, repozytoriów i agentów.',
    'Wybierz narzędzie i konto, z którego Pathdrasil będzie pobierał taski.',
    'Dodaj jedno lub więcej repozytoriów należących do tego projektu.',
    'Wybierz lokalnego agenta, który będzie wykonywał zaplanowaną pracę.',
    'Ustal domyślny język i poziom autonomii dla tego projektu.',
    'Sprawdź konfigurację. Projekt zostanie zapisany dopiero po zatwierdzeniu.',
  ]

  if (taskStatesOpen)
    return <TaskManagerStatesPage onBack={() => setTaskStatesOpen(false)} />

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
          {descriptions[activeStep]}
        </p>
        {activeStep === 0 && (
          <ProjectStep
            value={projectName}
            onChange={(value) => {
              setProjectName(value)
              setError('')
            }}
            hasError={Boolean(error)}
            shortcutsVisible={shortcutsVisible}
          />
        )}
        {activeStep === 1 && (
          <TaskManagerStep
            value={taskProvider}
            onChange={setTaskProvider}
            account={taskAccount}
            onAccountChange={setTaskAccount}
            onOpenStates={() => setTaskStatesOpen(true)}
            shortcutsVisible={shortcutsVisible}
          />
        )}
        {activeStep === 2 && (
          <RepositoriesStep
            provider={repoProvider}
            onProviderChange={setRepoProvider}
            repositories={repositories}
            onUpdate={updateRepository}
            onAdd={() =>
              setRepositories((items) => [...items, { path: '', worktree: '' }])
            }
            onRemove={(index) =>
              setRepositories((items) =>
                items.filter((_, itemIndex) => itemIndex !== index),
              )
            }
            onBrowse={setDirectoryIndex}
            hasError={Boolean(error)}
            shortcutsVisible={shortcutsVisible}
          />
        )}
        {activeStep === 3 && (
          <AgentStep
            value={agent}
            onChange={setAgent}
            shortcutsVisible={shortcutsVisible}
          />
        )}
        {activeStep === 4 && (
          <RulesStep
            language={language}
            autonomy={autonomy}
            onLanguageChange={setLanguage}
            onAutonomyChange={setAutonomy}
            shortcutsVisible={shortcutsVisible}
          />
        )}
        {activeStep === 5 && (
          <SummaryStep
            projectName={projectName}
            repositoriesCount={repositories.length}
            language={language}
            autonomy={
              autonomy === 'pytaj-przed-publikacja'
                ? 'pytaj przed publikacją'
                : autonomy
            }
          />
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
