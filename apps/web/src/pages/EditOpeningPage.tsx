import { useEffect, useRef, useState, type FormEvent } from 'react'
import { getMe, listPortalOpenings, updateOpening, type JobOpening, type OpeningEdit } from '../api/openings'
import Icon from '../components/Icon'
import PortalPreview from '../components/PortalPreview'

interface Props {
  opening: JobOpening
  onBack: () => void
  onSaved: (opening: JobOpening) => void
}

type Field = 'title' | 'description' | 'vacancies'
type Errors = Partial<Record<Field, true>>

const FIELD_ORDER: Field[] = ['title', 'description', 'vacancies']
const FIELD_ERRORS: Record<Field, string> = {
  title: 'Enter a job title.',
  description: 'Enter a description so candidates know what the role involves.',
  vacancies: 'Enter a vacancy count of 1 or more.',
}

interface Shown {
  title: string
  description: string
  vacancies: number
}

export default function EditOpeningPage({ opening, onBack, onSaved }: Props) {
  const [isHrAdmin, setIsHrAdmin] = useState<boolean | null>(null)
  const [title, setTitle] = useState(opening.title)
  const [description, setDescription] = useState(opening.description)
  const [vacancies, setVacancies] = useState(String(opening.vacancies))
  const [errors, setErrors] = useState<Errors>({})
  const [invalidAlert, setInvalidAlert] = useState(false)
  const [failed, setFailed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [shown, setShown] = useState<Shown>(opening)
  const refs = {
    title: useRef<HTMLInputElement>(null),
    description: useRef<HTMLTextAreaElement>(null),
    vacancies: useRef<HTMLInputElement>(null),
  }
  const published = opening.status === 'Published'

  useEffect(() => {
    getMe().then((me) => setIsHrAdmin(me.isHrAdmin), () => setIsHrAdmin(false))
  }, [])

  async function submit(e: FormEvent | null) {
    e?.preventDefault()
    if (saving) return
    const count = Number(vacancies)
    const found: Errors = {}
    if (title.trim() === '') found.title = true
    if (description.trim() === '') found.description = true
    if (!published && (vacancies === '' || !Number.isInteger(count) || count < 1)) found.vacancies = true
    setErrors(found)
    const first = FIELD_ORDER.find((f) => found[f])
    setInvalidAlert(Boolean(first))
    if (first) {
      refs[first].current?.focus()
      return
    }
    const edit: OpeningEdit = { title: title.trim(), description: description.trim() }
    if (!published) edit.vacancies = count
    setFailed(false)
    setJustSaved(false)
    setSaving(true)
    try {
      const saved = await updateOpening(opening.id, edit)
      let next: Shown = saved
      if (published) {
        const live = await listPortalOpenings().then(
          (all) => all.find((p) => p.id === saved.id),
          () => undefined,
        )
        if (live) next = live
      }
      setShown(next)
      setJustSaved(true)
      onSaved(saved)
    } catch {
      setFailed(true)
    } finally {
      setSaving(false)
    }
  }

  const disabled = !isHrAdmin
  const invalid = (f: Field) => (errors[f] ? true : undefined)

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-title">
          <h2>Edit {opening.title}</h2>
          <p className="text-muted">
            {opening.id}, hiring manager {opening.hiringManager.name}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" type="button" onClick={onBack}>
            Back to job openings
          </button>
        </div>
      </header>
      <div className="page-body">
        {isHrAdmin === null ? (
          <div className="form-page card" role="status" aria-label="Loading job opening">
            <div className="skeleton skel-row" />
            <div className="skeleton skel-row" />
            <div className="skeleton skel-row" />
          </div>
        ) : (
          <div className="edit-layout">
            <form className="form-page stack" noValidate onSubmit={submit}>
              {disabled && (
                <div className="alert alert-warning" role="status">
                  <Icon name="user" />
                  <span>
                    Only HR admins can edit job openings. Your account does not have this permission, so the opening
                    stays as it is.
                  </span>
                </div>
              )}
              {!disabled && invalidAlert && (
                <div className="alert alert-danger" role="alert">
                  <span>Your changes were not saved. Fill in the fields marked below and try again.</span>
                </div>
              )}
              {!disabled && failed && (
                <div className="alert alert-danger" role="alert">
                  <span>
                    We could not save your changes. Your edits are still in the form, so nothing is lost. Try saving
                    again.
                  </span>
                  <button className="btn btn-secondary btn-sm" type="button" onClick={() => submit(null)}>
                    Try again
                  </button>
                </div>
              )}

              <div className="field">
                <label htmlFor="f-title">Job title</label>
                <input
                  ref={refs.title}
                  className={errors.title ? 'input is-invalid' : 'input'}
                  id="f-title"
                  autoComplete="off"
                  value={title}
                  disabled={disabled}
                  aria-invalid={invalid('title')}
                  aria-describedby={errors.title ? 'e-title' : undefined}
                  onChange={(e) => setTitle(e.target.value)}
                />
                {errors.title && (
                  <span className="field-error" id="e-title">
                    {FIELD_ERRORS.title}
                  </span>
                )}
              </div>

              <div className="field">
                <label htmlFor="f-desc">Description</label>
                <textarea
                  ref={refs.description}
                  className={errors.description ? 'input is-invalid' : 'input'}
                  id="f-desc"
                  rows={4}
                  value={description}
                  disabled={disabled}
                  aria-invalid={invalid('description')}
                  aria-describedby={errors.description ? 'e-desc' : undefined}
                  onChange={(e) => setDescription(e.target.value)}
                />
                {errors.description && (
                  <span className="field-error" id="e-desc">
                    {FIELD_ERRORS.description}
                  </span>
                )}
              </div>

              <div className="field">
                <label htmlFor="f-vac">Number of vacancies</label>
                <input
                  ref={refs.vacancies}
                  className={errors.vacancies ? 'input is-invalid' : 'input'}
                  id="f-vac"
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={vacancies}
                  disabled={disabled || published}
                  aria-invalid={invalid('vacancies')}
                  aria-describedby={errors.vacancies ? 'h-vac e-vac' : 'h-vac'}
                  onChange={(e) => setVacancies(e.target.value)}
                />
                <span className="field-hint lock-note" id="h-vac">
                  {published
                    ? `The vacancy count is locked once an opening is published. It stays at ${opening.vacancies}.`
                    : 'How many people you plan to hire. You can change this until the opening is published.'}
                </span>
                {errors.vacancies && (
                  <span className="field-error" id="e-vac">
                    {FIELD_ERRORS.vacancies}
                  </span>
                )}
              </div>

              <div className="field">
                <span className="text-sm font-medium">Status</span>
                <div className="readonly-status">
                  <span className={published ? 'badge badge-success' : 'badge'}>{opening.status}</span>
                  <span className="field-hint">
                    {published
                      ? 'Published openings are live on the public portal.'
                      : 'Drafts are not shown on the portal and refuse applications.'}
                  </span>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={disabled || saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                <button className="btn btn-ghost" type="button" onClick={onBack}>
                  {disabled ? 'Back to job openings' : 'Cancel'}
                </button>
              </div>
            </form>

            <PortalPreview {...shown} published={published} justSaved={justSaved} />
          </div>
        )}
      </div>
    </div>
  )
}
