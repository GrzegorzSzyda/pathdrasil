import {
  CheckCircleIcon,
  CodeIcon,
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
  repositoriesCount: number
  language: string
  autonomy: string
}
export const SummaryStep = ({
  projectName,
  repositoriesCount,
  language,
  autonomy,
}: Props): React.JSX.Element => (
  <div className="border-border divide-border bg-page-deep divide-y rounded-2xl border">
    <Row
      label="Projekt"
      value={projectName || '—'}
      icon={<SlidersHorizontalIcon />}
    />
    <Row label="Task manager" value="GitHub Issues" icon={<GithubLogoIcon />} />
    <Row
      label="Repozytoria"
      value={`${repositoriesCount} ${repositoriesCount === 1 ? 'repozytorium' : 'repozytoria'}`}
      icon={<CodeIcon />}
    />
    <Row label="Agent" value="Codex CLI" icon={<RobotIcon />} />
    <Row
      label="Język / autonomia"
      value={`${language} · ${autonomy}`}
      icon={<CheckCircleIcon />}
    />
  </div>
)
