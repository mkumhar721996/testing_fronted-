import type { ReactNode } from 'react'

export default function CareersLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="page-header">
        <nav aria-label="Careers">
          <strong>Careers</strong> · <a href="/jobs">Open jobs</a>
        </nav>
      </header>
      <main className="app-content">{children}</main>
    </>
  )
}
