export default function JobNotFoundPage() {
  return (
    <div className="card">
      <div className="empty-state">
        <h2>We can't find that job</h2>
        <p>It may have been filled or taken down.</p>
        <a className="btn btn-primary btn-sm" href="/jobs">
          View open jobs
        </a>
      </div>
    </div>
  )
}
