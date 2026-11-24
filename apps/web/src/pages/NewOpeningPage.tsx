import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createOpening, getMe, listHiringManagers, type HiringManager, type JobOpening } from '../api/openings'
import Icon from '../components/Icon'

interface Props {
  onCreated: (opening: JobOpening, another: boolean) => void
  onCancel: () => void
}

type Field = 'title' | 'manager' | 'vacancies'
type Errors = Partial<Record<Field, true>>

const FIELD_ORDER: Field[] = ['title', 'manager', 'vacancies']
const FIELD_ERRORS: Record<Field, string> = {
  title: 'Enter a job title.',
  manager: 'Choose a hiring manager.',
  vacancies: 'Enter a vacancy count of 1 or more.',
}

export default function NewOpeningPage({ onCreated, onCancel }: Props) {
  const [isHrAdmin, setIsHrAdmin] = useState(true)
  const [managers, setManagers] = useState<HiringManager[]>([])
  const [title, setTitle] = useState('')
  const [managerId, setManagerId] = useState('')
  const [vacancies, setVacancies] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [failure, setFailure] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const refs = {
    title: useRef<HTMLInputElement>(null),
    manager: useRef<HTMLSelectElement>(null),
    vacancies: useRef<HTMLInputElement>(null),
  }

  useEffect(() => {
    getMe().then((me) => setIsHrAdmin(me.isHrAdmin), () => {})
    listHiringManagers().then(setManagers, () => setFailure('We could not load the hiring managers. Try again.'))
  }, [])

  async function submit(e: FormEvent | null, another: boolean) {
    e?.preventDefault()
    if (saving) return
    const count = Number(vacancies)
    const found: Errors = {}
    if (title.trim() === '') found.title = true
    if (managerId === '') found.manager = true
    if (vacancies === '' || !Number.isInteger(count) || count < 1) found.vacancies = true
    setErrors(found)
    const first = FIELD_ORDER.find((f) => found[f])
    if (first) {
      setFailure('The opening was not created. Fill in the fields marked below and try again.')
      refs[first].current?.focus()
      return
    }
    setFailure(null)
    setSaving(true)
    try {
      const created = await createOpening({ title: title.trim(), hiringManagerId: managerId, vacancies: count })
      if (another) {
        setTitle('')
        setManagerId('')
        setVacancies('')
        setSaving(false)
        refs.title.current?.focus()
      }
      onCreated(created, another)
    } catch (err) {
      setFailure(err instanceof Error ? err.message : 'The opening was not created. Try again.')
      setSaving(false)
    }
  }

  const disabled = !isHrAdmin
  const invalid = (f: Field) => (errors[f] ? true : undefined)

  return (
    <div className="page">
      <header className="page-header">
        <div className="page-title">
          <h2>New job opening</h2>
          <p className="text-muted">The opening is saved as a draft. Publish it from the list when it is ready.</p>
        </div>
      </header>
      <div className="page-body">
        <form className="form-page stack" noValidate onSubmit={(e) => submit(e, false)}>
          {disabled && (
            <div className="alert alert-warning" role="status">
              <Icon name="user" />
              <span>Only HR admins can create job openings. Your account does not have this permission.</span>
            </div>
          )}
          {!disabled && failure && (
            <div className="alert alert-danger" role="alert">
              <span>{failure}</span>
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
            <label htmlFor="f-manager">Hiring manager</label>
            <select
              ref={refs.manager}
              className={errors.manager ? 'select is-invalid' : 'select'}
              id="f-manager"
              value={managerId}
              disabled={disabled}
              aria-invalid={invalid('manager')}
              aria-describedby={errors.manager ? 'e-manager' : undefined}
              onChange={(e) => setManagerId(e.target.value)}
            >
              <option value="">Choose a hiring manager</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            {errors.manager && (
              <span className="field-error" id="e-manager">
                {FIELD_ERRORS.manager}
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
              disabled={disabled}
              aria-invalid={invalid('vacancies')}
              aria-describedby={errors.vacancies ? 'h-vac e-vac' : 'h-vac'}
              onChange={(e) => setVacancies(e.target.value)}
            />
            <span className="field-hint" id="h-vac">
              How many people you plan to hire into this role.
            </span>
            {errors.vacancies && (
              <span className="field-error" id="e-vac">
                {FIELD_ERRORS.vacancies}
              </span>
            )}
          </div>

          {!disabled && (
            <div className="field">
              <span className="text-sm font-medium">Status</span>
              <div className="readonly-status">
                <span className="badge">Draft</span>
                <span className="field-hint">New openings start as drafts and do not accept applications.</span>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={disabled || saving}>
              {saving ? 'Creating…' : 'Create opening'}
            </button>
            {disabled ? (
              <button className="btn btn-ghost" type="button" onClick={onCancel}>
                Back to job openings
              </button>
            ) : (
              <>
                <button className="btn btn-secondary" type="button" disabled={saving} onClick={() => submit(null, true)}>
                  Create and add another
                </button>
                <button className="btn btn-ghost" type="button" onClick={onCancel}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
