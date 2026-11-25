import { vi } from 'vitest'
import type { HiringManager, JobOpening, PublicOpening } from './api/openings'

export const tomas: HiringManager = { id: 'm1', name: 'Tomas Eriksen' }
export const amara: HiringManager = { id: 'm2', name: 'Amara Okafor' }

export const published: JobOpening = {
  id: 'o1',
  title: 'Senior backend engineer',
  hiringManager: tomas,
  vacancies: 2,
  status: 'Published',
  createdAt: '2026-01-01T00:00:00.000Z',
}

export const draft: JobOpening = {
  id: 'o2',
  title: 'Product designer',
  hiringManager: amara,
  vacancies: 1,
  status: 'Draft',
  createdAt: '2026-01-02T00:00:00.000Z',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

/** Stubs global fetch with a path-routed fake API; override a route with a function or a Response. */
export function mockApi(routes: Record<string, (init: RequestInit) => Response | Promise<Response>>) {
  const fetchMock = vi.fn(async (url: string, init: RequestInit = {}) => {
    const path = new URL(url).pathname
    const handler = routes[`${init.method ?? 'GET'} ${path}`]
    if (!handler) return json({ error: `unmocked ${path}` }, 500)
    return handler(init)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

export { json }

export const publicOpening: PublicOpening = {
  id: 'o1',
  title: 'Senior backend engineer',
  location: 'Berlin, Germany',
  employmentType: 'Contract, 12 months',
  closingDate: '2027-01-15',
  description:
    '## About the role\nJoin the finance team to build and maintain our rolling 18-month forecast.\n- Own the forecast model',
}
