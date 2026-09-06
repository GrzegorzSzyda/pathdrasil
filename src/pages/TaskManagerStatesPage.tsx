import {
  CheckCircleIcon,
  CodeIcon,
  GithubLogoIcon,
  LockKeyIcon,
  WarningCircleIcon,
  WrenchIcon,
} from '@phosphor-icons/react'
import { Button } from '../components/Button'
import { Topbar } from '../components/Topbar'

type StateCardProps = {
  title: string
  description: string
  badge: string
  tone: 'available' | 'selected' | 'soon' | 'auth' | 'error'
  icon: React.ReactNode
}

const StateCard = ({
  title,
  description,
  badge,
  tone,
  icon,
}: StateCardProps): React.JSX.Element => (
  <article
    className={`grid gap-4 rounded-2xl border p-5 ${tone === 'selected' ? 'border-brand bg-brand/10 ring-brand/30 ring-1' : 'border-border bg-page-deep'}`}
  >
    <div className="flex items-start justify-between gap-4">
      <span className="bg-surface text-heading grid size-11 place-items-center rounded-lg">
        {icon}
      </span>
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone === 'available' || tone === 'selected' ? 'bg-brand/15 text-brand-soft' : tone === 'soon' ? 'bg-surface text-muted' : tone === 'auth' ? 'bg-amber-400/15 text-amber-200' : 'bg-danger/15 text-red-200'}`}
      >
        {badge}
      </span>
    </div>
    <div>
      <h2 className="text-heading font-semibold">{title}</h2>
      <p className="text-muted mt-1 text-sm leading-relaxed">{description}</p>
    </div>
    <div className="text-muted flex items-center gap-2 text-xs">
      {tone === 'available' || tone === 'selected' ? (
        <CheckCircleIcon className="text-brand" weight="bold" />
      ) : tone === 'soon' || tone === 'auth' ? (
        <LockKeyIcon />
      ) : (
        <WarningCircleIcon className="text-danger" />
      )}{' '}
      {tone === 'available'
        ? 'Można wybrać'
        : tone === 'selected'
          ? 'Aktualnie wybrane'
          : tone === 'soon'
            ? 'Implementacja planowana'
            : tone === 'auth'
              ? 'Wymaga konfiguracji'
              : 'Wymaga ponowienia'}
    </div>
  </article>
)

export const TaskManagerStatesPage = ({
  onBack,
}: {
  onBack: () => void
}): React.JSX.Element => (
  <main className="bg-page text-text min-h-screen px-6 py-6 sm:px-10">
    <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
      <Topbar />
      <div className="mx-auto w-full max-w-4xl flex-1 py-10">
        <Button type="button" appearance="ghost" onClick={onBack}>
          ← Wróć do konfiguracji
        </Button>
        <h1 className="text-heading mt-8 text-4xl font-semibold tracking-tight">
          Stany integracji task managera
        </h1>
        <p className="text-muted mt-4 max-w-2xl text-base leading-relaxed">
          Widok demonstracyjny wszystkich stanów, które może mieć boks
          providera. To dane testowe — nie reprezentują jeszcze faktycznej
          odpowiedzi backendu.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <StateCard
            title="GitHub Issues"
            description="Dostęp przez lokalnie autoryzowane gh."
            badge="Dostępny"
            tone="available"
            icon={<GithubLogoIcon size={25} />}
          />
          <StateCard
            title="GitHub Issues · konto firmowe"
            description="Ten sam provider, wybrane inne konto CLI."
            badge="Wybrany"
            tone="selected"
            icon={<GithubLogoIcon size={25} />}
          />
          <StateCard
            title="Linear"
            description="Integracja przez API zostanie dodana później."
            badge="Wkrótce"
            tone="soon"
            icon={<WrenchIcon size={24} />}
          />
          <StateCard
            title="GitLab Issues"
            description="Nie znaleziono autoryzowanego narzędzia glab."
            badge="Brak autoryzacji"
            tone="auth"
            icon={<CodeIcon size={24} />}
          />
          <StateCard
            title="Jira"
            description="Ostatnia próba połączenia zakończyła się błędem."
            badge="Błąd połączenia"
            tone="error"
            icon={<WarningCircleIcon size={24} />}
          />
          <StateCard
            title="GitHub Enterprise"
            description="Provider dostępny, ale konto nie ma wymaganych uprawnień."
            badge="Brak uprawnień"
            tone="error"
            icon={<LockKeyIcon size={24} />}
          />
        </div>
      </div>
    </div>
  </main>
)
