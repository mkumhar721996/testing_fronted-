export type OpeningStatus = 'Draft' | 'Published' | 'Closed'

export interface HiringManager {
  id: string
  name: string
}

export interface JobOpening {
  id: string
  title: string
  hiringManager: HiringManager
  vacancies: number
  status: OpeningStatus
  createdAt: string
}

export interface NewOpening {
  title: string
  hiringManagerId: string
  vacancies: number
}

export class ApiError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type TokenProvider = () => Promise<string | undefined> | string | undefined

const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3000'

let getAccessToken: TokenProvider = () => undefined

/** Sign-in is a separate story: whatever signs the person in registers its token source here. */
export function setAccessTokenProvider(provider: TokenProvider): void {
  getAccessToken = provider
}

async function request<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = await getAccessToken()
  const headers: Record<string, string> = {}
  if (token) headers.authorization = `Bearer ${token}`
  if (init.body !== undefined) headers['content-type'] = 'application/json'
  const res = await fetch(`${baseUrl}${path}`, {
    method: init.method ?? 'GET',
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  })
  if (!res.ok) {
    const detail = (await res.json().catch(() => null)) as { error?: string; message?: string } | null
    throw new ApiError(res.status, detail?.error ?? detail?.message ?? `Request failed (${res.status})`)
  }
  return (await res.json()) as T
}

export const getMe = () => request<{ isHrAdmin: boolean }>('/me')
export const listHiringManagers = () => request<HiringManager[]>('/hiring-managers')
export const listOpenings = () => request<JobOpening[]>('/openings')
export const createOpening = (body: NewOpening) =>
  request<JobOpening>('/openings', { method: 'POST', body })
export const closeOpening = (id: string) =>
  request<JobOpening>(`/openings/${encodeURIComponent(id)}/close`, { method: 'POST' })
export const publishOpening = (id: string) =>
  request<JobOpening>(`/openings/${encodeURIComponent(id)}/publish`, { method: 'POST' })
