import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { json, mockApi, publicOpening } from '../testApi'
import OpenJobsPage from './OpenJobsPage'

afterEach(() => vi.unstubAllGlobals())

describe('OpenJobsPage', () => {
  it('lists an opening with title, location, type and closing date, sending no token (AC1, AC7)', async () => {
    const fetchMock = mockApi({ 'GET /public/openings': () => json([publicOpening]) })
    render(<OpenJobsPage />)
    expect(await screen.findByText(publicOpening.title)).toBeInTheDocument()
    expect(screen.getByText('Berlin, Germany')).toBeInTheDocument()
    expect(screen.getByText('Contract, 12 months')).toBeInTheDocument()
    expect(screen.getByText('15 January 2027')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Senior backend engineer/ })).toHaveAttribute('href', '/jobs/o1')
    expect((fetchMock.mock.calls[0][1] as RequestInit).headers).not.toHaveProperty('authorization')
  })

  it('shows Not specified for missing fields', async () => {
    mockApi({
      'GET /public/openings': () =>
        json([{ ...publicOpening, location: null, employmentType: null, closingDate: null }]),
    })
    render(<OpenJobsPage />)
    expect(await screen.findAllByText('Not specified')).toHaveLength(3)
  })

  it('says there are no open jobs when the list is empty (AC6)', async () => {
    mockApi({ 'GET /public/openings': () => json([]) })
    render(<OpenJobsPage />)
    expect(await screen.findByText('There are no open jobs right now')).toBeInTheDocument()
  })

  it('shows a busy state while loading', () => {
    mockApi({ 'GET /public/openings': () => new Promise<Response>(() => {}) })
    render(<OpenJobsPage />)
    expect(screen.getByRole('status', { name: 'Loading open jobs' })).toHaveAttribute('aria-busy', 'true')
  })

  it('shows an error and refetches on Try again', async () => {
    let calls = 0
    mockApi({
      'GET /public/openings': () => (++calls === 1 ? json({ error: 'x' }, 500) : json([publicOpening])),
    })
    render(<OpenJobsPage />)
    expect(await screen.findByText("We couldn't load the open jobs.")).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText(publicOpening.title)).toBeInTheDocument()
  })
})
