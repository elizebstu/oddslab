import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from './context/ThemeContext'
import { LoadingProvider } from './contexts/LoadingContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'
import './i18n'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <LoadingProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </LoadingProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
)
