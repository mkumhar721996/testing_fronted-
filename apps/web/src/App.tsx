import { useCallback, useState } from 'react'
import type { JobOpening } from './api/openings'
import Toast from './components/Toast'
import EditOpeningPage from './pages/EditOpeningPage'
import JobOpeningsPage from './pages/JobOpeningsPage'
import NewOpeningPage from './pages/NewOpeningPage'

export default function App() {
  const [view, setView] = useState<'list' | 'new' | 'edit'>('list')
  const [editing, setEditing] = useState<JobOpening | null>(null)
  const [highlightId, setHighlightId] = useState<string>()
  const [toast, setToast] = useState<string | null>(null)
  const dismissToast = useCallback(() => setToast(null), [])

  return (
    <>
      <main className="app-content">
        {view === 'list' && (
          <JobOpeningsPage
            highlightId={highlightId}
            onNew={() => setView('new')}
            onEdit={(opening) => {
              setEditing(opening)
              setView('edit')
            }}
            onToast={setToast}
          />
        )}
        {view === 'edit' && editing && (
          <EditOpeningPage
            opening={editing}
            onBack={() => setView('list')}
            onSaved={(saved) => {
              setHighlightId(saved.id)
              setToast(
                saved.status === 'Published'
                  ? `${saved.title} saved. The public portal shows the new details.`
                  : `${saved.title} saved. It is still a draft.`,
              )
              setView('list')
            }}
          />
        )}
        {view === 'new' && (
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
