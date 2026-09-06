import { StrictMode } from 'react'
import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/nunito-sans/400.css'
import '@fontsource/nunito-sans/600.css'
import '@fontsource/nunito-sans/700.css'
import { CheckCircleIcon } from '@phosphor-icons/react'
import { Button } from './components/Button'
import { Topbar } from './components/Topbar'
import { ProjectSetupPage } from './pages/ProjectSetupPage'
import { WelcomePage } from './pages/WelcomePage'
import './tailwind.css'

const App = (): React.JSX.Element => {
  const [view, setView] = useState<'welcome' | 'setup' | 'complete'>('welcome')
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const editing =
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
        target.isContentEditable
      if (
        view === 'welcome' &&
        !editing &&
        (event.key.toLowerCase() === 'n' || event.key === 'Enter')
      ) {
        event.preventDefault()
        setView('setup')
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [view])

  if (view === 'setup')
    return (
      <ProjectSetupPage
        onCancel={() => setView('welcome')}
        onComplete={() => setView('complete')}
      />
    )
  if (view === 'complete')
    return (
      <main className="bg-welcome text-text min-h-screen px-6 py-6 sm:px-10">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
          <Topbar title="Projekt utworzony" />
          <div className="grid flex-1 place-items-center p-6">
            <div className="grid max-w-md gap-5 text-center">
              <CheckCircleIcon
                className="text-brand mx-auto"
                size={56}
                weight="duotone"
                aria-hidden="true"
              />
              <h2 className="text-heading text-4xl font-semibold">
                Projekt utworzony
              </h2>
              <p className="text-muted">
                Konfiguracja została przygotowana. Synchronizacja integracji
                będzie kolejnym krokiem.
              </p>
              <Button type="button" onClick={() => setView('welcome')}>
                Wróć do projektów
              </Button>
            </div>
          </div>
        </div>
      </main>
    )
  return <WelcomePage onCreate={() => setView('setup')} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
