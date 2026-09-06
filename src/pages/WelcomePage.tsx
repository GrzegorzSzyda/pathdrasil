import { PlusIcon } from '@phosphor-icons/react'
import { Button } from '../components/Button'
import { Header } from '../components/Header'
import { Heading } from '../components/Heading'

export const WelcomePage = (): React.JSX.Element => (
  <main className="bg-welcome text-text min-h-screen px-6 py-8 text-base sm:px-10">
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col">
      <Header />
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Heading as="h1" level="h1">
          Zacznijmy od projektu
        </Heading>
        <p className="mt-5 mb-8 max-w-md text-base leading-relaxed">
          Dodaj lokalne repozytorium, aby zbudować swoją pierwszą przestrzeń
          pracy
        </p>
        <Button type="button">
          <PlusIcon size={20} weight="bold" aria-hidden="true" />
          <span>Dodaj projekt</span>
        </Button>
      </div>
    </div>
  </main>
)
