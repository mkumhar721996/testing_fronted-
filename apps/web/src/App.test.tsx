import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { amara, draft, json, mockApi, publicOpening, tomas } from './testApi'

afterEach(() => vi.unstubAllGlobals())

describe('App', () => {
  it('creates an opening and returns to the list with a toast', async () => {
    mockApi({
      'GET /me': () => json({ isHrAdmin: true }),
      'GET /hiring-managers': () => json([tomas, amara]),
      'GET /openings': () => json([]),
      'POST /openings': () => json(draft, 201),
    })
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Create a job opening' }))
    expect(screen.getByRole('heading', { name: 'New job opening' })).toBeInTheDocument()
    fireEvent.change(await screen.findByLabelText('Job title'), { target: { value: 'Product designer' } })
    fireEvent.change(screen.getByLabelText('Hiring manager'), { target: { value: 'm2' } })
    fireEvent.change(screen.getByLabelText('Number of vacancies'), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create opening' }))
    expect(await screen.findByRole('heading', { name: 'Job openings' })).toBeInTheDocument()
    expect(
      screen.getByText('Product designer created as a draft. Publish it when it is ready for applications.'),
    ).toBeInTheDocument()
  })
})

describe('App public portal', () => {
  afterEach(() => window.history.pushState({}, '', '/'))

  it('opens a listed job from /jobs without signing in (AC2)', async () => {
    mockApi({
      'GET /public/openings': () => json([publicOpening]),
      'GET /public/openings/o1': () => json(publicOpening),
    })
    window.history.pushState({}, '', '/jobs')
    render(<App />)
    fireEvent.click(await screen.findByRole('link', { name: /Senior backend engineer/ }))
    expect(await screen.findByRole('heading', { name: publicOpening.title })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/jobs/o1')
  })

  it('opens a detail address directly', async () => {
    mockApi({ 'GET /public/openings/o1': () => json(publicOpening) })
    window.history.pushState({}, '', '/jobs/o1')
    render(<App />)
    expect(await screen.findByText('15 January 2027')).toBeInTheDocument()
  })

  it('shows not-found for an unknown /jobs path (AC5)', async () => {
    mockApi({})
    window.history.pushState({}, '', '/jobs/a/b')
    render(<App />)
    expect(await screen.findByRole('heading', { name: "We can't find that job" })).toBeInTheDocument()
  })
})
