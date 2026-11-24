import { useCallback, useState } from 'react'
import Toast from './components/Toast'
import JobOpeningsPage from './pages/JobOpeningsPage'
import NewOpeningPage from './pages/NewOpeningPage'

export default function App() {
  const [view, setView] = useState<'list' | 'new'>('list')
  const [highlightId, setHighlightId] = useState<string>()
  const [toast, setToast] = useState<string | null>(null)
  const dismissToast = useCallback(() => setToast(null), [])

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
