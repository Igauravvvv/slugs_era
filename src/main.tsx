import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { SiteContentProvider } from './context/SiteContentContext'
import ErrorBoundary from './components/ErrorBoundary'
import { CartLoginProvider } from './context/CartLoginContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
})

const rootElement = document.getElementById('root')!;
// Build-generated route HTML gives non-JavaScript crawlers useful semantic
// content. The interactive application replaces that fallback immediately.
rootElement.replaceChildren();

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <CartLoginProvider>
                <SiteContentProvider>
                  <App />
                </SiteContentProvider>
              </CartLoginProvider>
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
)
