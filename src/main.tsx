import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/nunito-sans/400.css'
import '@fontsource/nunito-sans/600.css'
import '@fontsource/nunito-sans/700.css'
import { WelcomePage } from './pages/WelcomePage'
import './tailwind.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WelcomePage />
  </StrictMode>,
)
