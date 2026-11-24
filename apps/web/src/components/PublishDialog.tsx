import { useEffect, useRef, useState } from 'react'
import { publishOpening, type JobOpening } from '../api/openings'

interface Props {
  opening: JobOpening
  onClose: () => void
  onPublished: (opening: JobOpening) => void
}

export default function PublishDialog({ opening, onClose, onPublished }: Props) {
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    confirmRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function confirm() {
    setPublishing(true)
    setError(null)
    try {
      onPublished(await publishOpening(opening.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not publish this opening. Try again.')
      setPublishing(false)
    }
  }

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal modal-centered stack" role="dialog" aria-modal="true" aria-labelledby="publish-title">
        <h3 id="publish-title">Publish this opening?</h3>
        <p className="text-muted">
          “{opening.title}” is a draft, so applications are refused today. Once published, candidates can apply
          against it.
        </p>
        {error && (
          <div className="alert alert-danger" role="alert">
            <span>{error}</span>
          </div>
        )}
        <div className="cluster">
          <button ref={confirmRef} className="btn btn-primary" type="button" disabled={publishing} onClick={confirm}>
            {publishing ? 'Publishing…' : 'Publish opening'}
          </button>
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}
