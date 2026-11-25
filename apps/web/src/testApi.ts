import { vi } from 'vitest'
import type { HiringManager, JobOpening } from './api/openings'

export const tomas: HiringManager = { id: 'm1', name: 'Tomas Eriksen' }
export const amara: HiringManager = { id: 'm2', name: 'Amara Okafor' }

export const published: JobOpening = {
  id: 'o1',
  title: 'Senior backend engineer',
  description: 'Backend role',
  hiringManager: tomas,
  vacancies: 2,
  status: 'Published',
  createdAt: '2026-01-01T00:00:00.000Z',
}

export const draft: JobOpening = {
  id: 'o2',
  title: 'Product designer',
  description: 'Design the onboarding flow.',
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
