import { useCallback, useEffect, useState } from 'react'
import { closeOpening, getMe, listOpenings, type JobOpening } from '../api/openings'
import Icon from '../components/Icon'
import PublishDialog from '../components/PublishDialog'

interface Props {
  onNew: () => void
  onToast: (message: string) => void
  highlightId?: string
}

type Load = { state: 'loading' } | { state: 'error' } | { state: 'ready'; openings: JobOpening[]; isHrAdmin: boolean }

const HEADER_COLUMNS = (
  <tr>
    <th>Opening</th>
    <th>Hiring manager</th>
    <th className="col-num">Vacancies</th>
    <th>Status</th>
    <th className="col-num">Action</th>
  </tr>
)

export default function JobOpeningsPage({ onNew, onToast, highlightId }: Props) {
  const [load, setLoad] = useState<Load>({ state: 'loading' })
  const [publishing, setPublishing] = useState<JobOpening | null>(null)

  const refetch = useCallback(() => {
    setLoad({ state: 'loading' })
    Promise.all([listOpenings(), getMe()]).then(
      ([openings, me]) => setLoad({ state: 'ready', openings, isHrAdmin: me.isHrAdmin }),
      () => setLoad({ state: 'error' }),
    )
  }, [])

  useEffect(refetch, [refetch])

  function replaceOpening(updated: JobOpening) {
    setLoad((cur) =>
      cur.state === 'ready'
        ? { ...cur, openings: cur.openings.map((o) => (o.id === updated.id ? updated : o)) }
        : cur,
    )
  }

  function handlePublished(updated: JobOpening) {
    replaceOpening(updated)
    setPublishing(null)
    onToast(`${updated.title} published. Applications can now be made against it.`)
  }

  async function handleClose(o: JobOpening) {
    try {
      const updated = await closeOpening(o.id)
      replaceOpening(updated)
      onToast(`${updated.title} closed. It no longer accepts applications.`)
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'We could not close the opening. Try again.')
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-title">
          <h2>Job openings</h2>
          <p className="text-muted">Applications can only be made against published openings.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" type="button" onClick={onNew}>
            <Icon name="plus" />
            New job opening
          </button>
        </div>
      </header>

      <div className="page-body">
        {load.state === 'loading' && (
          <div className="card" role="status" aria-label="Loading job openings">
            <div className="skeleton skel-row" />
            <div className="skeleton skel-row" />
            <div className="skeleton skel-row" />
          </div>
        )}

        {load.state === 'error' && (
          <div className="alert alert-danger" role="alert">
            <span>We could not load job openings. Check your connection and try again.</span>
            <button className="btn btn-secondary btn-sm" type="button" onClick={refetch}>
              Try again
            </button>
          </div>
        )}

        {load.state === 'ready' && load.openings.length === 0 && (
          <div className="card">
            <div className="empty-state">
              <h3>No job openings yet</h3>
              <p>Create an opening to name the role, its hiring manager and how many vacancies it covers.</p>
              <button className="btn btn-primary btn-sm" type="button" onClick={onNew}>
                Create a job opening
              </button>
            </div>
          </div>
        )}

        {load.state === 'ready' && load.openings.length > 0 && (
          <>
            {load.isHrAdmin ? (
              <div className="alert alert-info" role="status">
                <Icon name="flag" />
                <span>Draft openings refuse applications. Publish an opening when it is ready to receive them.</span>
              </div>
            ) : (
              <div className="alert alert-warning" role="status">
                <Icon name="user" />
                <span>Only HR admins can create or publish job openings. Ask an HR admin if an opening needs to go live.</span>
              </div>
            )}
            <div className="toolbar">
              <span className="meta-line" aria-live="polite">
                {load.openings.length} openings, {load.openings.filter((o) => o.status === 'Draft').length} in draft
              </span>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>{HEADER_COLUMNS}</thead>
                <tbody>
                  {load.openings.map((o) => (
                    <tr key={o.id} data-new={o.id === highlightId}>
                      <td>
                        {o.title}
                        <div className="meta-line">{o.id}</div>
                      </td>
                      <td data-label="Hiring manager">{o.hiringManager.name}</td>
                      <td className="col-num" data-label="Vacancies">
                        {o.vacancies}
                      </td>
                      <td data-label="Status">
                        <span className={o.status === 'Published' ? 'badge badge-success' : 'badge'}>{o.status}</span>
                      </td>
                      <td>
                        <div className="row-actions">
                          {o.status === 'Draft' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              type="button"
                              disabled={!load.isHrAdmin}
                              aria-label={load.isHrAdmin ? `Publish ${o.title}` : `Publish ${o.title}, HR admins only`}
                              onClick={() => setPublishing(o)}
                            >
                              Publish
                            </button>
                          )}
                          {o.status === 'Published' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              type="button"
                              disabled={!load.isHrAdmin}
                              aria-label={load.isHrAdmin ? `Close ${o.title}` : `Close ${o.title}, HR admins only`}
                              onClick={() => handleClose(o)}
                            >
                              Close
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {publishing && (
        <PublishDialog opening={publishing} onClose={() => setPublishing(null)} onPublished={handlePublished} />
      )}
    </div>
  )
}
