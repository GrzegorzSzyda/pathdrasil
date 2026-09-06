import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/nunito-sans/400.css'
import '@fontsource/nunito-sans/600.css'
import '@fontsource/nunito-sans/700.css'
import { CheckCircleIcon } from '@phosphor-icons/react'
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { Button } from './components/Button'
import { Topbar } from './components/Topbar'
import { ProjectSetupPage } from './pages/ProjectSetupPage'
import { WelcomePage } from './pages/WelcomePage'
import './tailwind.css'

const WelcomeRoute = (): React.JSX.Element => {
  const navigate = useNavigate()
  const [shortcutsVisible, setShortcutsVisible] = useState(false)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const editing =
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
        target.isContentEditable
      if (editing) return
      if (event.key === '?') {
        event.preventDefault()
        setShortcutsVisible((visible) => !visible)
      }
      if (event.key.toLowerCase() === 'n' || event.key === 'Enter') {
        event.preventDefault()
        navigate('/projects/new')
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [navigate])
  return (
    <WelcomePage
      onCreate={() => navigate('/projects/new')}
      shortcutsVisible={shortcutsVisible}
    />
  )
}

const CreatedRoute = (): React.JSX.Element => {
  const navigate = useNavigate()
  return (
    <main className="bg-welcome text-text min-h-screen px-6 py-6 sm:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <Topbar />
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
            <Button type="button" onClick={() => navigate('/')}>
              Wróć do projektów
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

const SetupRoute = (): React.JSX.Element => {
  const navigate = useNavigate()
  return (
    <ProjectSetupPage
      onCancel={() => navigate('/')}
      onComplete={() => navigate('/projects/created')}
    />
  )
}

const App = (): React.JSX.Element => {
  const location = useLocation()
  return (
    <Routes location={location}>
      <Route path="/" element={<WelcomeRoute />} />
      <Route path="/projects/new/*" element={<SetupRoute />} />
      <Route path="/projects/created" element={<CreatedRoute />} />
      <Route path="*" element={<WelcomeRoute />} />
    </Routes>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
