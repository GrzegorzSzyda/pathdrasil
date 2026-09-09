import { useEffect, useRef, useState } from 'react'
import type { TaskSource } from '../../shared/api/integrations'
import {
  createProjectRequestSchema,
  projectSchema,
} from '../../shared/api/projects'
import {
  directoryListingSchema,
  type DirectoryListing,
} from '../../shared/api/repositories'
import { DirectoryPickerDialog } from '../components/DirectoryPickerDialog'
import { SetupLayout, type SetupStep } from '../components/SetupLayout'
import { requestJson } from '../lib/api'
import { AgentStep } from './project-setup/AgentStep'
import { ProjectStep } from './project-setup/ProjectStep'
import { RepositoriesStep } from './project-setup/RepositoriesStep'
import { RulesStep } from './project-setup/RulesStep'
import { SummaryStep } from './project-setup/SummaryStep'
import { TaskManagerStep } from './project-setup/TaskManagerStep'
import type { RepositoryDraft } from './project-setup/types'

const steps: SetupStep[] = [
  { title: 'Projekt' },
  { title: 'Menedżer zadań' },
  { title: 'Repozytoria' },
  { title: 'Agent' },
  { title: 'Reguły' },
  { title: 'Podsumowanie' },
]

type ProjectSetupPageProps = {
  onCancel: () => void
  onComplete: (projectId: string) => void
}

type DirectoryTarget = {
  index: number
  field: 'path' | 'worktree'
}

