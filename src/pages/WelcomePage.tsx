import { PlusIcon } from '@phosphor-icons/react'
import { Button } from '../components/Button'
import { Heading } from '../components/Heading'
import { Kbd } from '../components/Kbd'
import { Topbar } from '../components/Topbar'

type WelcomePageProps = {
  onCreate: () => void
  onToggleShortcuts: () => void
  shortcutsVisible: boolean
}

export const WelcomePage = ({
  onCreate,
  onToggleShortcuts,
  shortcutsVisible,
}: WelcomePageProps): React.JSX.Element => (
  <main className="bg-welcome text-text min-h-screen px-6 py-8 text-base sm:px-10">
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col">
      <Topbar
        onToggleShortcuts={onToggleShortcuts}
        shortcutsVisible={shortcutsVisible}
      />
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Heading as="h2" level="h1">
          Zacznijmy od projektu
        </Heading>
        <p className="mt-5 mb-8 max-w-md text-base leading-relaxed">
          Dodaj lokalne repozytorium, aby zbudować swoją pierwszą przestrzeń
          pracy
        </p>
        <Button type="button" onClick={onCreate}>
          <PlusIcon size={20} weight="bold" aria-hidden="true" />
          <span>Dodaj projekt</span>
          {shortcutsVisible && <Kbd>N / Enter</Kbd>}
        </Button>
      </div>
    </div>
  </main>
)
