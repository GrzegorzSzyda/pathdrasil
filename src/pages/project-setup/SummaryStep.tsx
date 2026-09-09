import {
  CheckCircleIcon,
  CodeIcon,
  FolderSimpleIcon,
  GithubLogoIcon,
  RobotIcon,
  SlidersHorizontalIcon,
} from '@phosphor-icons/react'

const Row = ({
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
type Props = {
  projectName: string
  taskManager: string
  taskSource: string
  repositoriesCount: number
  taskLanguage: string
  repositoryLanguage: string
  pathdrasilLanguage: string
  autonomy: string
  publishPullRequest: boolean
}
export const SummaryStep = ({
  projectName,
  taskManager,
  taskSource,
  repositoriesCount,
  taskLanguage,
  repositoryLanguage,
  pathdrasilLanguage,
  autonomy,
  publishPullRequest,
}: Props): React.JSX.Element => (
  <div className="border-border divide-border bg-page-deep divide-y rounded-2xl border">
    <Row
      label="Projekt"
      value={projectName || '—'}
      icon={<SlidersHorizontalIcon />}
    />
    <Row label="Menedżer zadań" value={taskManager} icon={<GithubLogoIcon />} />
    <Row
      label="Projekt z taskami"
      value={taskSource}
      icon={<FolderSimpleIcon />}
    />
    <Row
      label="Repozytoria"
      value={`${repositoriesCount} ${repositoriesCount === 1 ? 'repozytorium' : 'repozytoria'}`}
      icon={<CodeIcon />}
    />
    <Row label="Agent" value="Codex CLI" icon={<RobotIcon />} />
    <Row label="Język tasków" value={taskLanguage} icon={<CheckCircleIcon />} />
    <Row
      label="Język repozytorium"
      value={repositoryLanguage}
      icon={<CheckCircleIcon />}
    />
    <Row
      label="Język pracy"
      value={pathdrasilLanguage}
      icon={<CheckCircleIcon />}
    />
    <Row label="Autonomia" value={autonomy} icon={<CheckCircleIcon />} />
    <Row
      label="Publikacja"
      value={publishPullRequest ? 'draft PR/MR' : 'ręczna'}
      icon={<CheckCircleIcon />}
    />
  </div>
)
