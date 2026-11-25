import { useCallback, useEffect, useState } from 'react'
import CareersLayout from './components/CareersLayout'
import Toast from './components/Toast'
import JobDetailPage from './pages/JobDetailPage'
import JobNotFoundPage from './pages/JobNotFoundPage'
import JobOpeningsPage from './pages/JobOpeningsPage'
import NewOpeningPage from './pages/NewOpeningPage'
import OpenJobsPage from './pages/OpenJobsPage'

export default function App() {
  const [view, setView] = useState<'list' | 'new'>('list')
  const [highlightId, setHighlightId] = useState<string>()
  const [toast, setToast] = useState<string | null>(null)
  const [path, setPath] = useState(window.location.pathname)
  const dismissToast = useCallback(() => setToast(null), [])

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to: string) => {
    window.history.pushState({}, '', to)
    setPath(to)
  }, [])

  if (path === '/jobs' || path.startsWith('/jobs/')) {
    const segments = path.split('/').filter(Boolean)
    return (
      <CareersLayout>
        {segments.length === 1 ? (
          <OpenJobsPage onNavigate={navigate} />
        ) : segments.length === 2 ? (
          <JobDetailPage id={decodeURIComponent(segments[1])} onToast={setToast} />
        ) : (
          <JobNotFoundPage />
        )}
        {toast && <Toast message={toast} onDismiss={dismissToast} />}
      </CareersLayout>
    )
  }

  return (
    <>
      <main className="app-content">
        {view === 'list' ? (
          <JobOpeningsPage
            highlightId={highlightId}
            onNew={() => setView('new')}
            onToast={setToast}
          />
        ) : (
          <NewOpeningPage
            onCancel={() => setView('list')}
            onCreated={(opening, another) => {
              if (another) {
                setToast(`${opening.title} created as a draft. Add the next one.`)
                return
              }
              setHighlightId(opening.id)
              setToast(`${opening.title} created as a draft. Publish it when it is ready for applications.`)
              setView('list')
            }}
          />
        )}
      </main>
      {toast && <Toast message={toast} onDismiss={dismissToast} />}
    </>
  )
}
