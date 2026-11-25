import { useCallback, useEffect, useState } from 'react'
import { listOpenJobs, type PublicOpening } from '../api/openings'
import { formatClosingDate, orNotSpecified } from '../formatOpening'

type Load = { state: 'loading' } | { state: 'error' } | { state: 'ready'; openings: PublicOpening[] }

export default function OpenJobsPage({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const [load, setLoad] = useState<Load>({ state: 'loading' })

  const refetch = useCallback(() => {
    setLoad({ state: 'loading' })
    listOpenJobs().then(
      (openings) => setLoad({ state: 'ready', openings }),
      () => setLoad({ state: 'error' }),
    )
  }, [])

  useEffect(refetch, [refetch])

  return (
    <div className="page">
      <header className="page-title">
        <h1>Open jobs</h1>
      </header>
      <div className="page-body">
        {load.state === 'loading' && (
          <div className="card" role="status" aria-label="Loading open jobs" aria-busy="true">
            <div className="skeleton skel-row" />
            <div className="skeleton skel-row" />
            <div className="skeleton skel-row" />
          </div>
        )}

        {load.state === 'error' && (
          <div className="alert alert-danger" role="alert">
            <span>We couldn't load the open jobs.</span>
            <button className="btn btn-secondary btn-sm" type="button" onClick={refetch}>
              Try again
            </button>
          </div>
        )}

        {load.state === 'ready' && load.openings.length === 0 && (
          <div className="card">
            <div className="empty-state">
              <h2>There are no open jobs right now</h2>
              <p>Check back soon.</p>
              <button className="btn btn-secondary btn-sm" type="button" onClick={refetch}>
                Refresh the list
              </button>
            </div>
          </div>
        )}

        {load.state === 'ready' && load.openings.length > 0 && (
          <>
            <span className="meta-line" aria-live="polite">
              {load.openings.length} open {load.openings.length === 1 ? 'job' : 'jobs'}
            </span>
            <ul className="page-body">
              {load.openings.map((o) => {
                const href = `/jobs/${encodeURIComponent(o.id)}`
                return (
                  <li key={o.id} className="card">
                    <a
                      href={href}
                      onClick={(e) => {
                        if (!onNavigate || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
                        e.preventDefault()
                        onNavigate(href)
                      }}
                    >
                      <h2>{o.title}</h2>
                    </a>
                    <dl className="meta-line">
                      <dt>Location</dt>
                      <dd>{orNotSpecified(o.location)}</dd>
                      <dt>Type</dt>
                      <dd>{orNotSpecified(o.employmentType)}</dd>
                      <dt>Closes</dt>
                      <dd>{formatClosingDate(o.closingDate)}</dd>
                    </dl>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
