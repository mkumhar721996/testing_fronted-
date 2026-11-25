interface Props {
  title: string
  description: string
  vacancies: number
  published: boolean
  justSaved: boolean
}

/** Shows the saved values only, so it changes after Save and not while typing. */
export default function PortalPreview({ title, description, vacancies, published, justSaved }: Props) {
  return (
    <aside className="card portal-preview" aria-labelledby="pp-title">
      <h3 id="pp-title" className="text-lg">
        On the public portal
      </h3>
      <p className="text-muted text-sm">
        {published
          ? 'Candidates see the saved title and description. Changes appear here as soon as you save.'
          : 'This opening is a draft, so it is not on the portal yet. This is how it will read once published.'}
      </p>
      <div className="portal-frame">
        <h4>{title}</h4>
        <p>{description}</p>
        <div className="cluster">
          {published && <span className="badge badge-success">Open for applications</span>}
          <span className="meta-line">
            {vacancies} {vacancies === 1 ? 'vacancy' : 'vacancies'}
          </span>
        </div>
      </div>
      <span className="meta-line" aria-live="polite">
        {justSaved ? 'Saved just now. The portal now shows these details.' : ''}
      </span>
    </aside>
  )
}