export const ProjectSetupPage = ({
  onCancel,
  onComplete,
}: ProjectSetupPageProps): React.JSX.Element => {
  const [activeStep, setActiveStep] = useState(0)
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(0)
  const [projectName, setProjectName] = useState('')
  const [taskProvider, setTaskProvider] = useState('')
  const [taskAccount, setTaskAccount] = useState('')
  const [taskSource, setTaskSource] = useState<TaskSource | null>(null)
  const [repoProvider, setRepoProvider] = useState('')
  const [repositories, setRepositories] = useState<RepositoryDraft[]>([
    { path: '', worktree: '' },
  ])
  const [agent, setAgent] = useState('codex')
  const [taskLanguage, setTaskLanguage] = useState('Polski')
  const [repositoryLanguage, setRepositoryLanguage] = useState('English')
  const [pathdrasilLanguage, setPathdrasilLanguage] = useState('Polski')
  const [autonomy, setAutonomy] = useState('publikuj-draft-pr-mr')
  const [permissions, setPermissions] = useState({
    pushBranch: true,
    createPullRequest: true,
    merge: false,
    respondToReview: false,
    updateTask: false,
    sendMessages: false,
  })
  const [error, setError] = useState('')
  const [shortcutsVisible, setShortcutsVisible] = useState(false)
  const [directoryTarget, setDirectoryTarget] =
    useState<DirectoryTarget | null>(null)
  const [directoryListing, setDirectoryListing] =
    useState<DirectoryListing | null>(null)
  const [directoryError, setDirectoryError] = useState('')
  const [directoryLoading, setDirectoryLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
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
    if (step === 1) return Boolean(taskProvider && taskAccount && taskSource)
    if (step === 2)
      return (
        Boolean(repoProvider) &&
        repositories.length > 0 &&
        repositories.every((repo) => repo.path.trim() && repo.worktree.trim())
      )
    if (step === 3) return Boolean(agent)
    return true
  }

  const validate = (): boolean => {
    if (activeStep === 0 && !projectName.trim())
      return (setError('Podaj nazwę projektu.'), false)
    if (activeStep === 2 && !repoProvider)
      return (setError('Wybierz provider repozytoriów.'), false)
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

  const createProject = async () => {
    setSubmitting(true)
    setError('')
    try {
      const input = createProjectRequestSchema.parse({
        name: projectName,
        taskManager: {
          providerId: taskProvider,
          accountId: taskAccount,
          sources: taskSource ? [taskSource] : [],
        },
        repositories: repositories.map((repository) => ({
          ...repository,
          provider: repoProvider,
        })),
        agent: { id: agent },
        rules: {
          taskLanguage,
          repositoryLanguage,
          pathdrasilLanguage,
          autonomy,
          permissions,
        },
      })
      const project = await requestJson('/api/projects', projectSchema, {
        method: 'POST',
        body: JSON.stringify(input),
      })
      onComplete(project.id)
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Nie udało się utworzyć projektu.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const advance = () => {
    if (submitting) return
    if (!validate()) return
    if (activeStep === steps.length - 1) {
      void createProject()
      return
    }
    setMaxUnlockedStep((step) => Math.max(step, activeStep + 1))
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
      if (directoryTarget !== null) return
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancel()
        setError('')
        return
      }
      if (/^[1-6]$/.test(event.key) && !editing) {
        const requestedStep = Number(event.key) - 1
        if (requestedStep <= maxUnlockedStep) {
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
      if (event.key === 'Backspace' && !editing) {
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

  const openDirectory = async (target: DirectoryTarget, path?: string) => {
    setDirectoryTarget(target)
    setDirectoryError('')
    setDirectoryLoading(true)
    if (!path) setDirectoryListing(null)
    try {
      const query = path ? `?path=${encodeURIComponent(path)}` : ''
      setDirectoryListing(
        await requestJson(`/api/directories${query}`, directoryListingSchema),
      )
    } catch (caught) {
      setDirectoryError(
        caught instanceof Error
          ? caught.message
          : 'Nie udało się odczytać katalogu.',
      )
    } finally {
      setDirectoryLoading(false)
    }
  }

  return (
    <>
      <SetupLayout
        steps={steps}
        activeStep={activeStep}
        maxUnlockedStep={maxUnlockedStep}
        onStepChange={(step) => {
          setError('')
          if (step <= maxUnlockedStep) setActiveStep(step)
        }}
        onBack={() =>
          activeStep > 0 ? setActiveStep((step) => step - 1) : onCancel()
        }
        onNext={advance}
        canNext={canContinue(activeStep) && !submitting}
        nextLabel={
          activeStep === steps.length - 1
            ? submitting
              ? 'Tworzenie…'
              : 'Utwórz projekt'
            : 'Dalej'
        }
        shortcutsVisible={shortcutsVisible}
      >
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-heading mb-8 text-4xl font-semibold tracking-tight outline-none sm:text-5xl"
        >
          {steps[activeStep].title}
        </h2>
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
            source={taskSource}
            onSourceChange={setTaskSource}
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
            onBrowse={(index, field) => void openDirectory({ index, field })}
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
            taskLanguage={taskLanguage}
            repositoryLanguage={repositoryLanguage}
            pathdrasilLanguage={pathdrasilLanguage}
            autonomy={autonomy}
            permissions={permissions}
            onTaskLanguageChange={setTaskLanguage}
            onRepositoryLanguageChange={setRepositoryLanguage}
            onPathdrasilLanguageChange={setPathdrasilLanguage}
            onAutonomyChange={setAutonomy}
            onPermissionChange={(permission, enabled) =>
              setPermissions((current) => {
                const next = { ...current, [permission]: enabled }
                if (permission === 'pushBranch' && !enabled)
                  next.createPullRequest = false
                if (permission === 'createPullRequest' && enabled)
                  next.pushBranch = true
                return next
              })
            }
            shortcutsVisible={shortcutsVisible}
          />
        )}
        {activeStep === 5 && (
          <SummaryStep
            projectName={projectName}
            taskManager={
              taskProvider === 'gitlab-issues'
                ? 'GitLab Issues'
                : 'GitHub Issues'
            }
            taskSource={taskSource?.fullName ?? '—'}
            repositoriesCount={repositories.length}
            taskLanguage={taskLanguage}
            repositoryLanguage={repositoryLanguage}
            pathdrasilLanguage={pathdrasilLanguage}
            autonomy={
              autonomy === 'publikuj-draft-pr-mr'
                ? 'pracuj i wystaw draft PR/MR'
                : autonomy
            }
            publishPullRequest={permissions.createPullRequest}
          />
        )}
        {error && (
          <p className="text-danger mt-5 text-sm" role="alert">
            {error}
          </p>
        )}
      </SetupLayout>
      <DirectoryPickerDialog
        open={directoryTarget !== null}
        mode={directoryTarget?.field === 'worktree' ? 'worktree' : 'repository'}
        listing={directoryListing}
        loading={directoryLoading}
        error={directoryError}
        onClose={() => setDirectoryTarget(null)}
        onNavigate={(path) => {
          if (directoryTarget) void openDirectory(directoryTarget, path)
        }}
        onSelect={(path) => {
          if (directoryTarget)
            updateRepository(directoryTarget.index, directoryTarget.field, path)
          setDirectoryTarget(null)
        }}
      />
    </>
  )
}
