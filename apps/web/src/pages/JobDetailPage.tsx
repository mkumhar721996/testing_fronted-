import { useEffect, useState } from 'react'
import { ApiError, getOpenJob, type PublicOpening } from '../api/openings'
import { formatClosingDate, orNotSpecified } from '../formatOpening'
import JobNotFoundPage from './JobNotFoundPage'

type Load =
  | { state: 'loading' }
  | { state: 'error' }
  | { state: 'not_found' }
  | { state: 'ready'; opening: PublicOpening }

/** Plain-text description: "## " lines are headings, "- " lines are bullets. Always rendered as text nodes. */
function Description({ text }: { text: string }) {
  return (
    <div>
      {text.split('\n').map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>
        if (line.startsWith('- ')) return <li key={i}>{line.slice(2)}</li>
        return line.trim() ? <p key={i}>{line}</p> : null
      })}
    </div>
  )
}

export default function JobDetailPage({ id, onToast }: { id: string; onToast: (message: string) => void }) {
  const [load, setLoad] = useState<Load>({ state: 'loading' })

  useEffect(() => {
    let current = true
    setLoad({ state: 'loading' })
    getOpenJob(id).then(
      (opening) => current && setLoad({ state: 'ready', opening }),
      (err) => current && setLoad({ state: err instanceof ApiError && err.status === 404 ? 'not_found' : 'error' }),
    )
    return () => {
      current = false
    }
  }, [id])

  if (load.state === 'not_found') return <JobNotFoundPage />

  return (
    <div className="page">
      {load.state === 'loading' && (
        <div className="card" role="status" aria-label="Loading job" aria-busy="true">
          <div className="skeleton skel-row" />
          <div className="skeleton skel-row" />
        </div>
      )}

      {load.state === 'error' && (
        <div className="alert alert-danger" role="alert">
          <span>We couldn't load the open jobs.</span>
          <a className="btn btn-secondary btn-sm" href="/jobs">
            View open jobs
          </a>
        </div>
      )}

      {load.state === 'ready' && (
        <>
          <header className="page-title">
            <h1>{load.opening.title}</h1>
            <span className="badge badge-success">Open for applications</span>
          </header>
          <dl className="card">
            <div>
              <dt>Location</dt>
              <dd>{orNotSpecified(load.opening.location)}</dd>
            </div>
            <div>
              <dt>Employment type</dt>
              <dd>{orNotSpecified(load.opening.employmentType)}</dd>
            </div>
            <div>
              <dt>Closing date</dt>
              <dd>{formatClosingDate(load.opening.closingDate)}</dd>
            </div>
          </dl>
          {load.opening.description && <Description text={load.opening.description} />}
          <div className="page-actions">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => onToast('Applying opens in a separate step')}
            >
              Apply for this job
            </button>
          </div>
        </>
      )}
    </div>
  )
}
